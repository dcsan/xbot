const Game = require('../models/Game')
const Logger = require('../../lib/Logger')

let GameList = {}

const RouterService = {

  async findGame (sid) {
    let gameSession = GameList[sid]
    if (!gameSession) {
      gameSession = new Game(sid)
      GameList[sid] = gameSession
      await gameSession.init()
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', gameSession.story.room.name)
    }
    // Logger.log('returning game', gameSession.sid)
    return gameSession
  },

  boo: async (context) => {
    console.log('service.boo!')
  },

  startGame: async (context) => {
    console.log('game is', Game)
    const game = await RouterService.findGame(context.session.id)
    await game.restart(context)
  },

}

module.exports = RouterService
