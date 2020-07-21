const Game = require("./Game")
const Logger = require('../lib/Logger')
const RexParser = require('./parser/RexParser')
const Menu = require('./Menu')

let GameList = {}

const menu = new Menu()

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
    // Logger.log('returning game', gameSession.sid)
    return gameSession
  },

  // run within game for session
  async gameRun (cmd, context) {
    const game = await Dispatcher.findGame(context.session.id)
    Logger.log('gameRun.cmd=', cmd)
    if (game[cmd]) {
      return game[cmd](context)
    } else {
      Logger.error('no game cmd for ' + cmd)
    }
  },

  // TODO refactor these but have to move to typescript first
  async echo (context) {
    Logger.log('start echo')
    return await Dispatcher.gameRun('echo', context)
  },
  async look (context) {
    return Dispatcher.gameRun('look', context)
  },
  async hint (context) {
    return Dispatcher.gameRun('hint', context)
  },
  async inventory (context) {
    return Dispatcher.gameRun('inventory', context)
  },
  async restart (context) {
    return Dispatcher.gameRun('restart', context)
  },
  async status (context) {
    return Dispatcher.gameRun('status', context)
  },
  async action (context) {
    return Dispatcher.gameRun('action', context)
  },
  async things (context) {
    return Dispatcher.gameRun('things', context)
  },
  async welcome (context) {
    return Dispatcher.gameRun('welcome', context)
  },
  async reload (context) {
    return Dispatcher.gameRun('reload', context)
  },
  async reset (context) {
    return Dispatcher.gameRun('reset', context)
  },

  async help (context) {
    const game = await Dispatcher.findGame(context.session.id)
    await game.help(context)
  },

  async morehelp (context) {
    // return Dispatcher.gameRun('morehelp', context)
    const game = await Dispatcher.findGame(context.session.id)
    await game.moreHelp(context)
  },

  async button (context) {
    // const game = await Dispatcher.findGame(context.session.id)
    const buttonAction = context.event.rawEvent.actions[0]
    const value = buttonAction.value // look | examine | more
    switch (value) {
      case 'look':
        return Dispatcher.gameRun('look', context)
      case 'examine':
        return Dispatcher.examineWhat(context)
      case 'inventory':
        return Dispatcher.inventory(context)
      case 'morehelp':
        return Dispatcher.morehelp(context)
      default:
        Logger.warn('cannot find event', context.event)
    }
  },

  // TODO - show the list of items and remember context
  // or a popup dialog?
  async examineWhat (context) {
    await context.sendText('type `x thing` to pick what or who you want to look at')
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
      return await Dispatcher.finalActions(context)
    }
  },

  // try event on all items in the room
  async finalActions (context) {
    const game = await Dispatcher.findGame(context.session.id)
    Logger.log('finalActions', context.event.text)
    return await game.story.room.tryActions(context)
  }

}


module.exports = Dispatcher
