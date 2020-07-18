const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')
const GameObject = require('./GameObject')

class Item extends GameObject {

  constructor(doc, room) {
    super(doc, room)
  }

}

module.exports = Item
