import { Logger } from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from '../pal/SlackBuilder'
import Room from './Room'
import Game from './Game'
// const assert = require('chai').assert
// const assert = require('assert').strict
import AppConfig from '../../lib/AppConfig'
import { SceneEvent } from '../MupTypes'
import { LoadOptions } from '../MupTypes'

class Story {
  game: Game
  room: Room    // fixme - when declared
  doc: any
  rooms: Room[]
  storyName: string

  constructor(opts: LoadOptions, game: Game) {
    this.game = game
    this.rooms = []       // FIXME - just to shut up typescript
    this.storyName = this.load(opts)
    this.room = {} as Room   // force a definition or we have to deal with room? everywhere
  }

  async reset(): Promise<Room> {
    Logger.log('story.reset')
    this.rooms.forEach(async room =>
      await room.reset()
    )
    const startRoomName = this.doc.startRoom
    if (startRoomName) {
      const room: Room | undefined = this.findRoomByName(startRoomName)
      if (!room) {
        return Logger.fatal('cannot find start room:' + startRoomName, {})
      }
      this.room = room
    } else {
      this.room = this.rooms[0]
    }
    return this.room
  }

  // async getRoom(): Promise<Room> {
  //   if (!this.currentRoom) {
  //     this.currentRoom = await this.reset()
  //   }
  //   return this.currentRoom
  // }
  // get room(): Room {
  //   if (!this.currentRoom) {
  //     this.currentRoom = await this.reset()
  //   }
  //   return this.currentRoom
  // }

  /**
   * called from Game
   * @param {*} opts
   * @memberof Story
   */
  load(opts: LoadOptions): string {
    // default to config if not passed
    const storyName =
      opts?.storyName ||
      this.storyName ||
      AppConfig.read('storyName')

    this.storyName = storyName // save for reload
    const fullDoc = Util.loadStoryDir(storyName)
    this.doc = fullDoc.story
    this.buildStory(fullDoc)
    const msg = 'reloaded' + this.storyName
    Logger.log(msg)
    return this.storyName
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

  findRoomByName(roomName: string): Room | undefined {
    if (!roomName) {
      Logger.error('findRoom but no roomName given')
    }
    const found = this.rooms.find(room => room.name === roomName)
    if (!found) {
      Logger.logObj('cannot find room:', `name: ${roomName}`)
    }
    return found
  }

  async gotoRoom(roomName: string, evt?: SceneEvent) {
    const room = this.findRoomByName(roomName)
    if (room) {
      this.room = room
      if (evt) {
        // else just go silently
        await this.room.enterRoom(evt)
      }
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

  status() {
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
