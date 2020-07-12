const debug = require('debug')('mup:Player')
const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Player {
  constructor() {
    this.reset()
  }

  reset() {
    this.items = []
  }

  async status (context) {
    let reply = ["inventory: "]
    if (!this.items.length) {
      reply.push('nothing')
    } else this.items.map(item => {
      reply.push[`- ${item.name}`]
    })
    await SlackAdapter.sendList( reply, context )
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

  async inventory (context) {
    await context.sendText('You are holding:')
    if (!this.items.length) {
      return await SlackAdapter.sendText('nothing', context)
    } // else
    const itemNames = this.items.map((item) => item.name)
    await SlackAdapter.sendList(itemNames, context)
  }

}

module.exports = { Player }
