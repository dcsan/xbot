const Logger = require('../../lib/Logger')
const Util = require('../../lib/Util')
const SlackAdapter = require('../../lib/adapters/SlackAdapter')
const Room = require('./Room')
// const assert = require('chai').assert
const assert = require('assert').strict
const AppConfig = require('../../lib/AppConfig')

class Story {

  constructor(game) {
    this.game = game
  }

  get room() {
    if (!this.currentRoom) this.reset()
    return this.currentRoom
  }

/**
 *
 *
 * @param {*} opts
 * @memberof Story
 */
load (opts) {
    const storyName = opts?.storyName || AppConfig.read('STORYNAME')

    // Logger.log('loading storyName', storyName)
    this.doc = Util.loadYaml(`stories/${storyName}/story.yaml`)
    this.buildStory(this.doc)
    // @ts-ignore
    Logger.logObj('loaded story', {name: this.doc.name})
    // @ts-ignore
    this.room.loadActors(this.doc.name)
  }

  reset () {
    this.currentRoom = this.rooms[0]
  }

  findRoom (roomName) {
    return this.rooms.find( room => room.name === roomName )
  }

  async gotoRoom (roomName, context) {
    this.currentRoom = this.findRoom(roomName)
    await this.currentRoom.enter(context)
  }

  buildStory(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData, this)
      this.rooms.push(room)
    })
    this.reset()
  }

  async restart (context) {
    let blocks = []
    // @ts-ignore
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
    let msg = [
      // @ts-ignore
      `_story_: \`${this.doc.cname}\` ${this.doc.name}`,
      `_room_: \`${this.room.doc.name}\``
    ]
    await SlackAdapter.sendList(msg, context)
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