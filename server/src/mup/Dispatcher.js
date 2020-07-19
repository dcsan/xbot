const Game = require("./Game")
const Logger = require('../lib/Logger')
const RexParser = require('./parser/RexParser')

let GameList = {}

// static methods for the router

const Dispatcher = {

  async findGame (sid) {
    let gameSession = GameList[sid]
    if (!gameSession) {
      gameSession = new Game(sid)
      GameList[sid] = gameSession
      gameSession.init(false)
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', gameSession.story.room.name)
    }
    Logger.log('returning game', gameSession.sid)
    return gameSession
  },

  // run within game for session
  async gameRun (cmd, context) {
    const game = await Dispatcher.findGame(context.session.id)
    Logger.log('gameRun.cmd=', cmd)
    if (game[cmd]) {
      game[cmd](context)
    } else {
      Logger.error('no game cmd for ' + cmd)
    }
  },

  // TODO refactor these but have to move to typescript first
  async echo (context) {
    Logger.log('start echo')
    await Dispatcher.gameRun('echo', context)
  },
  async look (context) {
    Dispatcher.gameRun('look', context)
  },
  async hint (context) {
    Dispatcher.gameRun('hint', context)
  },
  async help (context) {
    Dispatcher.gameRun('help', context)
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
  async reload (context) {
    Dispatcher.gameRun('reload', context)
  },
  async reset (context) {
    Dispatcher.gameRun('reset', context)
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
    await game.story.examine(item, game.player, context)
  },

  async ask (
    context,
    {
      match: {
        groups: { message, actor },
      },
    }
  ) {
    const game = await Dispatcher.findGame(context.session.id)
    Logger.logObj('ask', {actor, message})
    await game.story.room.ask(actor, message)
  },

  async fallback (context) {
    const input = context.event.text
    Logger.log('fallback:', input)
    const parsed = RexParser.parseRules(input)
    // console.log('parsed', parsed)
    if (parsed && parsed.event) {
      const game = await Dispatcher.findGame(context.session.id)
      let actor, event, reply, actorName
      const player = game.player

      switch (parsed.target) {

        case 'findThing':
          event = parsed.event
          actor = game.story.room.findThing(parsed.groups.item)
          reply = await actor[event](parsed, context, player)
          return reply // for tests

        case 'firstActor':
          event = parsed.event
          actor = game.story.room.firstActor()
          reply = await actor[event](parsed, context, player)
          return reply // for tests

        // named actor
        case 'actor':
          actorName = parsed.groups.actor
          actor = actor = game.story.room.findActor(actorName)
          // event is set by parser ruleSet
          event = parsed.event
          if (actor[event]) {
            reply = await actor[event](parsed, context, player)
            return reply // for tests
          } else {
            context.sendText(`I don't know how to ${event}  ${actor.name}`)
            Logger.warn('cannot find event ', event, 'on actor:', actor.name)
          }

        case 'thing':
          Logger.warn('thing events not handled yet')
          return false  // not handled
      }
    } else {
      return Dispatcher.finalActions(context)
    }
  },

  // try event on all items in the room
  async finalActions (context) {
    const game = await Dispatcher.findGame(context.session.id)
    return game.story.room.tryActions(context)
  }

}


module.exports = Dispatcher
