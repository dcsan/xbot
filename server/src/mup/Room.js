const debug = require('debug')('mup:Room')
const Item = require('./Item')
const Logger = require('../lib/Logger')
const SlackAdapter = require('../lib/adapters/SlackAdapter')
const GameObject = require('./GameObject')
const Actor = require('./Actor')
const Util = require('../lib/Util')
const WordUtils = require('../lib/WordUtils')
const RexParser = require('./parser/RexParser')

class Room extends GameObject {

  constructor(doc, story) {
    super(doc)
    this.story = story  // handle to its parent
    this.reset()
  }

  reset () {
    this.items = []
    this.hintStep = this.doc.setHint || 'start'
    this.doc.items?.forEach((itemData) => {
      const item = new Item(itemData, this)
      this.items.push(item)
      item.reset()
    })
  }

  get name() {
    return this.doc.name
  }

  get player () {
    // not sure about this reaching back up the tree...
    return this.story.game.player
  }

  loadActors () {
    const allActors = this.doc.actors
    Logger.log('loading actors:', allActors?.length)
    this.actors = []
    // @ts-ignore
    allActors?.map( actorDoc => {
      const actor = new Actor(actorDoc, this)
      this.actors.push(actor)
    })
  }

  async things (context) {
    const msg = this.items.map(thing => thing.name)
    context.sendText( msg.join(','))
  }

  itemFormalNamesOneLine () {
    const names = this.items.map(item => {
      return item.article + ' `' + item.formalName + '`'   // tick marks to highlight
    })
    return names.join(', ')
  }

  itemCnames () {
    const names = this.items.map(item => {
      return item.cname
    })
    return names
  }

  async look (context) {
    Logger.log('room.look')
    const firstActor = this.firstActor()
    const itemsInfo = `You see ` + this.itemFormalNamesOneLine()
    const blocks = [
      SlackAdapter.imageBlock(this.doc),
      SlackAdapter.textBlock(this.doc.description),
      // SlackAdapter.textBlock(this.doc.caption) || '...',  // FIXME always check we have a caption
      SlackAdapter.textBlock(`${firstActor.formalName} is here.`),
      SlackAdapter.textBlock(itemsInfo)
    ]
    await SlackAdapter.sendBlocks(blocks, context)
    return blocks
  }

  get allThings () {
    return this.findAllThings()
  }

  findAllThings () {
    const things = [...this.actors, ...this.items]
    return things
  }

  async status(context) {
    const reply = ["room items:"]
    this.allThings.forEach((item) => {
      reply.push( `- ${item.doc.name}: ${item.state}`)
    })
    await SlackAdapter.sendList(reply, context)
  }

  findItem (itemName) {
    const name = itemName.toLowerCase()
    const found = this.items.filter((item) => item.cname === name)
    if (found.length) {
      const item = found[0] // dont modify items
      Logger.logObj('found Item:', { cname:item.cname })
      return item
    } else {
      Logger.log('cannot find item:', itemName)
      return false
    }
  }

  /**
   * search both actor or item for named match
   * @param {*} cname
   * @returns
   * @memberof Room
   */
  findThing (cname) {
    if (!cname) return false
    const item = this.findActor(cname) || this.findItem(cname)
    if (!item) {
      Logger.log('room.findThing failed for', cname)
      return false
    }
    return item
  }

  /**
   * when we don't have a named actor
   * for talking out loud in a room
   */
  firstActor () {
    const foundActor = this.actors[0]
    if (!foundActor) {
      // Logger.log('room.actors', this.actors)
      Logger.log ('no actors in room!' + this.cname)
      return false
    }
    return foundActor
  }

  findActor (name) {
    if (!name) {
      Logger.error('findActor but no name!')
    }
    name = name.toLowerCase()
    const foundActor = this.actors.find(actor => actor.cname === name)
    if (!foundActor) {
      // Logger.log('room.actors', this.actors)
      Logger.log('cannot find actor named:' + name)
      return false
    }
    return foundActor
  }

  /**
   * word boundaries dont seem to work CRAP
   *
   * @returns
   * @memberof Room
   */
  makeRoomItemsRex () {
    let names = this.itemCnames()
    return WordUtils.findWords()
    // console.log('rex', {rex})

  }

  /**
   * replace item name in input and split it out
   * 'unlock the chest' becomes 'unlock', 'chest'
   * @param {*} input
   * @returns
   * @memberof Room
   */
  findActionItem (input) {
    const cnames = this.itemCnames()

    const pair = cnames.find(cname => {
      const rst = `${cname}\b|$`
      const rex = new RegExp(rst)
      const found = rex.test(input)
      if (found) {
        const action = input.replace(rex, '')
        console.log('found', action, cname)
        return { action, item: cname }
      }
      console.log('not found', {cname, input, rex})
    })
    console.log('pair', pair)
    return pair
  }

  /**
   *
   *
   * @param {*} context
   * @returns
   * @memberof Room
   */
  async tryActions (context) {
    let reply
    const input = context.event.text
    const parsed = RexParser.basicInputParser(input, this)
    if (parsed?.foundItem) {
      reply = await parsed.foundItem.tryAction(parsed, context)
      return reply
    }
    // else try on the room
    reply = await this.tryAction(parsed, context)
    if (reply) {
      return reply
    }
    Logger.log('nothing found for input', input)
    return false
  }

}

module.exports = Room
