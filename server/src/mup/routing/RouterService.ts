import yaml from 'js-yaml'
import Game from '../models/Game'
import { GameManager } from '../models/GameManager'

import { Logger } from '../../lib/LogLib'
import Util from '../../lib/Util'
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from '../parser/RexParser'

import { SceneEvent } from '../MupTypes'


const RouterService = {

  lookRoom: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoom(evt)
  },

  // found: {route, parsed}
  goto: async (evt: SceneEvent) => {
    const roomName = evt.pres.parsed?.groups.roomName
    Logger.logObj('goto', roomName)
    await evt.game?.story.gotoRoom(roomName, evt)
  },

  startGame: async (evt: SceneEvent) => {
    await evt.game?.restart(evt)
  },

  lookRoomThing: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoomThing(evt)
  },

  takeRoomThing: async (evt: SceneEvent) => {
    return await evt.game?.story.room.takeItemCommand(evt)
  },

  useRoomThingAlone: async (evt: SceneEvent) => {
    return await evt.game?.story.room.useRoomThingAlone(evt)
  },

  useRoomThingOn: async (evt: SceneEvent) => {
    return await evt.game?.story.room.useRoomThingOn(evt)
  },

  echoTest: async (evt: SceneEvent) => {
    evt.pal.sendText('echo test back!')
  },

  getActionMatchesList(actions) {
    let lines = actions?.map(thing => {
      return { [thing.cname]: this.getActionMatchesThing(thing) }
    })
    return lines
  },

  getActionMatchesThing(thing) {
    const line = thing.doc?.actions?.map(action => action.match)
    return line || ''
  },

  handleCheat: async (evt: SceneEvent) => {
    const game = await GameManager.findGame({ pal: evt.pal })
    const info = {
      room: game.story.room.name,
      roomActions: RouterService.getActionMatchesThing(game.story.room),
      // itemEvents: RouterService.getActionMatchesList(game.story.currentRoom.items),
      actors: RouterService.getActionMatchesList(game.story.room.actors)
    }
    Logger.logObj('cheatInfo', info)
    const blob = yaml.dump(info)
    evt.pal.sendText(Util.quoteCode(blob))
    return info
  },

  handleHelp: async (evt: SceneEvent) => {
    const help = evt.game?.story.doc.help.basic
    await evt.pal.sendText(help)
  },

  reload: async (evt: SceneEvent) => {
    await evt.game?.reload(evt)
  },

  showStatus: async (evt: SceneEvent) => {
    await evt.game?.showStatus(evt.pal)
  },

  showLog: async (evt: SceneEvent) => {
    await evt.pal.sendText('-- sent log')
    await evt.pal.showLog()
  },

  // for quicker parsing
  cacheNames: async (evt: SceneEvent) => {
    const itemList = evt.game?.story.room.roomItems!
    await RexParser.cacheNames(itemList, evt.game.story.room.name)
    await evt.pal.sendText('rebuilt cache')
  },

  showInventory: async (evt: SceneEvent) => {
    return await evt.game?.player.showInventory(evt)
  },

  showNotes: async (evt: SceneEvent) => {
    return await evt.game.story.room.showNotes(evt)
  },

  showHint: async (evt: SceneEvent) => {
    return await evt.game.story.room.showHint(evt)
  },

  userJoined: async (evt: SceneEvent) => {
    return await evt.pal.sendText('Welcome new person!')
  },

  userLeft: async (evt: SceneEvent) => {
    return await evt.pal.sendText('Goodbye!')
  }

}

export { RouterService, SceneEvent }