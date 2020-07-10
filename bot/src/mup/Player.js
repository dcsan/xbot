const debug = require('debug')('mup:Player')
const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Player {
  constructor() {
    this.reset()
  }

  reset() {
    this.items = []
  }

  status (context) {
    let msg = "inventory: "
    this.items.map(item => {
      msg += `- ${item.name} \n`
    })
    context.sendText( msg )
  }

  addItem(item) {
    this.items.push(item)
  }

  addItemByName(itemName) {
    const item = {
      name: itemName,
    }
    this.addItem(item)
  }

  dropItem(item) {
    this.items.push(item)
  }

  hasItem(itemName) {
    let matchItems = this.items.filter((item) => {
      return item.name === itemName
    })
    debug('hasItem', itemName, matchItems)
    return (matchItems.length > 0)
  }

  inventory() {
    if (!this.items.length) {
      return ['nothing']
    }
    return this.items.map((item) => item.name)
  }
}

module.exports = { Player }
