const GameObject = require('./GameObject')
const Logger = require('../lib/Logger')
var assert = require('assert');

class Actor extends GameObject {

  constructor(doc, room) {
    super(doc, room)
    this.defaultCount = 0
  }

  get name () {
    return this.doc.name
  }


  findTrigger (input) {
    const found = this.doc.triggers.find(trig => {
      const rex = new RegExp(trig.match)
      Logger.log('check', rex)
      if (input.match(rex)) {
        return trig.reply
        // return reply
      }
    })
    return found
  }

  /**
   * with default reply
   * @param {*} text
   * @param {*} context
   */
  replyWithDefault (text, context) {
    const found = this.replyTo(text, context)
    if (!found) {
      context.sendText(this.defaultReply())
    }
    return found
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
    return `${this.doc.name}: ${text}`
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