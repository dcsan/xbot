import Item from './Item'
import Logger from '../../lib/Logger'
import { SceneEvent } from '../MupTypes'
// import { Pal } from '../pal/Pal'

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

  // add to inventory takeItem
  // this creates an extra reference so careful about memory leaks
  addItem(item) {
    this.items.push(item)
  }

  // addItemByName(itemName) {
  //   const item = {
  //     name: itemName,
  //   }
  //   this.addItem(item)
  // }

  dropItem(item) {
    this.items.push(item)
  }

  hasItem(cname: string) {
    let matchItems = this.items.filter((item) => {
      return item.cname === cname
    })
    Logger.log('hasItem', cname, matchItems)
    return (matchItems.length > 0)
  }

  async showInventory(evt: SceneEvent) {
    await evt.pal.sendText('You are holding:')
    if (!this.items.length) {
      return await evt.pal.sendText('nothing')
    } // else
    const itemNames = this.items.map((item) => item.name)
    await evt.pal.sendList(itemNames)
  }

}

export default Player
