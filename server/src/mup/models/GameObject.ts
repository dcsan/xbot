import SlackBuilder from '../pal/SlackBuilder'
import { Logger } from '../../lib/Logger'
import Util from '../../lib/Util'
import WordUtils from '../../lib/WordUtils'
import { RexParser, ParserResult } from '../routes/RexParser'
import Room from './Room'
import Story from './Story'
import Actor from './Actor'
import Item from './Item'
import Player from './Player'
const log = console.log
import { Pal } from '../pal/Pal'
import { SceneEvent } from '../MupTypes'

import BotRouter from '../routes/BotRouter'

import {
  ActionData,
  ActionResult,
  ActionBranch,
  StateBlock
  // ActionIf
} from '../MupTypes'

const DEFAULT_STATE = 'default'

//  TODO redo
//  Actor < RoomObject < GameObject
//  Room  < GameObject

import { ErrorHandler, HandleCodes } from './ErrorHandler'

let blankActionResult = {
  handled: HandleCodes.processing
}


class GameObject {
  doc: any
  story: Story
  room?: Room

  // allow recursing an item can have items
  items: Item[]
  actors: Actor[]
  actions: ActionData[]
  klass: string
  // key:string objects for property setting
  props: any

  constructor(doc, story: Story, klass: string,) {
    this.doc = doc
    this.actions = doc.actions
    this.items = []
    this.actors = []
    // this.state = 'default'
    this.klass = klass
    this.story = story
    this.reset()
  }

  reset() {
    this.props = {}
    this.setProp('has', false)
    this.items?.map(item => item.reset())
    this.actors?.map(actor => actor.reset())
    const state =
      this.doc.state ||
      (this.doc.states ? this.doc.states[0].name : DEFAULT_STATE)
    this.state = state
  }

  // FIXME - dont use both
  get name() {
    return this.formalName
  }

  // for searching and comparison DB keys
  get cname() {
    return this.doc.cname || Util.safeName(this.doc.name)
  }

