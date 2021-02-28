// Player in game
// TODO - move inventory code to another module

import Item from './Item'
import { MakeLogger } from '../../lib/LogLib'
import { SceneEvent } from '../MupTypes'
import { GameObject } from './GameObject'
// import { BaseBuilder } from '../pal/base/BaseBuilder'
// import { Pal } from '../pal/Pal'
import WordUtils from '../../lib/WordUtils';

const logger = new MakeLogger('player')
const INV_LIST_MODE = true

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
      reply.push(item.cname)
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

  // check item as dnoe for task list /goals
  doneItem(cname: string): boolean {
    cname = WordUtils.makeCname(cname)
    const item = this.findThing(cname)
    if (item) {
      item.doc.done = true
      return true
    } else {
      logger.warn('cannot find item', cname)
      return false
    }
  }

  async showGoals(evt: SceneEvent) {
    // show the inv as a LIST of items
    const blocks: any[] = []
    const builder = evt.pal.builder
    logger.logObj('showInv', this.invItems)

    if (!this.invItems.length) {
      blocks.push(builder.textBlock(
        `No goals set`
      ))
    } else {
      this.invItems.forEach(item => {
        const checked = item.doc.done ? '[√]' : '[ ]'
        blocks.push(
          builder.textBlock(`${checked} ${item.name} | ${item.description}`)
        )
      })
    }
    logger.log('items', blocks)
    await evt.pal.sendBlocks(blocks)
  }

  async showInventory(evt: SceneEvent) {
    // await evt.pal.sendText('Inventory:')

    const blocks: any[] = []
    const builder = evt.pal.builder
    logger.logObj('showInv', this.invItems)

    if (!this.invItems.length) {
      blocks.push(builder.textBlock(
        `You aren't carrying anything.
        \nType \`get (name of item)\` to pick things up.`
      ))
    } else {
      const buttonLinks = this.invItems.map(item => {
        return `${item.name}|x ${item.name}`
      })
      // buttonLinks.push(`notebook | x notebook`) // artificial
      blocks.push(builder.buttonsBlock(buttonLinks))
    }

    // special case when its just the notebook
    if (this.invItems.length === 1 && this.invItems[0].name === 'Note') {
      blocks.push(builder.contextBlock(
        ':pencil2: to examine the note type: ```fix\nx note``` '))
    } else {
      blocks.push(builder.contextBlock(
        ':pencil2: type `x (name of item)` to examine anything'))
    }

    // blocks.push(BaseBuilder.contextBlock(':information_source: hint: _try to `use item with ...` other things in the room_'))
    await evt.pal.sendBlocks(blocks)
  }

}

export default Player
