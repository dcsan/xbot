import SlackBuilder from '../pal/SlackBuilder'
import Logger from '../../lib/Logger'
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

import {
  ActionData,
  ActionResult,
  ActionBranch,
  // ActionIf
} from '../MupTypes'

const DEFAULT_STATE = 'default'

//  TODO redo
//  Actor < RoomObject < GameObject
//  Room  < GameObject


class GameObject {
  doc: any
  story: Story
  room?: Room
  got: boolean  // carrying or note

  // allow recursing an item can have items
  items: Item[]
  actors: Actor[]
  actions: ActionData[]
  klass: string
  errorCodes: any
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
    this.got = false
    this.props = {}
    // initialize some common props

    this.reset()
  }

  reset() {
    this.props = {}
    // this.setProp('has', 'no')
    // this.setProp('wearing', 'no')
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
    Logger.logObj('setProp', { cname: this.cname, key, val })
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

  // may work for rooms and things
  async describeThing(evt: SceneEvent) {
    Logger.log('describeThing', this.name)
    let blocks: any[] = []
    if (this.doc.imageUrl) {
      blocks.push(SlackBuilder.imageBlock(this.doc, this))
    }
    blocks.push(
      SlackBuilder.textBlock(this.description)
    )
    const firstActor = this.firstActor()
    if (firstActor) {
      const actorIntro = `${ firstActor.formalName } is here.`
      blocks.push(SlackBuilder.textBlock(actorIntro))
    }
    const itemsInfo = this.itemNames()
    if (itemsInfo) {
      blocks.push(SlackBuilder.textBlock(`You see: ` + itemsInfo))
    }
    if (this.doc.buttons) {
      Logger.logObj('enter.buttons', this.doc.buttons)
      const buttonsBlock = SlackBuilder.buttonsBlock(this.doc.buttons)
      blocks.push(buttonsBlock)
    }
    // fixme - something is breaking on restart here
    await evt.pal.sendBlocks(blocks)
    return blocks
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
    return `a ${ this.formalName }`
  }

  // overridden by subclasses eg actor
  formatReply(text) {
    return text
  }

  async findAndRunAction(evt: SceneEvent): Promise<ActionResult> {
    // turn clean into a [list] of things to check if its the only checkable
    const checks: string[] = evt.result.combos || [evt.result.clean]
    let actionResult: ActionResult = {
      handled: false
    }
    log('start loop')
    // checks.forEach(async (check) => {
    for (const check of checks) {
      const actionData: ActionData = this.findAction(check)
      if (actionData) {
        actionResult = await this.runAction(actionData, evt)
        console.log('found 1 actionResult', actionResult)
        Logger.assertEqual(actionResult.handled, true, 'actionResult found but not handled?')
      }
    }
    log('end loop')
    console.log('findAndRun result', checks, actionResult)
    return actionResult
  }

  // FIXME - this could be on room or thing
  // but room should recurse afterward into all room.things ?
  findAction(input: string): ActionData {
    if (!this.doc.actions) {
      Logger.warn('no actions for item:', this.doc.name)
    }

    input = WordUtils.basicNormalize(input)

    const foundAction: ActionData = this.doc.actions?.find((action: ActionData) => {
      const rex = new RegExp(action.match)
      const check = rex.test(input)
      if (check) {
        return action // and exit loop
      }
      else return false
      // Logger.log('check', rex)
      // if (input.match(rex)) {
      //   return action
      // }
    })
    Logger.log('foundAction for', input, '=>', foundAction)
    return foundAction
  }

  // FIXME - this applies to things and rooms
  // which are a different level of hierarchy
  // making polymorphism harder
  async runAction(actionData: ActionData, evt?: SceneEvent): Promise<ActionResult> {
    const player = evt?.game.player
    let trackResult: ActionResult = {
      handled: false,
      doc: actionData,
      klass: this.klass,
      history: []
    }

    // quick reply
    if (actionData.reply) {
      const msg = this.formatReply(actionData.reply)
      if (evt) await evt.pal.sendText(msg)
      trackResult.handled = true
      trackResult.history?.push('reply')
    }

    // goto at top level of the block
    if (actionData.goto) {
      const roomName: string = actionData.goto
      await this.story.gotoRoom(roomName, evt)
      trackResult.handled = true
      trackResult.history?.push('goto')
    }

    if (actionData.if) {
      await this.runConditional(actionData, evt)
    } else {
      // just apply it
      await this.applyThenBlock(actionData.then, evt)
    }

    return trackResult
  }

  async runConditional(action: ActionData, evt?: SceneEvent) {
    const resultBlock: ActionBranch = this.checkConditionList(action)
    await this.applyThenBlock(resultBlock, evt)
  }

  checkConditionList(action: ActionData): ActionBranch {
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
    }
    returnBlock.passed = passed
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
    const result = RexParser.parseSetLine(line)
    if (result.parsed?.groups) {
      const { target, field, value } = result.parsed.groups
      Logger.assertTrue((target && field && value), 'missing field', result.parsed?.groups)
      if (target && field && value) {
        const found: GameObject | undefined = this.findRoom.findThing(target)
        if (!found) {
          Logger.warn('cannot find thing to update', { target, line })
          return false
        }
        const actual = found.getProp(field)
        // log('checked', { thing, field, value, actual })
        if (actual === value) {
          // log('true')
          return false
        }
      }
    }
    // log('fail')
    return false
  }

  async applyThenBlock(block: ActionBranch, evt?: SceneEvent) {
    if (!block) {
      Logger.warn('tried to apply setProps on null block')
      return
    }
    if (block.reply && evt) {
      evt.pal.sendText(block.reply)
    }
    if (!block.setProps) return

    for (const line of block.setProps) {
      await this.applySetPropOne(line, evt)
    }
  }

  // set props on this or other items
  async applySetPropOne(line, _evt) {
    const result: ParserResult = RexParser.parseSetLine(line)
    if (result.parsed?.groups) {
      const { target, field, value } = result.parsed.groups
      Logger.assertTrue((target && field && value), 'missing field', result.parsed?.groups)
      const found: GameObject | undefined = this.findRoom.findThing(target)
      if (!found) {
        Logger.warn('cannot find thing to update', { thing: target, line })
        return
      }
      found.setProp(field, value)
    }
  }

  // this runs before any actions on the object itself
  async takeAction(evt: SceneEvent) {
    const customTake: ActionData = this.findAction('take')
    if (this.doc.unique) {
      evt.game.player.addItem(this)
      this.room?.removeItemByCname(this.cname)
    }
    if (customTake) {
      return await this.runAction(customTake, evt)
    }
    return this.showBasicGetReply(evt)
    // TODO run custom action
  }

  async showBasicGetReply(evt: SceneEvent) {
    // TODO player status
    if (this.doc.canTake) {
      const msg = `you get the ${ this.name }`
      await evt.pal.sendText(msg)
      this.got = true
    } else {
      const msg = `you can't get the ${ this.name }`
      await evt.pal.sendText(msg)
      this.got = false  // or dont change state?
    }
  }

  async dropItem(pal: Pal) {
    if (this.got) {
      const msg = `you drop the ${ this.name }`
      await pal.sendText(msg)
      this.got = false
    } else {
      const msg = `you don't have the ${ this.name }`
      await pal.sendText(msg)
    }
  }

}

export { GameObject }
