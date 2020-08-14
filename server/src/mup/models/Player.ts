import Item from './Item'
import { Logger } from '../../lib/Logger'
import { SceneEvent } from '../MupTypes'
import SlackBuilder from '../pal/SlackBuilder'
import { GameObject } from './GameObject'
// import { Pal } from '../pal/Pal'

class Player extends GameObject {

  invItems: Item[]

  constructor(doc, story) {
    doc = {
      name: 'player'
    }
    super(doc, story, 'player')
    this.invItems = []
    this.reset()
  }

  reset() {
    this.invItems = []
  }

  status() {
    const status = {
      inventory: this.invStatus()
    }
    return status
  }

  invStatus() {
    let reply: string[] = []
    // Logger.log('player.status.invItems:', this.invItems)
    if (!this.invItems.length) {
      reply.push('nothing')
    } else this.invItems.map(item => {
      // Logger.log('item', item)
      reply.push(item.name)
    })
    // Logger.log('player.status.reply:', reply)
    return reply
  }

  // add to inventory takeItem
  // this creates an extra reference so careful about memory leaks
  // copies item but also leaves it in the room
  copyItem(item) {
    this.invItems.push(item)
    item.doc.hidden = false   // can always see things you're holding
    // this.status()
  }

  takeItem(item: GameObject): boolean {
    if (item.has === 'yes') {
      // this should have been checked already
      Logger.warn('already had item:', item)
      return false
    } // else
    item.has = "yes"
    this.copyItem(item)
    item.roomObj.removeItemByCname(item.cname)
    Logger.logObj('inv', this.invItems)
    return true
  }

  // addItemByName(itemName) {
  //   const item = {
  //     name: itemName,
  //   }
  //   this.addItem(item)
  // }

  // dropItem(item) {
  //   this.invItems.push(item)
  // }

  findItem(cname: string): Item | undefined {
    let matchItems = this.invItems.filter((item) => {
      return item.cname === cname
    })
    return matchItems.pop()
  }

  hasItem(cname: string): boolean {
    const item = this.findItem(cname)
    return !!item
  }

  async showInventory(evt: SceneEvent) {
    // await evt.pal.sendText('Inventory:')
    const blocks: any[] = []
    Logger.logObj('showInv', this.invItems)

    if (!this.invItems.length) {
      blocks.push(SlackBuilder.textBlock("You aren't carrying anything"))
    } else {
      const buttonLinks = this.invItems.map(item => {
        return `${item.name}|x ${item.name}`
      })
      blocks.push(SlackBuilder.buttonsBlock(buttonLinks))
    }
    blocks.push(SlackBuilder.contextBlock(':bulb: hint: _try to `use item with ...` other things in the room_'))
    await evt.pal.sendBlocks(blocks)
  }

}

export default Player
