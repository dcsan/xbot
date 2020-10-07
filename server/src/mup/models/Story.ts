import { MakeLogger } from '../../lib/LogLib'
import { Pal } from '../pal/Pal'
import Util from '../../lib/Util'
import SlackBuilder from '../pal/slack/SlackBuilder'
import Room from './Room'
import Game from './Game'
// const assert = require('chai').assert
// const assert = require('assert').strict
import AppConfig from '../../lib/AppConfig'
import { SceneEvent } from '../MupTypes'
import { LoadOptions } from '../MupTypes'
import { RexParser } from '../parser/RexParser'

const logger = new MakeLogger('Story')

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

  async reset(pal: Pal): Promise<Room> {
    logger.log('story.reset')
    for (const room of this.rooms) {
      await room.reset()
    }
    // load the right room for this channel
    let startRoomName
    // @ts-ignore  // FIXME lastEvent.channel only works for discord
    const channelName = pal.lastEvent.channel?.name
    if (!channelName) {
      // FIXME - slack?
      logger.warn('cannot find channelName for lastEvent:', pal.lastEvent)
    } else {
      const startRoom = this.doc.startRooms.find(elem => {
        const rex = new RegExp(elem.channels)
        return rex.test(channelName)
      })
      startRoomName = startRoom?.room
    }
    if (!startRoomName) {
      logger.warn('cannot find startRoomName for channel: ', channelName)
      startRoomName = this.doc.startRoomDefault
    }

    if (startRoomName) {
      const room: Room | undefined = this.findRoomByName(startRoomName)
      if (!room) {
        logger.warn('cannot find room for startRoomName: ', startRoomName)
        this.room = this.rooms[0]
      } else {
        logger.log('OK reset to room', room.name)
        this.room = room
      }
    }
    return this.room
  }

  findRoomByName(name) {
    return (this.rooms.find(rm => rm.name === name))
  }

  /**
   * called from Game
   * @param {*} opts
   * @memberof Story
   */
  load(_opts: LoadOptions): string {
    // default to config if not passed
    const storyName = AppConfig.read('storyName')

    // const storyName =
    //   opts?.storyName ||
    //   this.storyName ||
    //   AppConfig.read('storyName')

    this.storyName = storyName // save for reload
    const fullDoc = Util.loadStoryDir(storyName)
    this.doc = fullDoc.story
    this.buildStory(fullDoc)
    const msg = 'reloaded' + this.storyName
    logger.log(msg)
    return this.storyName
  }

  buildStory(doc) {
    this.rooms = []
    doc.rooms.forEach((roomData) => {
      const room = new Room(roomData, this)
      room.story = this
      this.rooms.push(room)
    })
    // this.reset()
  }

  async gotoRoom(roomName: string, evt?: SceneEvent) {

    const room = this.findRoomByName(roomName)
    if (!room) {
      logger.warn('cannot find goto room', roomName)
    }
    if (room) {
      logger.log('gotoRoom', roomName)
      this.room = room
      RexParser.cacheNames(room.roomItems, room.name)
      if (evt) {
        await this.room.enterRoom(evt.pal)
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
    logger.log('hint', msg)
    context.chat.postEphemeral(msg)
    // return msg
  }
}

export default Story
