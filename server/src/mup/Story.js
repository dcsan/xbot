const fs = require('fs')
const path = require('path')
const debug = require('debug')('mup:Story')
const yaml = require('js-yaml')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')
const Room = require('./Room')

class Story {

  constructor() {

  }

  get room() {
    if (!this.currentRoom) this.reset()
    return this.currentRoom
  }

  reload(filename) {
    debug('loading:', filename)
    const filepath = path.join(__dirname, '../data', filename + '.yaml')
    debug('filepath', filepath)
    try {
      const doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
      this.doc = doc
      Logger.logObj('loaded story', {name: doc.name})
      this.build(doc)
    } catch (err) {
      console.error('failed to load', filename, err)
    }
  }

  build(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData)
      this.rooms.push(room)
    })
    this.reset()
  }

  reset() {
    this.currentRoom = this.rooms[0]
  }

  async start (context) {
    let blocks = []
    blocks.push(SlackAdapter.textBlock(this.doc.intro))
    await SlackAdapter.sendBlocks(blocks, context)
    await this.room.look(context)
  }

  runCommand (commandName, context) {
    switch (commandName) {
      case '/hint':
        this.hint(context)
        break

      default:
        console.warn('unknown command:', commandName)
    }
  }

  async status (context) {
    let msg = `_room_: ${this.room.doc.name}`
    await SlackAdapter.sendText(msg, context)
  }

  hint (context) {
    const block = SlackAdapter.textBlock(":bulb: try reading the note")
    const msg = SlackAdapter.wrapBlocks([block])
    Logger.log('hint', msg)
    context.chat.postEphemeral(msg)
    // return msg
  }

  look(context) {
    this.room.look(context)
  }

  examine (itemName, player, context) {
    return this.room.examine(itemName, player, context)
  }

  things(context) {
    this.room.things(context)
  }

}

module.exports = { Story }
