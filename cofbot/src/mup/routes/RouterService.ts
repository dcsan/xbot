import yaml from 'js-yaml'
import Game from '../models/Game'
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import { Pal } from '../pal/Pal'
import { ParserResult } from './RexParser'

let GameList: Game[] = []

interface SceneEvent {
  pal: Pal,
  result: ParserResult  // parsed, rule
}

const RouterService = {

  // TODO store in mongo
  async findGame(pal: Pal): Promise<Game> {
    const sid = pal.sessionId
    let game = GameList[sid]
    if (!game) {
      game = new Game(sid)
      GameList[sid] = game
      await game.init()
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', game.story.room.name)
    }
    // Logger.log('returning game', gameSession.sid)
    return game
  },

  handleCheat: async (evt: SceneEvent) => {
    Logger.log('handleCheat', evt)
    evt.pal.reply('found cheat')
  },

  lookRoom: async (evt: SceneEvent) => {
    const game = await RouterService.findGame(evt.pal)
    return await game.story.room.lookRoom(evt)
  },

  // found: {route, parsed}
  goto: async (context, found) => {
    Logger.logObj('goto.found', found)
    const roomName = found.parsed.groups.roomName
    const game = await RouterService.findGame(context.session.id)
    await game.story.gotoRoom(roomName, context)
  },

  startGame: async (context) => {
    const game = await RouterService.findGame(context.session.id)
    await game.restart(context)
  },

  lookThing: async (context, found) => {
    const game = await RouterService.findGame(context.session.id)
    return await game.story.room.lookAt(context, found)
  }

  // boo: async (context) => {
  //   context.sendText('boo')
  // },

  // getActionMatchesList(actions) {
  //   let lines = actions?.map(thing => {
  //     return { [thing.cname]: this.getActionMatchesThing(thing) }
  //   })
  //   return lines
  // },

  // getActionMatchesThing(thing) {
  //   const line = thing.doc?.actions?.map(action => action.match)
  //   return line || ''
  // },

  // cheat: async (context) => {
  //   const game = await RouterService.findGame(context.session.id)

  //   const info = {
  //     roomEvents: RouterService.getActionMatchesThing(game.story.currentRoom),
  //     itemEvents: RouterService.getActionMatchesList(game.story.currentRoom.items),
  //     actors: RouterService.getActionMatchesList(game.story.currentRoom.actors)
  //   }
  //   Logger.logObj('cheatInfo', info)
  //   const blob = yaml.dump(info)
  //   context.sendText(Util.quoteCode(blob))
  //   return info
  // },

}

export { RouterService, SceneEvent }
