import { MakeLogger } from '../../lib/LogLib'
import { BaseBuilder } from '../pal/base/BaseBuilder'
import { GameObject } from './GameObject'
import WordUtils from '../../lib/WordUtils'
import Actor from './Actor'
import Item from './Item'
import Story from './Story'
import Util from '../../lib/Util'
// import WordUtils from '../../lib/WordUtils'
import { Pal } from '../pal/base/Pal'
import { ParserResult, RexParser } from '../parser/RexParser'

const logger = new MakeLogger('room')

import {
  ErrorHandler,
  HandleCodes
} from './ErrorHandler'

import {
  SceneEvent,
  ActionData,
  StateBlock
  // ActionResult
} from '../MupTypes'


class Room extends GameObject {

  hintStep: string
  roomItems: Item[]

  constructor(doc, story: Story) {
    super(doc, story, 'room')
    this.hintStep = 'start'
    this.klass = 'room'
    this.roomItems = []
    // this.reset()  // in super
    this.buildThings(story)
  }

  buildThings(story: Story) {
    // logger.log('buildThings room:', this.name)
    this.roomItems = []
    this.hintStep = this.doc.setHint || 'start'
    this.loadItems(story)
    this.loadActors(story)
  }

  reset() {
    super.reset()
    this.actors?.map(actor => actor.reset())
    this.roomItems?.map(item => item.reset())
  }

  get name() {
    return this.doc.name
  }

  get sortItems() {
    const sorted = this.roomItems?.sort((a, b) => {
      if (a.cname < b.cname) { return -1; }
      if (a.cname > b.cname) { return 1; }
      return 0;
    })
    logger.logObj('sorted', sorted)
    return sorted
  }

  loadItems(story) {
    this.doc.items?.forEach((itemData) => {
      const item = new Item(itemData, story)
      item.room = this
      this.roomItems.push(item)
    })
    // logger.log('load roomItems', this.roomItems)
  }

  loadActors(story) {
    const allActors = this.doc.actors
    if (!allActors?.length) return
    logger.log('loading actors:', allActors?.length)
    this.actors = []
    // @ts-ignore
    allActors?.map(actorDoc => {
      const actor = new Actor(actorDoc, story)
      actor.room = this
      this.actors.push(actor)
    })
  }

  // FIXME - much overlap with describeRoom but we use a Pal not a SceneEvent
  // cos this is triggered from reload too - needs a refactor
  // async enterRoom(evt?: SceneEvent) {
  async enterRoom(pal: Pal) {

    const stateInfo: StateBlock = this.getStateBlock()
    const palBlocks = await this.renderBlocks(stateInfo, pal)
    await pal.sendBlocks(palBlocks)
    return palBlocks

    // FIXME - reset everything in room on entry????

    // await this.lookRoom(evt)
    // await this.resetRoomState()
    // if (evt) {
    //   return await this.lookRoom(evt)
    // }
    // await this.showItemsInRoom(evt)
  }

  resetRoomState() {
    const state = this.doc.state || 'default'
    logger.log('resetRoomState', { roomName: this.name, state })
    this.state = state
  }

  async lookRoom(evt: SceneEvent) {
    logger.log('lookRoom', this.roomObj.doc.name)
    await this.roomObj.describeThing(evt) // the room
  }

  itemFormalNamesOneLine() {
    const names = this.roomItems.map(item => {
      return item.article + ' `' + item.formalName + '`'   // tick marks to highlight
    })
    return names.join(', ')
  }

  itemCnames() {
    // .sort((one, two) => one.cname > two.cname)
    const names = this.roomItems
      .map(item => {
        return item.cname
      })
    return names.sort()
  }

  // find and examine thing
  async lookRoomThing(evt: SceneEvent): Promise<boolean> {
    let thingName: string | undefined = evt.pres.pos?.target
    if (!thingName) {
      // shouldn't get here
      logger.warn('no thingName to lookat', evt)
      return false
    }
    thingName = WordUtils.makeCname(thingName) // lowercase etc.
    const thing = this.searchThing(thingName)
    if (!thing) {
      evt.pal.sendText(`You can't see a ${thingName}`)
      return false
    }
    // found it
    await thing.describeThing(evt)
    return true
  }

