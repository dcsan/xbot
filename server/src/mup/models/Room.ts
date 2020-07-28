import Logger from '../../lib/Logger'
import SlackBuilder from '../pal/SlackBuilder'
import { GameObject } from './GameObject'
import Actor from './Actor'
import Item from './Item'
import Story from './Story'
import Util from '../../lib/Util'
// import WordUtils from '../../lib/WordUtils'
// import { RexParser } from '../routes/RexParser'
import { ParserResult } from '../routes/RexParser'
import { Pal } from '../pal/Pal'

import {
  ErrorHandler,
  HandleCodes
} from './ErrorHandler'

import {
  SceneEvent,
  ActionResult
} from '../MupTypes'


class Room extends GameObject {

  hintStep: string

  constructor(doc, story: Story) {
    super(doc, story, 'room')
    this.hintStep = 'start'
    this.klass = 'room'
    this.buildThings(story)
  }

  buildThings(story: Story) {
    Logger.log('buildThings room:', this.name)
    this.items = []
    this.hintStep = this.doc.setHint || 'start'
    this.loadItems(story)
    this.loadActors(story)
  }

  get name() {
    return this.doc.name
  }

  // get player() {
  //   // not sure about this reaching back up the tree...
  //   return this.story?.game.player
  // }

  loadItems(story) {
    this.doc.items?.forEach((itemData) => {
      const item = new Item(itemData, story)
      item.room = this
      this.items.push(item)
    })
  }

  loadActors(story) {
    const allActors = this.doc.actors
    Logger.log('loading actors:', allActors?.length)
    this.actors = []
    // @ts-ignore
    allActors?.map(actorDoc => {
      const actor = new Actor(actorDoc, story)
      actor.room = this
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

  // find and examine thing
  async lookRoomThing(evt: SceneEvent) {
    const thingName: string | undefined = evt.pres.pos?.target
    if (!thingName) return Logger.warn('no thingName to lookat', evt)
    const thing = this.findThing(thingName)
    if (!thing) {
      ErrorHandler.sendError(HandleCodes.errthingNotFound, evt, { name: thingName })
      return
    }
    thing.describeThing(evt)
  }

  // find and get an object in the room
  async takeRoomThing(evt: SceneEvent): Promise<ActionResult> {
    const target = evt.pres.pos?.target
    if (!target) {
      Logger.warn('no thingName to lookat', evt)
      return { handled: HandleCodes.errThingName, err: true }
    }
    const thing = this.findThing(target) // in the room
    if (!thing) {
      // const name: string = evt.pres.input || 'item'
      ErrorHandler.sendError(HandleCodes.errthingNotFound, evt, { name: target })
      return { handled: HandleCodes.errthingNotFound, err: true } // not found but we did reply
    }
    await thing.takeAction(evt)
    return { handled: HandleCodes.foundAction, err: false } // even if you didn't get it
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

  findItem(name) {
    return this.findThing(name)
  }

  // looks for actors
  findThing(itemName): GameObject | undefined {
    const cname = Util.safeName(itemName)
    const found = this.allThings.filter((thing: GameObject) => {
      if (thing.cname === cname) return true
      if (thing.doc.called) {
        const rex: RegExp = new RegExp(thing.doc.called)
        if (rex.test(itemName)) {
          return true
          // found.push(thing)
        }
      } // else
      return false  // not found
    })
    if (found.length > 1) {
      // TODO - send warning message
      // but needs a Pal to pipe to
      const item = found[0] // dont modify items
      Logger.logObj('found Item:', { cname: item.cname })
      return item
    } else if (found.length === 1) {
      return found.pop()
    } else {
      Logger.warn('cannot find thing:', itemName)
      return undefined
    }
  }

  removeItemByCname(cname: string) {
    const before = this.items?.length
    this.items = this.items?.filter(item => item.cname !== cname)
    Logger.log('before', before, 'after', this.items.length)
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

  /**
   * actions on just one thing
   * @param posResult
   * @param evt
   */
  async tryThingActions(result: ParserResult, evt: SceneEvent): Promise<ActionResult> {
    const target = result.pos?.target
    Logger.assertDefined(target, 'no target for tryThingActions')
    const thing = this.findThing(target)
    if (!thing) {
      Logger.warn('cannot find subject', result.parsed?.groups)
      return { handled: HandleCodes.errthingNotFound, err: true }
    }
    return await thing?.findAndRunAction(evt)  // assumes evt.parsed.clean
  }

  async useRoomThingAlone(evt: SceneEvent): Promise<ActionResult> {
    const pos = evt.pres.pos
    if (!pos?.target || !pos?.verb) return {
      handled: HandleCodes.errMissingPos,
      err: true
    }
    evt.pal.sendText(`you try to ${ pos.verb } the ${ pos.target }`)
    return {
      handled: HandleCodes.foundUse,
    }
  }

  async useRoomThingOn(evt: SceneEvent): Promise<ActionResult> {
    const pos = evt.pres.pos
    if (!pos?.target || !pos?.subject) {
      return { handled: HandleCodes.errMissingPos, err: true }
    }
    evt.pal.sendText(`you try to ${ pos.verb } the ${ pos.subject } on the ${ pos.target }`)
    return { handled: HandleCodes.foundUse }
  }

  // async tryRoomActions(input: string, pal: Pal) {
  //   const result = await this.findAndRunAction(input, pal)
  //   if (result) {
  //     return {
  //       type: 'roomAction',
  //       result
  //     }
  //   }
  //   return false
  // }

}

export default Room
