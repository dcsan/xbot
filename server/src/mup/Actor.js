const GameObject = require('./GameObject')
const Logger = require('../lib/Logger')
var assert = require('assert');

class Actor extends GameObject {

  constructor(doc, room) {
    super(doc, room)
    this.defaultCount = 0
    this.state = 'default'
  }

  /**
   * with default reply
   * @param {*} text
   * @param {*} context
   */
  replyWithDefault (parsed, context) {
    const actionName = parsed.groups.message // just responds to `message`
    const found = this.tryAction({ actionName }, context)
    if (!found) {
      context.sendText(this.defaultReply())
    }
    return found
  }

  askAboutThing (parsed, context) {
    const actionName = `${parsed.verb} ${parsed.groups.thing}`  // about chest
    const reply = this.tryAction({actionName}, context)
    if (!reply) {
      const msg = `I don't know about ${parsed.groups.thing}`
      context.sendText(msg)
    }
    return reply
  }


  /**
   * add actors name
   * @param {} text
   */
  formatReply (text) {
    return `${this.formalName}: ${text}`
  }

  /**
   * pres is a fomatted parser reply
   * TODO fix called API standardize interface
   */
  parserReply (parsed, context) {
    if (parsed.groups.message) {
      // simple reply to
      const reply = this.tryAction({
        actionName: parsed.groups.message,
        itemName: parsed.groups.item,
        modifier: parsed.groups.modifier,
        parsed
      }, context)
      return reply
    }
  }

  /**
   * walk through the default replies in sequence
   */
  defaultReply () {
    if (!this.doc.defaultReplies) return "..."  // base default reply
    this.defaultCount++
    if (this.defaultCount >= this.doc.defaultReplies.length) {
      this.defaultCount = 0 // reset
    }
    const text = this.doc.defaultReplies[this.defaultCount]
    const output = this.formatReply(text)
    return output
  }

}

module.exports = Actor
