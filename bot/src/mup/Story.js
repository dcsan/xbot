const fs = require('fs')
const path = require('path')
const debug = require('debug')('mup:Story')
const yaml = require('js-yaml')

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

  get room() {
    if (!this.currentRoom) this.reset()
    return this.currentRoom
  }

  reset() {
    this.currentRoom = this.rooms[0]
  }

  look() {
    return this.currentRoom.look()
  }

  inspect(itemName) {
    return this.room.inspect(itemName)
  }

  stuff() {
    return this.room.stuff()
  }
}

module.exports = { Story }
