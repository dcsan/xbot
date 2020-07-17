const GameObject = require('./GameObject')
const Logger = require('../lib/Logger')
var assert = require('assert');

class Actor extends GameObject {

  constructor(doc, room) {
    super(doc, room)
    this.defaultCount = 0
    this.state = 'default'
  }

  findTrigger (text) {
    const found = this.doc.triggers.find(trigger => {
      const rex = new RegExp(trigger.match)
      Logger.log('check', rex)
      if (text.match(rex)) {
        return trigger
      }
    })
    return found
  }

  /**
   * with default reply
   * @param {*} text
   * @param {*} context
   */
  replyWithDefault (parsed, context) {
    const text = parsed.groups.message // just responds to `message`
    const found = this.replyTo(text, context)
    if (!found) {
      context.sendText(this.defaultReply())
    }
    return found
  }

  askAboutThing (parsed, context) {
    const text = `${parsed.verb} ${parsed.groups.thing}`  // about chest
    // console.log('built text', text)
    const reply = this.replyTo(text, context)
    if (!reply) {
      const msg = `I don't know about ${parsed.groups.thing}`
      context.sendText(msg)
    }
    return reply
  }

  /**
   * simple reply to text string
   * @param {*} text
   * @param {*} context
   */
  replyTo (text, context) {
    if (!text || text.length < 1) {
      Logger.error("ask with no text")
      return false
    }
    const found = this.findTrigger(text)
    if (found) {
      const msg = this.formatReply(found.reply)
      context.sendText(msg)
    }
    return found
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
   */
  parserReply (parsed, context) {
    if (parsed.groups.message) {
      // simple reply to
      const reply = this.replyTo(parsed.groups.message, context)
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