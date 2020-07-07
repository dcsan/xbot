const fs = require('fs')
const path = require('path')
const debug = require('debug')('mup:Story')
const yaml = require('js-yaml')
const Logger = require('../lib/Logger')

const Room = require('./Room')

class Story {
  reload(filename) {
    debug('loading:', filename)
    const filepath = path.join(__dirname, '../data', filename + '.yaml')
    debug('filepath', filepath)
    try {
      const doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
      this.doc = doc
      debug('doc', JSON.stringify(doc, null, 2))
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

  get room() {
    if (!this.currentRoom) this.reset()
    return this.currentRoom
  }

  look() {
    return this.currentRoom.look()
  }

  examine (itemName) {
    return this.room.examine(itemName)
  }

  stuff() {
    return this.room.stuff()
  }
}

module.exports = { Story }
