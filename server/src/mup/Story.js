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

  start () {
    let blocks = []

    // if (this.doc.image) {
    //   const img = {
    //     "type": "image",
    //     "image_url": this.data.image,
    //     // title: {
    //     //   type: 'plain_text',
    //     //   text: this.data.examine
    //     // },
    //     "alt_text": this.description
    //   }
    //   blocks.push(img)
    // }

    const desc = {
      "type": "section",
      "block_id": "section567",
      "text": {
        "type": "mrkdwn",
        "text": this.doc.intro
      }
    }
    blocks.push(desc)

    const blob = {
      // text: this.data.examine,
      attachments: [
        {
          blocks
        }
      ]
    }

    Logger.logObj('start=>', blob)
    return blob

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

  status (context) {
    let msg = `story.room: ${this.room.doc.name}`
    SlackAdapter.flexOutput(msg, context)
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

  examine (itemName) {
    return this.room.examine(itemName)
  }

  stuff() {
    return this.room.stuff()
  }
}

module.exports = { Story }
