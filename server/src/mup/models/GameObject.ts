import { BaseBuilder } from '../pal/base/BaseBuilder'
import { MakeLogger } from '../../lib/LogLib'
import Util from '../../lib/Util'

import { RexParser, ParserResult } from '../parser/RexParser'
import Room from './Room'
import Story from './Story'
import Actor from './Actor'
// import Item from './Item'
// import Player from './Player'
import { Pal } from '../pal/base/Pal'
import { SceneEvent } from '../MupTypes'
import { GameFuncs } from '../scripts/GameFuncs'
import BotRouter from '../routing/BotRouter'

// const log = console.log
const logger = new MakeLogger('GameObject')

import {
  ActionData,
  // ActionResult,
  ActionBranch,
  StateBlock
  // ActionIf
} from '../MupTypes'

const DEFAULT_STATE = 'default'

//  TODO redo
//  Actor < RoomObject < GameObject
//  Room  < GameObject

import { ErrorHandler, HandleCodes } from './ErrorHandler'

// let blankActionResult = {
//   handled: HandleCodes.processing
// }

interface ThingProps {
  hidden: boolean
  canTake: boolean
  has: string   // yes|no
  state?: string
}


class GameObject {
  doc: any
  story: Story
  room?: Room
  cname: string
  // allow recursing an item can have items

  actors: Actor[]
  actions: ActionData[]
  klass: string
  // key:string objects for property setting
  props?: ThingProps
  hidden?: boolean
  ready?: boolean   // been initialized?

  constructor(doc, story: Story, klass: string,) {
    // logger.log('create', doc)
    this.doc = doc
    this.actions = doc.actions
    this.actors = []
    this.cname = Util.safeName(this.doc.name)
    this.klass = klass
    this.story = story
    // this.props = this.resetProps()
    this.reset()
  }

  reset() {
    this.props = {
      canTake: this.doc.canTake,
      hidden: this.doc.hidden,
      has: 'no'
    }
    this.initState()
  }

  initState() {
    const state = this.doc.state ||
      (this.doc.states ? this.doc.states[0].name : DEFAULT_STATE)
    this.state = state
  }

  // FIXME - dont use both
  get name() {
    return this.formalName
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
    return this.props![key]
  }
  setProp(key, val) {
    // logger.logObj('setProp', { cname: this.cname, key, val })
    this.props![key] = val
  }

