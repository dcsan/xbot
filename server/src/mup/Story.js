const Logger = require('../lib/Logger')
const Util = require('../lib/Util')
const SlackAdapter = require('../lib/adapters/SlackAdapter')
const Room = require('./Room')
// const assert = require('chai').assert
const assert = require('assert').strict
const AppConfig = require('../lib/AppConfig')

class Story {

  constructor(game) {
    this.game = game
  }

  get room() {
    if (!this.currentRoom) this.reset()
    return this.currentRoom
  }

  /**
   * either of the params can be empty
   * load story script without resetting state
   * @param {*} param0
   */
  load ({storyName, context}) {
    Logger.log('loading storyName', storyName)
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

  buildStory(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData, this)
      this.rooms.push(room)
    })
    this.reset()
  }

  async start (context) {
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
