import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from '../pal/SlackBuilder'
import Room from './Room'
import Game from './Game'
// const assert = require('chai').assert
// const assert = require('assert').strict
import AppConfig from '../../lib/AppConfig'
import { SceneEvent } from '../routes/RouterService'

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

  reset() {
    const startRoomName = this.doc.startRoom
    if (startRoomName) {
      const room = this.findRoom(startRoomName)
      if (room) this.currentRoom = room
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
  }

  buildStory(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData, this)
      room.story = this
      this.rooms.push(room)
    })
    this.reset()
  }

  findRoom(roomName: string): Room | undefined {
    if (!roomName) {
      Logger.error('findRoom but no roomName given')
    }
    const found = this.rooms.find(room => room.name === roomName)
    if (!found) {
      Logger.logObj('cannot find room:', `name: ${ roomName }`)
    }
    return found
  }

  async gotoRoom(evt: SceneEvent, roomName: string) {
    const room = this.findRoom(roomName)
    if (room) {
      this.currentRoom = room
      await this.room.enter(evt)
    }
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
    const block = SlackBuilder.textBlock(":bulb: try reading the note")
    const msg = SlackBuilder.wrapBlocks([block])
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

  // things(context) {
  //   this.room.things(context)
  // }

}

export default Story
