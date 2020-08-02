import Item from './Item'
import { Logger } from '../../lib/Logger'
import { SceneEvent } from '../MupTypes'
import SlackBuilder from '../pal/SlackBuilder'
import { GameObject } from './GameObject'
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

  status() {
    const status = {
      inventory: this.invStatus()
    }
    return status
  }

  invStatus() {
    let reply: string[] = []
    // Logger.log('player.status.items:', this.items)
    if (!this.items.length) {
      reply.push('nothing')
    } else this.items.map(item => {
      // Logger.log('item', item)
      reply.push(item.name)
    })
    // Logger.log('player.status.reply:', reply)
    return reply
  }

  // add to inventory takeItem
  // this creates an extra reference so careful about memory leaks
  addItem(item) {
    this.items.push(item)
    this.status()
  }

  takeItem(item: GameObject) {
    this.addItem(item)
    item.room?.removeItemByCname(item.cname)
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
    // await evt.pal.sendText('Inventory:')
    const blocks: any[] = []

    if (!this.items.length) {
      blocks.push(SlackBuilder.textBlock("You aren't carrying anything"))
    } else {
      const buttonLinks = this.items.map(item => {
        return `${item.name}|x ${item.name}`
      })
      blocks.push(SlackBuilder.buttonsBlock(buttonLinks))
    }
    blocks.push(SlackBuilder.contextBlock(':bulb: hint: _try to `use item with ...` other things in the room_'))
    await evt.pal.sendBlocks(blocks)
  }

}

export default Player
