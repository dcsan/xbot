const Game = require("./Game")
const Logger = require('../lib/Logger')

let GameList = {}

// static methods for the router

const Dispatcher = {

  async findGame (sid) {
    let gameSession = GameList[sid]
    if (!gameSession) {
      gameSession = new Game(sid)
      GameList[sid] = gameSession
      await gameSession.reset(false)
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', gameSession.story.room.name)
    }
    Logger.log('returning game', gameSession)
    return gameSession
  },

  // run within game for session
  async gameRun (cmd, context) {
    const game = await Dispatcher.findGame(context.session.id)
    console.log('cmd', cmd)
    game[cmd](context)
  },

  // TODO refactor these but have to move to typescript first
  async echo (context) {
    Dispatcher.gameRun('echo', context)
  },
  async look (context) {
    Dispatcher.gameRun('look', context)
  },
  async hint (context) {
    Dispatcher.gameRun('hint', context)
  },
  async inventory (context) {
    Dispatcher.gameRun('inventory', context)
  },
  async start (context) {
    Dispatcher.gameRun('start', context)
  },
  async status (context) {
    Dispatcher.gameRun('status', context)
  },
  async action (context) {
    Dispatcher.gameRun('action', context)
  },
  async things (context) {
    Dispatcher.gameRun('things', context)
  },
  async welcome (context) {
    Dispatcher.gameRun('welcome', context)
  },
  async fallback (context) {
    Logger.log('fallback', context.chat)
  },

  async button (context) {
    Logger.logObj('event', context.event)
    await context.sendText(
      `I received your '${context.event.callbackId}' action`
    )
  },

  async examine (
    context,
    {
      match: {
        groups: { item },
      },
    }
  ) {
    const game = await Dispatcher.findGame(context.session.id)
    Logger.logObj('examine item: ', item)
    await game.story.examine(item, this.player, context)
  },


}

module.exports = Dispatcher
