const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')
const GameObject = require('./GameObject')

class Item extends GameObject {

  constructor(doc, room) {
    super(doc, room)
  }

  get description () {
    return this.doc.text || this.doc.description || this.doc.name
  }

}

module.exports = Item
