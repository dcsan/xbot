import yaml from 'js-yaml'
import Game from '../models/Game'
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
let GameList = {}

const RouterService = {

  async findGame(sid) {
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

  boo: async (context) => {
    context.sendText('boo')
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

  cheat: async (context) => {
    const game = await RouterService.findGame(context.session.id)

    const info = {
      roomEvents: RouterService.getActionMatchesThing(game.story.currentRoom),
      itemEvents: RouterService.getActionMatchesList(game.story.currentRoom.items),
      actors: RouterService.getActionMatchesList(game.story.currentRoom.actors)
    }
    Logger.logObj('cheatInfo', info)
    const blob = yaml.dump(info)
    context.sendText(Util.quoteCode(blob))
    return info
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

  lookRoom: async (context, found) => {
    const game = await RouterService.findGame(context.session.id)
    return await game.story.room.lookAt(context, found)
  },

  lookThing: async (context, found) => {
    const game = await RouterService.findGame(context.session.id)
    return await game.story.room.lookAt(context, found)
  }

}

export default RouterService
