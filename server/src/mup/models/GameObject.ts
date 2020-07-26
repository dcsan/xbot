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
  ActionIf
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
    this.setProp('has', 'no')
    this.setProp('wearing', 'no')
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
    const actionData: ActionData = this.findAction(evt.result.clean)
    if (actionData) {
      const actionResult: ActionResult = await this.runAction(actionData, evt)
      return actionResult
    }
    // failure actionResult
    return {
      handled: false
    }
  }

  // FIXME merge with tryAction - this came from actors before
  // but it's the same for both
  findAction(input: string): ActionData {
    if (!this.doc.actions) {
      Logger.warn('no actions for item:', this.doc.name)
    }

    input = WordUtils.cheapNormalize(input)

    const foundAction = this.doc.actions.find(action => {
      const rex = new RegExp(action.match)
      const check = rex.test(input)
      return check
      // Logger.log('check', rex)
      // if (input.match(rex)) {
      //   return action
      // }
    })
    return foundAction
  }

  // FIXME - this applies to things and rooms
  // which are a different level of hierarchy
  // making polymorphism harder
  async runAction(actionData: ActionData, evt?: SceneEvent): Promise<ActionResult> {
    const player = this.story.game.player
    let result: ActionResult = {
      handled: false,
      doc: actionData,
      klass: this.klass,
      history: []
    }

    // quick reply
    if (actionData.reply) {
      const msg = this.formatReply(actionData.reply)
      if (evt) await evt.pal.sendText(msg)
      result.handled = true
      result.history?.push('reply')
    }

    // goto at top level of the block
    if (actionData.goto) {
      const roomName: string = actionData.goto
      await this.story.gotoRoom(roomName, evt)
      result.handled = true
      result.history?.push('goto')
    }

    if (actionData.if) {
      await this.runConditional(actionData, evt)
    } else {
      // just apply it
      await this.applySetProps(actionData.then, evt)
    }

    return result
  }

  async runConditional(action: ActionData, evt?: SceneEvent) {
    const resultBlock: ActionBranch = this.checkConditionList(action)
    if (resultBlock.reply && evt) {
      evt.pal.sendText(resultBlock.reply)
    }
    this.applySetProps(resultBlock, evt)
  }

  checkConditionList(action: ActionData): ActionBranch {
    const allBlock: string[] = action.if.all
    let returnBlock: ActionBranch
    let pass = true
    // find first *failing* condition
    const fail = allBlock.find(line => !(this.checkOneCondition(line)));
    if (fail) {
      returnBlock = action.else
    } else {
      returnBlock = action.then
    }
    if (!returnBlock) {
      Logger.warn('cannot find returnBlock', { fail })
    }
    return returnBlock
  }

  checkOneCondition(line): boolean {
    const result = RexParser.parseSetLine(line)
    if (result.parsed?.groups) {
      const { thing, field, value } = result.parsed.groups
      if (thing && field && value) {
        const found: GameObject | undefined = this.room?.findItem(thing)
        if (!found) {
          Logger.warn('cannot find thing to update', { thing, line })
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

  applySetProps(block: ActionBranch, evt?: SceneEvent) {
    if (!block) {
      Logger.warn('tried to apply setProps on null block')
      return
    }
    const setPropList: string[] | undefined = block.setProps
    setPropList?.map((line) => this.applySetPropOne(line, evt))
  }

  // set props on this or other items
  async applySetPropOne(line, _evt) {
    const result: ParserResult = RexParser.parseSetLine(line)
    if (result.parsed?.groups) {
      const { thing, field, value } = result.parsed.groups
      if (thing && field && value) {
        const found: GameObject | undefined = this.room?.findItem(thing)
        if (!found) {
          Logger.warn('cannot find thing to update', { thing, line })
          return
        }
        found.setProp(field, value)
        // log('updating', { thing, field, value })
        // log('set it', found.name, JSON.stringify(found.props, null, 2))
      }
    }
  }

  async getItem(pal: Pal) {
    const customGet = this.findAction('get')
    if (!customGet) return this.basicGetItem(pal)
  }

  async basicGetItem(pal: Pal) {
    if (this.doc.canGet) {
      const msg = `you get the ${ this.name }`
      await pal.sendText(msg)
      this.got = true
    } else {
      const msg = `you can't get the ${ this.name }`
      await pal.sendText(msg)
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

export { GameObject, ActionData, ActionBranch as ActionBlock, ActionResult }