  async showItemsInRoom(evt: SceneEvent) {
    const itemsInfo = this.visibleItems()
    logger.log('itemsInfo:', itemsInfo)
    if (itemsInfo) {
      await evt.pal.sendBlocks([BaseBuilder.textBlock(`You see: ` + itemsInfo)])
    }
  }

  status() {
    let reply = {
      name: this.name,
      state: this.state,
      items: [],
      actors: []
    }
    // FIXME!
    // @ts-ignore
    reply.items = this.allThings.map((thing: Item) => thing.getStatus()) || []

    // logger.table(thing.name, props)
    logger.logObj('room.items', reply.items)
    // @ts-ignore
    reply.actors = this.actors?.map((thing: Actor) => {
      return { [thing.name]: thing.state }
    }) || []
    return reply
  }

  // findThing(name) {
  //   return this.findThing(name)
  // }

  async findAndRunAction(evt: SceneEvent): Promise<boolean> {
    // turn clean into a [list] of things to check if its the only checkable
    const checks: string[] = evt.pres.combos || [evt.pres.clean]
    logger.log('checks', checks)

    for (const check of checks) {
      const actionData: ActionData | undefined = this.roomObj.findAction(check)
      if (actionData) {
        await this.runAction(actionData, evt)
        return true
      }
    }
    return false
  }

  // FIXME - this could be on room only
  // but room should recurse afterward into all room.things ?
  // just going to look for actions on the ROOM
  findAction(input: string): ActionData | undefined {
    const room = this.roomObj
    if (!room.doc.actions) {
      logger.warn('no actions for item:', this.doc.name)
    }

    input = WordUtils.basicNormalize(input)

    const foundAction: ActionData = room.doc.actions?.find((action: ActionData) => {
      const rex = new RegExp(action.match, 'i')
      const check = rex.test(input)
      if (check) {
        return action // and exit loop
      } else {
        // console.log(`no match for input: [${input}]`, rex, check)
        return undefined
      }
    })

    if (foundAction) {
      logger.log(`OK found matched roomAction for [ ${input} ]`)
      return foundAction
    } else {
      // logger.logObj('FAIL foundAction', { input, 'room.actions': room.actions })
      logger.log('NO roomAction for input:', input)
      return undefined
    }
  }

  removeItemByCname(cname: string) {
    const before = this.roomItems?.length
    this.roomItems = this.roomItems?.filter(item => item.cname !== cname)
    logger.log('remove item before', before, 'after', this.roomItems.length)
  }

  // hard command direct from router
  async takeItemCommand(evt: SceneEvent): Promise<boolean> {
    const thingName = evt.pres.pos?.target
    if (!thingName) {
      logger.warn('no thingName to take', evt)
      return false
    }
    await this.takeItemByName(thingName, evt)
    return true // found
  }

  // in the room
  async takeItemByName(
    thingName: string,
    evt: SceneEvent,
    options = { output: true }  // allow a script to override
  ): Promise<boolean> {
    const thing = this.findThing(thingName)

    if (!thing) {
      // then look into inventory
      if (evt.game?.player?.hasItem(thingName)) {
        const msg = `You already have the ${thingName}`
        const blocks = [
          BaseBuilder.textBlock(msg),
          BaseBuilder.contextBlock("type `inv` to see what you're carrying"),
        ]
        await evt.pal.sendBlocks(blocks)
        // return { handled: HandleCodes.foundAction, err: false } // even if you didn't get it
        return true   // handled
      } else {
        const msg = `You can't see a ${thingName}`
        const blocks = [
          BaseBuilder.textBlock(msg),
          BaseBuilder.contextBlock("type `look` to see what's in the room"),
        ]
        await evt.pal.sendBlocks(blocks)
        return true  // replied even though it wasnt found
      }
    }

    // found a thing
    if (!thing.doc.canTake) {
      const msg = `You can't take the ${thingName}`
      const blocks = [
        BaseBuilder.textBlock(msg),
        BaseBuilder.contextBlock("type `inv` to see what you're carrying"),
      ]
      await evt.pal.sendBlocks(blocks)
      return true   // handled at least
    }

    const took = evt.game?.player.takeItem(thing)
    if (took) {
      // TODO custom take message eg 'wear item'
      if (options.output) {
        const msg = thing.doc.onTake || `You take the ${thingName}`
        const getMsg = BaseBuilder.textBlock(msg)
        let blocks = [
          getMsg,
          BaseBuilder.contextBlock("type `inv` to see what you're carrying"),
        ]
        await evt.pal.sendBlocks(blocks)
      }
    }
    return true
  }