  get has(): string {
    return this.getProp('has')
  }
  set has(val: string) {
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
    logger.checkItem(this.doc, 'long')
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

  getStateBlock() {
    const state = this.state
    let block: StateBlock = this.doc.states.find(one => one.name === state)
    // logger.logObj(`get state [${state}] block`, { state, block })

    if (!block) {
      logger.warn('cant find block for state', { name: this.name, state })
      block = this.doc.states[0]
      if (!block) {
        // should never happen since states are required
        logger.assertDefined(block, 'cannot find block for state', { state: this.state, states: this.doc.states })
      }
    }
    return block
  }

  // may work for rooms and things
  async describeThing(evt: SceneEvent) {
    const stateInfo: StateBlock = this.getStateBlock()
    const palBlocks = this.renderBlocks(stateInfo, evt.pal)
    await evt.pal.sendBlocks(palBlocks)
    return palBlocks
  }

  // render item as a display set of blocks
  // TODO - use pal.builder to decide what type of builder to use - slack/discord
  // so rendering is different
  renderBlocks(stateInfo: StateBlock, pal: Pal): any[] {
    const palBlocks: any[] = []

    // logger.log('describeThing', {
    //   name: this.name,
    //   state: this.state,
    //   props: this.props,
    //   stateInfo,
    // })

    if (stateInfo.imageUrl) {
      palBlocks.push(BaseBuilder.imageBlock(stateInfo, this))
    }

    if (stateInfo.webUrl) {
      palBlocks.push(BaseBuilder.webLink(stateInfo, this))
    }

    const text = stateInfo.long || stateInfo.short || stateInfo.reply
    if (text) {
      palBlocks.push(
        BaseBuilder.textBlock(text)
      )
    }

    if (stateInfo.buttons) {
      const buttonsBlock = pal.builder.buttonsBlock(stateInfo.buttons)
      palBlocks.push(buttonsBlock)
    }

    if (stateInfo.hint) {
      palBlocks.push(BaseBuilder.contextBlock(stateInfo.hint))
    }


    switch (stateInfo.navbar) {
      case 'no':
      case 'none':
      case 'false':
        break
      case 'full':
      case 'yes':
        palBlocks.push(pal.builder.navbar(stateInfo.navbar))
        break

      default: // 30% chance if not stated
        // if (stateInfo.buttons) break  // dont mix with navbar
        // if (Math.random() < 0.3) {
        //   palBlocks.push(pal.builder.navbar(stateInfo.navbar))
        // }
        break
    }

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
      // logger.log('room.actors', this.actors)
      logger.log('no actors in room!' + this.cname)
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


  // FIXME - this applies to things and rooms
  // which are a different level of hierarchy
  // making polymorphism harder
  async runAction(actionData: ActionData, evt: SceneEvent): Promise<boolean> {
    // const player = evt?.game?.player
    let trackResult = false
    // let trackResult: ActionResult = {
    //   handled: HandleCodes.processing,
    //   doc: actionData,
    //   klass: this.klass,
    //   history: []
    // }

    // quick reply
    if (actionData.reply) {
      const msg = this.formatReply(actionData.reply)
      if (evt) await evt.pal.sendText(msg)
      trackResult = true
      // trackResult.handled = HandleCodes.okReplied
      // trackResult.history?.push('reply')
    }

    if (actionData.always) {
      await this.runBranch(actionData.always, evt, trackResult)
    }

    if (actionData.if) {
      await this.runConditionalBranch(actionData, evt, trackResult)
    } else {
      // just a 'then' without an 'if'
      await this.runBranch(actionData.then, evt, trackResult)
    }

    logger.logObj('DONE ranAction', { match: actionData.match, trackResult })

    return trackResult
  }

  async runConditionalBranch(action: ActionData, evt: SceneEvent, trackResult: boolean) {
    const condBranch: ActionBranch = this.getConditionalBranch(action)
    await this.runBranch(condBranch, evt, trackResult)
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
      logger.warn('cannot find returnBlock', { fail })
      // TODO - should handle this better? no 'else' or 'then'
    }
    return returnBlock
  }

  // FIXME odd hierarchy. would be better with mixins?
  // this method gets room of an item or just itself if running on the room
  get roomObj(): Room {
    // @ts-ignore
    if (this.klass === 'room') return <Room>this
    // @ts-ignore
    return this.room
  }

  checkOneCondition(line: string): boolean {
    const pres = RexParser.parseSetLine(line)
    if (!pres.parsed?.groups) {
      logger.warn('ifBlock. missing groups', { parsed: pres.parsed })
      return false
    }

    const { target, field, value } = pres.parsed.groups
    if (!(target && field && value)) {
      logger.warn('missing parser fields', { target, field, value })
      logger.log('if block failed', pres.parsed.groups)
      return false
    }

    // FIXME - should be more explicit when checking player inv items
    let found: GameObject | undefined = this.roomObj.findThing(target)
    if (!found) {
      logger.log('look in player for:', target)
      found = this.roomObj.story.game.player.findThing(target)
    }
    if (!found) {
      logger.warn('cannot find thing to update', { target, line })
      return false
    }
    const actual = found.getProp(field)
    // log('checked', { thing, field, value, actual })
    if (actual === value) {
      logger.log('if block passed', pres.parsed.groups)
      return true
    } else {
      logger.warn('if block failed', pres.parsed.groups)
      // logger.logObj('if FAIL', { field, expect: value, actual }, true)
      // logger.logLine(`if / false ${target}.${field} expect: ${value} actual: ${actual} `)
      return false
    }
  }

  async runBranch(
    branch: ActionBranch | undefined, evt: SceneEvent, trackResult: boolean
  ): Promise<boolean | undefined> {
    if (!branch) {
      logger.log('tried to run a null branch for pres', evt?.pres)
      return
    }

    await this.doCallActions(branch.before, evt)
    await this.applySetProps(branch, evt)

    // custom JS func?
    if (branch.callJS) {
      // call a JS script with evt
      const funcName = branch.callJS
      if (GameFuncs[funcName]) {
        await GameFuncs[funcName](branch, evt)
      } else {
        logger.warn('tried to call non-exist JSfunc:', funcName)
      }
    }

    // FIXME merge types for branch and stateBlock
    const palBlocks = this.renderBlocks(branch as StateBlock, evt.pal)
    if (palBlocks && palBlocks.length) {
      // console.log('palBlocks', palBlocks)
      await evt.pal.sendBlocks(palBlocks)
    }

    // show take actions after base output
    await this.doTakeActions(branch, evt)

    if (branch.after) await this.doCallActions(branch.after, evt)

    // goto at top level of the block
    if (branch.goto) {
      const roomName: string = branch.goto
      await this.story.gotoRoom(roomName, evt)
      trackResult = true
      // trackResult.history?.push('goto')
    }
    return trackResult

  }

  // set props on this or other items
  async applySetProps(branch: ActionBranch, _evt): Promise<boolean> {
    if (!branch.setProps) return false
    logger.logObj('setProps', branch.setProps)
    let found = false
    for (const line of branch.setProps) {
      const pres: ParserResult = RexParser.parseSetLine(line)
      if (pres.parsed?.groups) {
        const { target, field, value } = pres.parsed.groups
        logger.assertTrue((target && field && value), 'missing field', pres.parsed?.groups)
        logger.log(`apply setProp ${target}.${field} => ${value}`)
        let targetThing
        if (target === 'room') {
          targetThing = this.roomObj
        } else {
          targetThing = this.roomObj.searchThing(target)
        }
        if (!targetThing) {
          logger.warn('cannot find targetThing to update', { target, line })
          // do NOT return here as we need to finish looping
        } else {
          targetThing.setProp(field, value)
          found = true
        }
      }
    }
    return found
  }

  // take any items from the script branch
  async doTakeActions(branch: ActionBranch, evt: SceneEvent): Promise<boolean> {
    const takeItemList = branch.take
    if (!takeItemList) return false

    for (const itemName of takeItemList) {
      await this.roomObj.takeItemByName(itemName, evt, { output: false })
    }
    return true
  }

  // trigger other events into the scene
  // create a new synthetic event and call back into the botRouter
  // this could probably be short circuited to just send the event here?
  async doCallActions(calls: string[] | undefined, evt: SceneEvent) {
    if (!calls) return

    for (const oneCall of calls) {
      logger.log('doCall', oneCall)
      await BotRouter.anyEvent(evt.pal, oneCall, 'text')
    }
  }

  async dropItem(pal: Pal) {
    if (this.has) {
      const msg = `you drop the ${this.name}`
      await pal.sendText(msg)
      this.has = 'no'
    } else {
      const msg = `you don't have the ${this.name}`
      await pal.sendText(msg)
    }
  }

}

export { GameObject }
