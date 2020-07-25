import SlackBuilder from '../pal/SlackBuilder'
import Item from './Item'
import Logger from '../../lib/Logger'

class Player {

  items: Item[]

  constructor() {
    this.items = []
    this.reset()
  }

  reset() {
    this.items = []
  }

  async status() {
    let reply: string[] = []
    if (!this.items.length) {
      reply.push('nothing')
    } else this.items.map(item => {
      reply.push[`- ${ item.name }`]
    })
    return reply
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
    Logger.log('hasItem', itemName, matchItems)
    return (matchItems.length > 0)
  }

  async inventory(context) {
    await context.sendText('You are holding:')
    if (!this.items.length) {
      return await SlackBuilder.sendText('nothing', context)
    } // else
    const itemNames = this.items.map((item) => item.name)
    await SlackBuilder.sendList(itemNames, context)
  }

}

export default Player
