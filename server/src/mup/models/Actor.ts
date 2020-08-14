import { GameObject } from './GameObject'
import { SceneEvent } from '../MupTypes'

import { Logger } from '../../lib/LogLib'
import assert from 'assert';

class Actor extends GameObject {

  defaultCount: number

  // FIXME
  doc: any

  constructor(doc, story) {
    super(doc, story, 'actor')
    this.defaultCount = 0
  }

  // /**
  //  * with default reply
  //  * @param {*} parsed
  //  * @param {*} context
  //  */
  // async replyWithDefault(parsed, context) {
  //   const actionName = parsed.groups.message // just responds to `message`
  //   const found = await this.tryAction({ actionName }, context)
  //   if (!found) {
  //     context.sendText(this.defaultReply())
  //   }
  //   return found
  // }

  // async askAboutThing(evt: SceneEvent) {
  //   const actionName = `${ evt.pres.parsed?.verb } ${ parsed.groups.target }`  // about chest
  //   const reply = await this.tryAction({ actionName }, context)
  //   if (!reply) {
  //     const msg = `I don't know about ${ parsed.groups.target }`
  //     context.sendText(msg)
  //   }
  //   return reply
  // }

  /**
   * add actors name
   * @param {} text
   */
  formatReply(text) {
    return `${this.formalName}: ${text}`
  }

  /**
   * pres is a fomatted parser reply
   * TODO fix called API standardize interface
   */
  // parserReply(parsed, context) {
  //   if (parsed.groups.message) {
  //     // simple reply to
  //     const reply = this.tryAction({
  //       actionName: parsed.groups.message,
  //       itemName: parsed.groups.item,
  //       modifier: parsed.groups.modifier,
  //       parsed
  //     }, context)
  //     return reply
  //   }
  //   return false
  // }

  /**
   * walk through the default replies in sequence
   */
  // defaultReply() {
  //   if (!this.doc.defaultReplies) return "..."  // base default reply
  //   this.defaultCount++
  //   if (this.defaultCount >= this.doc.defaultReplies.length) {
  //     this.defaultCount = 0 // reset
  //   }
  //   const text = this.doc.defaultReplies[this.defaultCount]
  //   const output = this.formatReply(text)
  //   return output
  // }

}

export default Actor
