const Game = require('../models/Game')
const Logger = require('../../lib/Logger')
const Util = require('../../lib/Util')
let GameList = {}

const RouterService = {

  async findGame (sid) {
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

  getActionMatchesList (actions) {
    let lines = []
    actions?.forEach(thing => {
      lines.push(this.getActionMatchesThing(thing))
    })
    return lines
  },

  getActionMatchesThing (thing) {
    const line = thing.doc?.actions?.map(action => action.match)
    return line
  },

  cheat: async (context) => {
    const game = await RouterService.findGame(context.session.id)
    const room = RouterService.getActionMatchesThing(game.story.currentRoom)
    const items = RouterService.getActionMatchesList(game.story.currentRoom.items)
    const actors = RouterService.getActionMatchesList(game.story.currentRoom.actors)
    const cheatInfo = { room, items, actors }
    // Logger.logObj('cheatInfo', cheatInfo)
    context.sendText(Util.quoteCode(JSON.stringify(cheatInfo, null, 2)))
    return cheatInfo
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

}

module.exports = RouterService
