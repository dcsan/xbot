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

  ask (input, context) {

    // @ts-ignore
    assert(input.length > 0, "ask with no text")
    const found = this.doc.triggers.find(trig => {
      const rex = new RegExp(trig.match)
      Logger.log('check', rex)
      if (input.match(rex)) {
        return trig.reply
        // return reply
      }
    })
    Logger.logObj('reply', { input, found })
    let text
    if (found) {
      text = found.reply
    } else {
      text = this.defaultReply()
    }
    const msg = `${this.doc.name}: ${text}`
    context.sendText(msg)
    // Logger.logObj('no match in triggers', {input, triggers: this.doc.triggers})
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
    const reply = this.doc.defaultReplies[this.defaultCount]
    return reply
  }

}

module.exports = Actor