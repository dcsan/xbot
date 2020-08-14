import { Logger } from '../../lib/Logger'
import SlackBuilder from '../pal/SlackBuilder'
import { GameObject } from './GameObject'
import WordUtils from '../../lib/WordUtils'
import Actor from './Actor'
import Item from './Item'
import Story from './Story'
import Util from '../../lib/Util'
// import WordUtils from '../../lib/WordUtils'
// import { Pal } from '../pal/Pal'
import { ParserResult, RexParser } from '../routes/RexParser'

import {
  ErrorHandler,
  HandleCodes
} from './ErrorHandler'

import {
  SceneEvent,
  ActionData,
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
    this.buildThings(story)
  }

  buildThings(story: Story) {
    Logger.log('buildThings room:', this.name)
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

  // get player() {
  //   // not sure about this reaching back up the tree...
  //   return this.story?.game.player
  // }

  loadItems(story) {
    this.doc.items?.forEach((itemData) => {
      const item = new Item(itemData, story)
      item.room = this
      this.roomItems.push(item)
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

  async enterRoom(evt?: SceneEvent) {
    if (evt) {
      return await this.lookRoom(evt)
    }
    // await this.showItemsInRoom(evt)
  }

  async lookRoom(evt: SceneEvent) {
    await this.roomObj.describeThing(evt) // the room
  }

  itemFormalNamesOneLine() {
    const names = this.roomItems.map(item => {
      return item.article + ' `' + item.formalName + '`'   // tick marks to highlight
    })
    return names.join(', ')
  }

  itemCnames() {
    const names = this.roomItems
      // .sort((one, two) => one.cname > two.cname)
      .map(item => {
        return item.cname
      })
    return names.sort()
  }

  // find and examine thing
  async lookRoomThing(evt: SceneEvent) {
    const thingName: string | undefined = evt.pres.pos?.target
    if (!thingName) return Logger.warn('no thingName to lookat', evt)
    const thing = this.roomObj.findThing(thingName) ||
      this.roomObj.story.game.player.findItem(thingName) // in the room
    if (!thing) {
      ErrorHandler.sendError(HandleCodes.errthingNotFound, evt, { name: thingName })
      return
    }
    thing.describeThing(evt)
  }

  async showItemsInRoom(evt: SceneEvent) {
    const itemsInfo = this.visibleItems()
    Logger.log('itemsInfo:', itemsInfo)
    if (itemsInfo) {
      await evt.pal.sendBlocks([SlackBuilder.textBlock(`You see: ` + itemsInfo)])
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
    reply.items = this.roomItems?.map((thing: Item) => {
      return {
        [thing.name]: {
          // state: thing.state,
          props: Util.removeEmptyKeys(thing.props) || {}
        }
      }
    }) || []
    console.log('props', this.props)
    // @ts-ignore
    reply.actors = this.actors?.map((thing: Actor) => {
      return { [thing.name]: thing.state }
    }) || []
    return reply
  }

  findItem(name) {
    return this.findThing(name)
  }

  async findAndRunAction(evt: SceneEvent): Promise<boolean> {
    // turn clean into a [list] of things to check if its the only checkable
    const checks: string[] = evt.pres.combos || [evt.pres.clean]
    Logger.log('checks', checks)

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
      Logger.warn('no actions for item:', this.doc.name)
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
      Logger.log(`OK found matched roomAction for [ ${input} ]`)
      return foundAction
    } else {
      // Logger.logObj('FAIL foundAction', { input, 'room.actions': room.actions })
      Logger.log('NO roomAction for input:', input)
      return undefined
    }
  }

  removeItemByCname(cname: string) {
    const before = this.roomItems?.length
    this.roomItems = this.roomItems?.filter(item => item.cname !== cname)
    Logger.log('remove item before', before, 'after', this.roomItems.length)
  }

  // hard command direct from router
  async takeItemCommand(evt: SceneEvent): Promise<boolean> {
    const thingName = evt.pres.pos?.target
    if (!thingName) {
      Logger.warn('no thingName to take', evt)
      return false
    }
    await this.takeItemByName(thingName, evt)
    return true // found
  }

  // in the room
  async takeItemByName(thingName: string, evt: SceneEvent): Promise<boolean> {
    const thing = this.findThing(thingName)

    if (!thing) {
      // then look into inventory
      if (evt.game?.player?.hasItem(thingName)) {
        const msg = `You already have the ${thingName}`
        const blocks = [
          SlackBuilder.textBlock(msg),
          SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
        ]
        await evt.pal.sendBlocks(blocks)
        // return { handled: HandleCodes.foundAction, err: false } // even if you didn't get it
        return true   // handled
      } else {
        const msg = `You can't see a ${thingName}`
        const blocks = [
          SlackBuilder.textBlock(msg),
          SlackBuilder.contextBlock("type `look` to see what's in the room"),
        ]
        await evt.pal.sendBlocks(blocks)
        return true  // replied even though it wasnt found
      }
    }

    // found a thing
    if (!thing.doc.canTake) {
      const msg = `You can't take the ${thingName}`
      const blocks = [
        SlackBuilder.textBlock(msg),
        SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
      ]
      await evt.pal.sendBlocks(blocks)
      return true   // handled at least
    }

    const took = evt.game?.player.takeItem(thing)
    if (took) {
      // TODO custom take message eg 'wear item'
      const msg = thing.doc.onTake || `You take the ${thingName}`
      const blocks = [
        SlackBuilder.textBlock(msg),
        SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
      ]
      await evt.pal.sendBlocks(blocks)
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
    Logger.log('findThing', itemName, 'in', this.klass)
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
    if (found.length > 0) {
      const item = found[0]
      Logger.log('found thing:', item.name)
      return item
    } else {
      Logger.warn('cannot find thing in room:', itemName)
      Logger.logObj('room items:', this.roomObj.itemCnames())
      // Logger.log('this:', this.cname, this.klass)
      return undefined
    }
  }

  visibleItems(): string {
    const vis = this.roomItems.filter(item => !item.doc.hidden)
    return vis.map(item => item.name).join(', ')
  }


  // default action for `take ITEM`
  // async baseTakeAction(evt: SceneEvent) {
  //   // TODO player status
  //   if (this.getProp('has') === 'yes') {
  //     const msg = `you already have the ${this.name}`
  //     const blocks = [
  //       SlackBuilder.textBlock(msg),
  //       SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
  //     ]
  //     return await evt.pal.sendBlocks(blocks)
  //   }
  //   if (this.doc.canTake) {
  //     const msg = `you get the ${this.name}`
  //     const blocks = [
  //       SlackBuilder.textBlock(msg),
  //       SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
  //     ]
  //     this.story.game.player.takeItem(this) // removes from the room
  //     this.setProp('has', 'yes')
  //     await evt.pal.sendBlocks(blocks)
  //   } else {
  //     // cannot take
  //     await ErrorHandler.sendError(HandleCodes.ignoredCannotTake, evt, { name: this.name })
  //     await evt.pal.sendBlocks(
  //       [SlackBuilder.contextBlock("type `inv` to see what you're carrying")]
  //     )
  //     // this.setProp('has', 'no')  // or dont change state?
  //   }
  // }

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
  //     Logger.assertDefined(target, 'no target for tryThingActions')
  //     return false
  //   }
  //   const thing = this.findThing(target)
  //   if (!thing) {
  //     Logger.warn('cannot find subject', result.parsed?.groups)
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
