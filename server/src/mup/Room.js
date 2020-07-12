const debug = require('debug')('mup:Room')
const Item = require('./Item')
const Logger = require('../lib/Logger')
const SlackAdapter = require('../lib/adapters/SlackAdapter')
const GameObject = require('./GameObject')

class Room extends GameObject {
  constructor(doc) {
    super(doc)
    this.items = []
    this.doc.items.forEach((itemData) => {
      const item = new Item(itemData, this)
      this.items.push(item)
    })
  }

  get name() {
    return this.doc.name
  }

  look(context) {
    const blocks = [
      SlackAdapter.textBlock(this.doc.description),
      SlackAdapter.imageBlock(this.doc),
      SlackAdapter.textBlock(this.doc.caption) || '...',  // FIXME always check we have a caption
    ]
    SlackAdapter.sendBlocks(blocks, context)
  }

  async status(context) {
    const reply = ["room items:"]
    this.items.forEach((item) => {
      reply.push( `- ${item.doc.name}: ${item.state}`)
    })
    await SlackAdapter.sendList(reply, context)
  }

  findItemByName (itemName) {
    const name = itemName.toLowerCase()
    const found = this.items.filter((item) => item.name === name)
    if (found.length) {
      const item = found[0] // dont modify items
      Logger.logObj('found Item:', {itemName, item})
      return item
    } else {
      Logger.log('cannot find item:', itemName)
      return false
    }
  }

  async examine(itemName, player, context) {
    if (!itemName) {
      debug('examine: no itemname')
      return
    }

    const item = this.findItemByName(itemName)
    if (!item) {
      debug('not found', itemName, 'in', this.items)
      const msg = `you don't see a ${itemName}`
      await SlackAdapter.sendText(msg, context)
    } else {
      Logger.log('ex item', item)
      // check if there's a special 'examine' event
      const foundAction = await item.itemActions('examine', player, context)
      Logger.log('foundAction', foundAction)
      if (!foundAction) {
        await item.examine(context, player) // default examine
      }
    }
  }

  // TODO refactor move to GameObject ?
  // triggers can interact between items in the same room
  runActions (action, itemName, player, context) {
    // this.runRoomActions()  // TODO
    return this.items.map((item) => {
      if (itemName === item.name) {
        item.itemActions(action, player, context)
      }
    })
  }

}

module.exports = Room
