import yaml from 'js-yaml'
import Game from '../models/Game'
import { GameManager } from '../models/GameManager'

import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import { Pal } from '../pal/Pal'
import { ParserResult } from './RexParser'



interface SceneEvent {
  pal: Pal,
  result: ParserResult  // parsed, rule
  game: Game
}

const RouterService = {


  lookRoom: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoom(evt)
  },

  // found: {route, parsed}
  goto: async (evt: SceneEvent) => {
    const roomName = evt.result.parsed?.groups.roomName
    Logger.logObj('goto', roomName)
    await evt.game.story.gotoRoom(evt, roomName)
  },

  startGame: async (evt: SceneEvent) => {
    await evt.game.restart(evt)
  },

  lookThing: async (evt: SceneEvent) => {
    return await evt.game.story.room.lookThing(evt)
  },

  echoTest: async (evt: SceneEvent) => {
    evt.pal.reply('echo test back!')
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
    const game = await GameManager.findGame(evt.pal)

    const info = {
      roomEvents: RouterService.getActionMatchesThing(game.story.currentRoom),
      itemEvents: RouterService.getActionMatchesList(game.story.currentRoom.items),
      actors: RouterService.getActionMatchesList(game.story.currentRoom.actors)
    }
    Logger.logObj('cheatInfo', info)
    const blob = yaml.dump(info)
    evt.pal.sendText(Util.quoteCode(blob))
    return info
  },

}

export { RouterService, SceneEvent }
