import Item from './Item'
import { MakeLogger } from '../../lib/LogLib'
import { SceneEvent } from '../MupTypes'
import { BaseBuilder } from '../pal/base/BaseBuilder'
import { GameObject } from './GameObject'
// import { Pal } from '../pal/Pal'
import WordUtils from '../../lib/WordUtils';

const logger = new MakeLogger('player')

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
    // logger.log('player.status.invItems:', this.invItems)
    if (!this.invItems.length) {
      reply.push('nothing')
    } else this.invItems.map(item => {
      // logger.log('item', item)
      reply.push(item.name)
    })
    // logger.log('player.status.reply:', reply)
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
      logger.warn('already had item:', item.doc)
      // return false
    } // else
    item.has = "yes"
    this.copyItem(item)
    item.roomObj.removeItemByCname(item.cname)
    logger.log('invItems.length', this.invItems.length)
    logger.logObj('invItems:', { items: this.invItems })
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

  findThing(cname: string): Item | undefined {
    cname = WordUtils.makeCname(cname)
    let matchItems = this.invItems.filter((item) => {
      return item.cname === cname
    })
    const found = matchItems.pop()
    if (!found) {
      logger.logObj(`cant find [${cname}] in invItems:`, { invItems: this.invItems })
      return
    }
    return found
  }

  hasItem(cname: string): boolean {
    cname = WordUtils.makeCname(cname)
    const item = this.findThing(cname)
    return !!item
  }

  async showInventory(evt: SceneEvent) {
    // await evt.pal.sendText('Inventory:')

    const blocks: any[] = []
    const builder = evt.pal.builder
    logger.logObj('showInv', this.invItems)

    if (!this.invItems.length) {
      blocks.push(builder.textBlock("You aren't carrying anything. Type `get (name of item)` to pick things up."))
    } else {
      const buttonLinks = this.invItems.map(item => {
        return `${item.name}|x ${item.name}`
      })
      // buttonLinks.push(`notebook | x notebook`) // artificial
      blocks.push(builder.buttonsBlock(buttonLinks))
      blocks.push(builder.contextBlock(
        ':pencil2: you can `x item` to examine it'))
    }
    // blocks.push(BaseBuilder.contextBlock(':information_source: hint: _try to `use item with ...` other things in the room_'))
    await evt.pal.sendBlocks(blocks)
  }

}

export default Player
