const debug = require('debug')('mup:Room')
const Item = require('./Item')

class Room {
  constructor(data) {
    this.data = data
    this.items = []
    this.data.items.forEach((itemData) => {
      const item = new Item(itemData)
      this.items.push(item)
    })
  }

  get name() {
    return this.data.name
  }

  look() {
    debug('look')
    let messages = [this.data.look]
    return messages
  }

  stuff() {
    const reply = []
    this.items.forEach((item) => reply.push(item.data.description))
    return reply.join('\n')
  }

  inspect(itemName) {
    if (!itemName) {
      debug('inspect: no itemname')
      return
    }
    debug('inspect', itemName)
    const name = itemName.toLowerCase()
    const found = this.items.filter((item) => item.name === name)
    if (found && found.length) {
      const first = found.pop()
      let message = first.inspect()
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