  // not lowercase
  get formalName() {
    let s = this.doc.name
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  // a|an|the
  get article() {
    return this.doc.article || 'a'
  }

  getProp(key) {
    return this.props[key]
  }
  setProp(key, val) {
    // Logger.logObj('setProp', { cname: this.cname, key, val })
    this.props[key] = val
  }

  // keep state as a prop too
  get state() {
    return this.getProp('state')
  }
  set state(val) {
    this.setProp('state', val)
  }
  setState(newState) {
    this.state = newState
  }

  get has() {
    return this.getProp('has')
  }
  set has(val) {
    this.setProp('has', val)
  }

  get stateInfo() {
    if (!this.doc.states) { return false }
    const info =
      this.doc.states?.filter(s => s.name === this.state).pop() ||
      this.doc.states[0]
    return info
  }

  get long() {
    Logger.checkItem(this.doc, 'long')
    return this.doc.long ||
      this.doc.description ||
      this.doc.short ||
      this.doc.name
  }

  get description() {
    return this.short
  }

  // FIXME - cleanup the schema to use consistent field names
  get short() {
    const info = this.stateInfo
    return info?.short || info?.long ||
      info.reply ||
      this.doc.short || this.doc.long ||
      this.doc.description ||
      this.formalName
  }

  isNamed(text) {
    // todo - allow synonyms
    return this.cname.match(text)
  }

  itemNames() {
    return this.items.map(item => item.name).join(', ')
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

  // should just be called on a Room
  get allThings() {
    const things: GameObject[] = []
    if (this.actors) things.push(...this.actors)
    if (this.items) things.push(...this.items)
    return things
  }

  getStateBlock() {
    const state = this.state
    let block: StateBlock = this.doc.states.find(one => one.name === state)
    Logger.logObj(`get state [${state}] block`, { state, block })

    if (!block) {
      Logger.warn('cant find block for state', { name: this.name, state })
      block = this.doc.states[0]
      if (!block) {
        // should never happen since states are required
        Logger.assertDefined(block, 'cannot find block for state', { state: this.state, states: this.doc.states })
      }
    }
    return block
  }

  // may work for rooms and things
  async describeThing(evt: SceneEvent) {
    const stateInfo: StateBlock = this.getStateBlock()
    const palBlocks: any[] = []

    Logger.log('describeThing', {
      name: this.name,
      state: this.state,
      props: this.props,
      stateInfo,
    })
    if (stateInfo.imageUrl) {
      palBlocks.push(SlackBuilder.imageBlock(stateInfo, this))
    }
    const text = stateInfo.long || stateInfo.short
    if (text) {
      palBlocks.push(
        SlackBuilder.textBlock(text)
      )
    }
    const itemsInfo = this.itemNames()
    Logger.log('itemsInfo:', itemsInfo)
    if (itemsInfo) {
      palBlocks.push(SlackBuilder.textBlock(`You see: ` + itemsInfo))
    }

    if (stateInfo.buttons) {
      const buttonsBlock = SlackBuilder.buttonsBlock(stateInfo.buttons)
      palBlocks.push(buttonsBlock)
    }

    await evt.pal.sendBlocks(palBlocks)
    return palBlocks
  }

  /**
   * when we don't have a named actor
   * for talking out loud in a room
   */
  firstActor() {
    if (!this.actors) return
    const foundActor = this.actors[0]
    if (!foundActor) {
      // Logger.log('room.actors', this.actors)
      Logger.log('no actors in room!' + this.cname)
      return false
    }
    return foundActor
  }

  // add 'the' or 'an' based on item article
  get articleName() {
    return `a ${this.formalName}`
  }

  // overridden by subclasses eg actor
  formatReply(text) {
    return text
  }

  async findAndRunAction(evt: SceneEvent): Promise<ActionResult> {
    // turn clean into a [list] of things to check if its the only checkable
    const checks: string[] = evt.pres.combos || [evt.pres.clean]

    for (const check of checks) {
      const actionData: ActionData = this.findRoom.findAction(check)
      if (!actionData) {
        return {
          handled: HandleCodes.errActionNotFound,
          err: true
        }
        // break the loop
      }
      if (actionData) {
        const actionResult = await this.runAction(actionData, evt)
        if (actionResult.err) {
          Logger.assertTrue(actionResult.handled, 'actionResult found but not handled?', evt.pres)
        }
        return actionResult
        // break
      }
    }
    // TODO
    // found but not replied ?
    // should probably be handled inside 'runAction'
    // eg if verb / noun just missing
    return {
      handled: HandleCodes.errNoResponse,
      err: true
    }
  }

  // FIXME - this could be on room or thing
  // but room should recurse afterward into all room.things ?
  // just going to look for actions on the ROOM
  findAction(input: string): ActionData {
    const room = this.findRoom
    if (!room.doc.actions) {
      Logger.warn('no actions for item:', this.doc.name)
    }

    input = WordUtils.basicNormalize(input)

    const foundAction: ActionData = room.doc.actions?.find((action: ActionData) => {
      const rex = new RegExp(action.match)
      const check = rex.test(input)
      if (check) {
        return action // and exit loop
      }
      else return false
    })
    if (foundAction) {
      Logger.logObj('foundAction for', { input, foundAction })
    } else {
      Logger.logObj('FAIL foundAction', { input, 'room.actions': room.actions })
    }
    return foundAction
  }

  // FIXME - this applies to things and rooms
  // which are a different level of hierarchy
  // making polymorphism harder
  async runAction(actionData: ActionData, evt: SceneEvent): Promise<ActionResult> {
    const player = evt?.game.player
    let trackResult: ActionResult = {
      handled: HandleCodes.processing,
      doc: actionData,
      klass: this.klass,
      history: []
    }

    // quick reply
    if (actionData.reply) {
      const msg = this.formatReply(actionData.reply)
      if (evt) await evt.pal.sendText(msg)
      trackResult.handled = HandleCodes.okReplied
      trackResult.history?.push('reply')
    }

    // goto at top level of the block
    if (actionData.goto) {
      const roomName: string = actionData.goto
      await this.story.gotoRoom(roomName, evt)
      trackResult.handled = HandleCodes.foundGoto
      trackResult.history?.push('goto')
    }

    if (actionData.always) {
      await this.runBranch(actionData.always, evt)
    }

    if (actionData.if) {
      await this.runConditionalBranch(actionData, evt)
    } else {
      // can have an always and a 'then' with no 'if' ... maybe while in dev
      await this.runBranch(actionData.then, evt)
    }

    return trackResult
  }

  async runConditionalBranch(action: ActionData, evt: SceneEvent) {
    const condBranch: ActionBranch = this.getConditionalBranch(action)
    await this.runBranch(condBranch, evt)
  }

  getConditionalBranch(action: ActionData): ActionBranch {
    const allBlock: string[] = action.if.all
    let returnBlock: ActionBranch
    let passed = true
    // find first *failing* condition
    const fail = allBlock.find(line => !(this.checkOneCondition(line)));
    if (fail) {
      passed = false
      returnBlock = action.else
    } else {
      passed = true
      returnBlock = action.then
    }
    if (!returnBlock) {
      Logger.warn('cannot find returnBlock', { fail })
      // TODO - should handle this better? no 'else' or 'then'
    }
    return returnBlock
  }

  // FIXME odd hierarchy. would be better with mixins?
  get findRoom(): Room {
    // @ts-ignore
    if (this.klass === 'room') return <Room>this
    // @ts-ignore
    return this.room
  }

  checkOneCondition(line): boolean {
    const pres = RexParser.parseSetLine(line)
    if (!pres.parsed?.groups) {
      Logger.warn('ifBlock. missing groups', pres.parsed)
      return false
    }

    const { target, field, value } = pres.parsed.groups
    if (!(target && field && value)) {
      Logger.warn('missing parser fields', { target, field, value })
      Logger.log('if block failed', pres.parsed.groups)
      return false
    }

    const found: GameObject | undefined = this.findRoom.findThing(target)
    if (!found) {
      Logger.warn('cannot find thing to update', { target, line })
      return false
    }
    const actual = found.getProp(field)
    // log('checked', { thing, field, value, actual })
    if (actual === value) {
      Logger.log('if block passed', pres.parsed.groups)
      return true
    }
    Logger.log('if block failed')
    return false
  }

  async runBranch(branch: ActionBranch | undefined, evt: SceneEvent) {
    if (!branch) return
    await this.doCallActions(branch.before, evt)
    if (!branch) {
      Logger.error('tried to run a null branch', evt?.pres)
      return
    }
    if (branch.reply && evt) {
      evt.pal.sendText(branch.reply)
    }
    await this.applySetProps(branch, evt)
    await this.doTakeActions(branch, evt)
    await this.doCallActions(branch.after, evt)
  }

  // set props on this or other items
  async applySetProps(branch: ActionBranch, _evt) {
    if (!branch.setProps) return

    for (const line of branch.setProps) {
      const pres: ParserResult = RexParser.parseSetLine(line)
      if (pres.parsed?.groups) {
        const { target, field, value } = pres.parsed.groups
        Logger.assertTrue((target && field && value), 'missing field', pres.parsed?.groups)
        const found: GameObject | undefined = this.findRoom.findThing(target)
        if (!found) {
          Logger.warn('cannot find thing to update', { thing: target, line })
          return
        }
        found.setProp(field, value)
      }
    }
  }

  // take any items
  doTakeActions(branch: ActionBranch, evt: SceneEvent) {
    const takeItemList = branch.take
    if (!takeItemList) return

    for (const targetName of takeItemList) {
      const thing = this.findRoom.findThing(targetName)
      if (thing) {
        evt.game.player.addItem(thing)
        this.findRoom.removeItemByCname(this.cname)
      } else {
        Logger.error('cannot find thing to take', { targetName })
      }
    }
  }

  // this runs before any actions on the object itself
  async takeAction(evt: SceneEvent) {
    await this.baseTakeAction(evt)
    // if (this.doc.unique) {
    //   evt.game.player.addItem(this)
    //   this.room?.removeItemByCname(this.cname)
    // }
    // run a custom event after in case we need to modify anything
    const customTake: ActionData = this.findAction('take')
    if (customTake) {
      await this.runAction(customTake, evt)
    }
    // TODO run custom action
  }

  // default for getting an item
  async baseTakeAction(evt: SceneEvent) {
    // TODO player status
    if (this.getProp('has')) {
      const msg = `you already have the ${this.name}`
      const blocks = [
        SlackBuilder.textBlock(msg),
        SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
      ]
      return await evt.pal.sendBlocks(blocks)
    }
    if (this.doc.canTake) {
      const msg = `you get the ${this.name}`
      const blocks = [
        SlackBuilder.textBlock(msg),
        SlackBuilder.contextBlock("type `inv` to see what you're carrying"),
      ]
      this.story.game.player.takeItem(this) // removes from the room
      this.setProp('has', true)
      await evt.pal.sendBlocks(blocks)
    } else {
      // cannot take
      await ErrorHandler.sendError(HandleCodes.ignoredCannotTake, evt, { name: this.name })
      await evt.pal.sendBlocks(
        [SlackBuilder.contextBlock("type `inv` to see what you're carrying")]
      )
      this.setProp('has', false)  // or dont change state?
    }
  }

  // trigger other events into the scene
  // create a new synthetic event and call back into the room
  async doCallActions(calls: string[] | undefined, evt: SceneEvent) {
    if (!calls) return

    for (const oneCall of calls) {
      const newEvt: SceneEvent = {
        pal: evt.pal,
        game: evt.game,
        pres: {
          clean: oneCall
        }
      }

      // TODO add a short delay / so they're in order?
      // FIXME - this is calling into BotRouter which may introduce a circular deps
      // but we need this for commands and other non-room actions
      Logger.log('doCall', oneCall)
      evt.pal.input(oneCall)
      await BotRouter.anyEvent(evt.pal, oneCall, 'text')
      // await this.findRoom.findAndRunAction(newEvt)
    }
  }

  async dropItem(pal: Pal) {
    if (this.has) {
      const msg = `you drop the ${this.name}`
      await pal.sendText(msg)
      this.has = false
    } else {
      const msg = `you don't have the ${this.name}`
      await pal.sendText(msg)
    }
  }

}

export { GameObject }
