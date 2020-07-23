const Logger = require('../../lib/Logger')
const GameObject = require('./GameObject')
const SlackAdapter = require('../../lib/adapters/SlackAdapter')

class Item extends GameObject {

  constructor(doc, room) {
    super(doc, room)
  }

}

module.exports = Item
