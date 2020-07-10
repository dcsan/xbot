const debug = require('debug')('mup:Room')
const Item = require('./Item')
const Logger = require('../lib/Logger')
const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Room {
  constructor(doc) {
    this.doc = doc
    this.items = []
    this.doc.items.forEach((itemData) => {
      const item = new Item(itemData)
      this.items.push(item)
    })
  }

  get name() {
    return this.doc.name
  }

  look() {
    debug('look')
    let messages = [this.doc.look]
    return messages
  }

  status(context) {
    const reply = []
    this.items.forEach((item) => {
      reply.push( `- ${item.doc.description}: ${item.state}`)
    })
    SlackAdapter.sendList(reply, context)
  }

  findItemByName (itemName) {
    const name = itemName.toLowerCase()
    const found = this.items.filter((item) => item.name === name)
    if (found) {
      return found[0] // dont modify items
    }
    return false
  }

  examine(itemName) {
    if (!itemName) {
      debug('examine: no itemname')
      return
    }
    const found = this.findItemByName(itemName)
    if (found) {
      Logger.log('found', found)
      let message = found.examine()
      return message
    } else {
      debug('not found', itemName, 'in', this.items)
      return `you don't see a ${itemName}`
    }
  }

  // triggers can interact between items in the same room
  runActions(action, itemName, player) {
    return this.items.map((item) => {
      if (itemName === item.name) {
        return item.runActions(action, player, this)
      }
    })
  }
}

module.exports = Room
