import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackAdapter from '../../lib/adapters/SlackAdapter'
import Room from './Room'
import Game from './Game'
// const assert = require('chai').assert
// const assert = require('assert').strict
import AppConfig from '../../lib/AppConfig'

class Story {
  game: Game
  currentRoom: Room    // fixme - when declared
  doc: any
  rooms: Room[]
  storyName: string

  constructor(game) {
    this.game = game
    this.rooms = []       // FIXME - just to shut up typescript
    this.storyName = ''   // FIXME - just to shut up typescript
    this.currentRoom = this.rooms[0]
  }

  get room(): Room {
    if (!this.currentRoom) this.reset()
    if (!this.currentRoom) {
      Logger.fatal('no current room', this.rooms)
    }
    return this.currentRoom
  }

  findRoom(roomName): Room {
    const found = this.rooms.find(room => room.name === roomName)
    if (!found) {
      return Logger.fatal('cannot find room', roomName)
    }
    return found
  }

  reset() {
    const startRoomName = this.doc.startRoom
    if (startRoomName) {
      this.currentRoom = this.findRoom(startRoomName)
    } else {
      this.currentRoom = this.rooms[0]
    }
  }

  /**
   *
   *
   * @param {*} opts
   * @memberof Story
   */
  load(opts) {
    const storyName = opts?.storyName || AppConfig.read('STORYNAME')
    this.storyName = storyName // save for reload

    // Logger.log('loading storyName', storyName)
    const fullDoc = Util.loadYaml(`stories/${ storyName }/story.yaml`)
    // @ts-ignore
    this.doc = fullDoc.story
    this.buildStory(fullDoc)
    // @ts-ignore
    Logger.logObj('loaded story', { name: this.doc.name })
    // @ts-ignore
    this.room.loadActors(this.doc.name)
  }

  async gotoRoom(roomName, context) {
    this.currentRoom = this.findRoom(roomName)
    await this.room.enter(context)
  }

  buildStory(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData, this)
      this.rooms.push(room)
    })
    this.reset()
  }

  async restart(context) {
    this.currentRoom.enter(context)
    // await this.help(context)
  }

  runCommand(commandName, context) {
    switch (commandName) {
      case '/hint':
        this.hint(context)
        break

      default:
        console.warn('unknown command:', commandName)
    }
  }

  async status() {
    // let msg = `\`${this.doc.cname}\``
    return {
      // @ts-ignore
      name: this.doc.cname
    }
  }

  hint(context) {
    const block = SlackAdapter.textBlock(":bulb: try reading the note")
    const msg = SlackAdapter.wrapBlocks([block])
    Logger.log('hint', msg)
    context.chat.postEphemeral(msg)
    // return msg
  }

  // look(context) {
  //   this.room.look(context)
  // }

  // examine(itemName, context) {
  //   return this.room.examine(itemName, context)
  // }

  things(context) {
    this.room.things(context)
  }

}

export default Story
