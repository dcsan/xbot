import SlackBuilder from '../../lib/adapters/SlackBuilder'
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import WordUtils from '../../lib/WordUtils'
import Room from './Room'
import Actor from './Actor'
import Item from './Item'
import Player from './Player'
const log = console.log

import { SceneEvent } from '../routes/RouterService'

const DEFAULT_STATE = 'default'

//  TODO redo
//  Actor < RoomObject < GameObject
//  Room  < GameObject

class GameObject {
  doc: any
  room?: Room
  state: string
  // player: Player
  items: Item[]
  actors: Actor[]

  constructor(doc, room?: Room) {
    this.doc = doc
    this.room = room
    this.items = []
    this.actors = []
    this.state = 'default'
    this.reset()
  }

  reset() {
    try {
      const state = this.doc.state ||
        this.doc.states ? this.doc.states[0].name : DEFAULT_STATE
      this.state = state
    } catch (err) {
      log('failed to reset item')
      log('reset this.doc', this.doc)
    }
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

  // FIXME always force player to exist?
  get player(): Player | undefined {
    // not sure about this reaching back up the tree...
    return this.room?.story.game.player
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

  get short() {
    const info = this.stateInfo
    return info?.short || info?.long || this.doc.short || this.doc.long || this.doc.description || this.formalName
  }

  setState(newState) {
    this.state = newState
  }

  isNamed(text) {
    // todo - allow synonyms
    return this.cname.match(text)
  }

  itemNames() {
    return this.items.map(item => item.name).join(', ')
  }

  // may work for rooms and things
  async lookThing(evt: SceneEvent) {
    Logger.log('lookThing')
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
    await evt.pal.sendBlocks(blocks)
    return blocks
  }

  // might need to patch as a room?
  async lookRoom(evt: SceneEvent) {
    return this.lookThing(evt)
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

  async examine(_parsed, context) {
    const stateInfo = this.stateInfo
    // Logger.logObj('stateInfo', { state: this.state, stateInfo })
    // Logger.log('item.examine', this.cname)
    await SlackBuilder.sendItemCard(stateInfo, this, context)
  }

  /**
   * returns true|false if an action was found/matched
   * NOT if it passed/failed (fail is still run/replied to)
   *
   * @param {*} parsed { actionName, itemName, modifier }
   * @param {*} context
   * @returns
   * @memberof GameObject
   */
  async tryAction(parsed, context) {
    let { actionName, itemName, modifier } = parsed
    if (!this.doc.actions) {
      console.log('tryAction', { actionName, actions: this.doc.actions })
      Logger.warn('no actions for doc:', this.doc.name)
      return false
      // throw new Error('failed')
    }
    for (const actionData of this.doc.actions) {
      // this.doc.actions?.forEach(async (actionData) => {
      const fullAction = `${ actionName } ${ modifier }`.trim()
      let rex = new RegExp(actionData.match)
      // Logger.log('check', actionName, actionData)
      if (fullAction.match(rex)) {
        Logger.log('action match', actionName)
        const result = await this.runAction(actionData, context)
        return { result, actionData }
      }
    }
    return false
  }

  async tryMatchAction(input, context) {
    input = WordUtils.fullNormalize(input)
    if (!this.doc.actions) {
      Logger.warn('no actions for item:', this.doc.name)
    }
    for (const actionData of this.doc.actions) {
      let rex = new RegExp(actionData.match)
      if (input.match(rex)) {
        Logger.log('action match', actionData)
        const result = await this.runAction(actionData, context)
        return { result, actionData }
      }
    }
    return false
  }

  // FIXME merge with tryAction - this came from actors before
  // but it's the same for both
  findAction(text) {
    const found = this.doc.actions.find(action => {
      const rex = new RegExp(action.match)
      Logger.log('check', rex)
      if (text.match(rex)) {
        return action
      }
    })
    return found
  }

  // overridden by subclasses eg actor
  formatReply(text) {
    return text
  }

  // game>story>room  room.story.game
  // FIXME - reaching UP through the hierarchy
  // a gameObject could be a room itself or we need thing.room
  gotoRoom(roomName, context) {
    const thisRoom = this.room || this
    // @ts-ignore
    thisRoom.story.gotoRoom(roomName, context)
  }

  // FIXME - this applies to things and rooms
  // which are a different level of hierarchy
  // making polymorphism harder
  async runAction(actionData, context) {
    const player = this.player

    // quick reply
    if (actionData.reply) {
      const msg = this.formatReply(actionData.reply)
      await context.sendText(msg)
    }

    if (actionData.goto) {
      this.gotoRoom(actionData.goto, context)
    }

    const needs = actionData.needs
    if (!needs || player?.hasItem(needs)) {
      // success!
      const passData = actionData.pass
      if (passData) {
        Logger.log('action passed', passData)
        if (passData?.gets) player?.addItemByName(actionData.pass.gets)
        if (passData.setStates) await this.updateStates(passData.setStates, context)
        SlackBuilder.sendItemCard(actionData.pass, this, context)
      }
    } else {
      // fail
      Logger.log('action fail', actionData.name, actionData)
      SlackBuilder.sendItemCard(actionData.fail, this, context)
    }

  }

  updateStates(updates, _context) {
    updates.map(pair => {
      const [newState, itemName] = pair.split(' ')
      let targetItem
      if (itemName) {
        targetItem = this.room?.findItem(itemName)
      } else {
        // defaults to this if no 2nd arg for itemName
        targetItem = this
      }
      if (!targetItem) {
        Logger.error('cannot find targetItem for updateStates', itemName)
      }
      // targetItem,
      // log('updateStates', {newState })
      targetItem.setState(newState)
    })
  }

}

export default GameObject
