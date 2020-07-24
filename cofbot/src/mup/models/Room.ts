import Logger from '../../lib/Logger'
import SlackBuilder from '../../lib/adapters/SlackBuilder'
import { GameObject } from './GameObject'
import Actor from './Actor'
import Item from './Item'
import Story from './Story'
import Util from '../../lib/Util'
// import WordUtils from '../../lib/WordUtils'
// import { RexParser } from '../routes/RexParser'
import { ParserResult } from '../routes/RexParser'
import { Pal } from '../pal/Pal'

import { SceneEvent } from '../routes/RouterService'

class Room extends GameObject {

  story: Story
  hintStep: string

  constructor(doc, story) {
    super(doc)
    this.story = story  // handle to its parent
    this.hintStep = 'start'
    this.reset()
  }

  reset() {
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

  get player() {
    // not sure about this reaching back up the tree...
    return this.story.game.player
  }

  loadActors() {
    const allActors = this.doc.actors
    Logger.log('loading actors:', allActors?.length)
    this.actors = []
    // @ts-ignore
    allActors?.map(actorDoc => {
      const actor = new Actor(actorDoc, this)
      this.actors.push(actor)
    })
  }

  /**
   * on entering a new room we look around
   * @param {*} context
   * @memberof Room
   */
  async enter(evt: SceneEvent) {
    await this.lookRoom(evt)
  }

  // async things(evt: SceneEvent) {
  //   const msg = this.items.map(thing => thing.name)
  //   evt.pal.sendText(msg.join(','))
  // }

  itemFormalNamesOneLine() {
    const names = this.items.map(item => {
      return item.article + ' `' + item.formalName + '`'   // tick marks to highlight
    })
    return names.join(', ')
  }

  itemCnames() {
    const names = this.items.map(item => {
      return item.cname
    })
    return names
  }

  async lookRoom(evt: SceneEvent) {
    this.describeThing(evt) // the room
  }

  // might need to patch as a room?
  async lookThing(evt: SceneEvent) {
    const thingName: string = evt.result.parsed?.groups.thing
    if (!thingName) return Logger.warn('no thingName to lookat', evt)
    const thing = this.findThing(thingName)
    if (!thing) {
      Logger.warn('cannot find thing to lookAt', thingName)
      return
    }
    thing.describeThing(evt)
  }

  get allThings() {
    const things: GameObject[] = []
    if (this.actors) things.push(...this.actors)
    if (this.items) things.push(...this.items)
    return things
  }

  async status() {
    let reply = {
      name: this.name,
      items: [],
      actors: []
    }
    // FIXME!
    // @ts-ignore
    reply.items = this.items?.map((thing: Item) => {
      return { [thing.name]: thing.state }
    }) || []
    // @ts-ignore
    reply.actors = this.actors?.map((thing: Actor) => {
      return { [thing.name]: thing.state }
    }) || []
    return reply
  }

  findItem(itemName): Item | undefined {
    const name = itemName.toLowerCase()
    const found = this.items.filter((item) => item.cname === name)
    if (found.length) {
      const item = found[0] // dont modify items
      Logger.logObj('found Item:', { cname: item.cname })
      return item
    } else {
      Logger.log('cannot find item:', itemName)
      return undefined
    }
  }

  /**
   * search both actor or item for named match
   * @param {*} cname
   * @returns
   * @memberof Room
   */
  findThing(cname) {
    if (!cname) return false
    cname = Util.safeName(cname)
    const item = this.findItem(cname) || this.findActor(cname)
    if (!item) {
      Logger.log('room.findThing failed for', cname)
      return false
    }
    return item
  }


  findActor(name) {
    if (!name) {
      Logger.error('findActor but no name!')
    }
    if (!this.actors) return false
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
   * replace item name in input and split it out
   * 'unlock the chest' becomes 'unlock', 'chest'
   * @param {*} input
   * @returns
   * @memberof Room
   */
  findActionItem(input) {
    const cnames = this.itemCnames()

    const pair = cnames.find(cname => {
      const rst = `${ cname }\b|$`
      const rex = new RegExp(rst)
      const found = rex.test(input)
      if (found) {
        const action = input.replace(rex, '')
        console.log('found', action, cname)
        return { action, item: cname }
      }
      console.log('not found', { cname, input, rex })
      return undefined
    })
    console.log('pair', pair)
    return pair
  }

  async tryRoomActions(input, context) {
    const action = await this.tryMatchAction(input, context)
    if (action) {
      return {
        type: 'roomAction',
        action
      }
    }
    return false
  }

  /**
   *
   *
   * @param {*} context
   * @returns
   * @memberof Room
   */
  // async tryAllActions(evt: SceneEvent) {
  //   let action

  //   if (evt.result.parsed) {
  //     action = await evt.result.parsed.foundItem.tryAction(parsed, context)
  //     return {
  //       type: 'itemAction',
  //       action
  //     }
  //   }
  //   return false
  // }

}

export default Room