  // should just be called on a Room
  get allThings() {
    const things: GameObject[] = []
    if (this.actors) things.push(...this.actors)
    if (this.roomItems) things.push(...this.roomItems)
    return things
  }

  // list of objects in the room for other matching
  getAllThingNames(): string[] {
    let allNames: string[] = []
    for (const thing of this.allThings) {
      // this.allThings?.forEach((thing: Item) => {
      allNames.push(thing.name)
      if (thing.doc.called) {
        allNames = allNames.concat(thing.doc.called)
      }
    }
    return allNames
  }

  // looks for actors
  findThing(itemName: string): GameObject | undefined {
    const cname = Util.safeName(itemName)
    logger.log('findThing', cname, 'in', this.klass)
    const found = this.allThings.filter((thing: GameObject) => {
      if (thing.cname === cname) return true
      // if (thing.doc.called) {
      //   const rex: RegExp = new RegExp(thing.doc.called)
      //   if (rex.test(itemName)) {
      //     return true
      //     // found.push(thing)
      //   }
      // } // else
      return false  // not found
    })
    if (found.length > 0) {
      const item = found[0]
      logger.log('found thing:', item.cname)
      return item
    } else {
      logger.warn(`cannot find in room:`, cname)
      let roomItems: string[] = this.roomObj.allThings.map(t => t.cname)
      roomItems = roomItems.sort()
      logger.logObj('roomItems:', roomItems)
      // logger.log('this:', this.cname, this.klass)
      return undefined
    }
  }

  searchThing(itemName: string): GameObject | undefined {
    const thing =
      this.findThing(itemName) ||
      this.story.game.player.findThing(itemName)
    return thing
  }

  visibleItems(): string {
    const vis = this.roomItems.filter(item => !item.doc.hidden)
    return vis.map(item => item.name).join(', ')
  }

  // show tasklist
  // currently depends on a room item called 'tasklist'
  // TODO - rewrite task system
  async showTask(evt: SceneEvent) {
    const tasklist = this.searchThing('tasklist')
    logger.log('showTask')
    await tasklist?.describeThing(evt)
  }

  async showHint(evt: SceneEvent) {
    logger.logObj('hint', evt)
    const text = evt.pres.parsed?.groups?.text
    await evt.pal.sendText(text)
    // const notes = this.searchThing('notebook')
    // await notes?.describeThing(evt)
  }

  findActor(name) {
    if (!name) {
      logger.error('findActor but no name!')
    }
    if (!this.actors) return false
    name = name.toLowerCase()
    const foundActor = this.actors.find(actor => actor.cname === name)
    if (!foundActor) {
      // logger.log('room.actors', this.actors)
      logger.log('cannot find actor named:' + name)
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
      const rst = `${cname}\b|$`
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

  // /**
  //  * actions on just one thing
  //  * @param posResult
  //  * @param evt
  //  */
  // async tryThingActions(result: ParserResult, evt: SceneEvent): Promise<boolean> {
  //   const target = result.pos?.target
  //   if (!target) {
  //     logger.assertDefined(target, 'no target for tryThingActions')
  //     return false
  //   }
  //   const thing = this.findThing(target)
  //   if (!thing) {
  //     logger.warn('cannot find subject', result.parsed?.groups)
  //     return false
  //     // return { handled: HandleCodes.errthingNotFound, err: true }
  //   }
  //   return await thing?.findAndRunAction(evt)  // assumes evt.parsed.clean
  // }

  async useRoomThingAlone(evt: SceneEvent): Promise<boolean> {
    const pos = evt.pres.pos
    if (!pos?.target || !pos?.verb) return false
    // {
    //   handled: HandleCodes.errMissingPos,
    //   err: true
    // }
    evt.pal.sendText(`You ${pos.verb} the ${pos.target} but nothing happens.`)
    return true
  }

  async useRoomThingOn(evt: SceneEvent): Promise<boolean> {
    const pos = evt.pres.pos
    if (!pos?.target || !pos?.subject) {
      return false
    }
    evt.pal.sendText(`You ${pos.verb} the ${pos.subject} on the ${pos.target} but nothing happens.`)
    return true
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
