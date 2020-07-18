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
    this.doc.items.forEach((itemData) => {
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
    allActors.map( actorDoc => {
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
      return item.articleName
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

  findAllThings () {
    const things = [...this.actors, ...this.items]
    return things
  }

  async status(context) {
    const reply = ["room items:"]
    this.items.forEach((item) => {
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
   * @param {*} name
   * @returns
   * @memberof Room
   */
  firstItem (name) {
    const item = this.findActor(name) || this.findItem(name)
    if (!item) {
      Logger.log('firstItem cannot find item for', name)
      return false
    }
    return item
  }

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

  // // FIXME - normalize API with other item.examine etc
  // async examineAny(itemName, player, context) {
  //   if (!itemName) {
  //     debug('examine: no itemname')
  //     return
  //   }
  //   const item =
  //     this.findItem(itemName) ||
  //     this.findActor(itemName)
  //   if (!item) {
  //     debug('not found', itemName, 'in', this.items)
  //     const msg = `you don't see a ${itemName}`
  //     await SlackAdapter.sendText(msg, context)
  //     return false  // maybe fallthrough to other handling method
  //   } else {
  //     Logger.log('ex item', item)
  //     // check if there's a special 'examine' event with trigger
  //     const foundAction = await item.itemActions('examine', player, context)
  //     Logger.log('foundAction', foundAction)
  //     if (!foundAction) {
  //       // default examine
  //       await item.examine(context, player)
  //     }
  //     return true
  //   }
  // }

  // // TODO refactor move to GameObject ?
  // // triggers can interact between items in the same room
  // runActions (action, itemName, player, context) {
  //   // this.runRoomActions()  // TODO
  //   return this.items.map((item) => {
  //     if (itemName === item.name) {
  //       item.itemActions(action, player, context)
  //     }
  //   })
  // }

  // finalActions()

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

  // findActionItemRegex (input) {
  //   const {rex} = this.makeRoomItemsRex()
  //   const match = rex.exec(input)
  //   // console.log('match.groups', match.groups)
  //   let output = input.replace(rex, '')
  //   output = output.trim()
  //   output = output.replace(/  /gm, ' ') // double spaces

  //   if (!match) {
  //     return false
  //   }

  //   return {
  //     input,
  //     match,
  //     groups: {...match.groups},
  //     action: output
  //   }
  // }

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
    const input = context.event.text
    const result = RexParser.basicInputParser(input, this)
    const reply = await result.foundItem.tryAction(result, context)
    return reply
  }

}

module.exports = Room
