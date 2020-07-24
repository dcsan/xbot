// import Logger from '../../lib/Logger'
// import { RexParser } from '../routes/RexParser'
// import RouterService from '../routes/RouterService'
// // const Menu = require('./Menu')
// // const menu = new Menu()

// const Dispatcher = {

//   // run within game for session
//   async gameRun(cmd, context) {
//     const game = await RouterService.findGame(context.session.id)
//     Logger.log('gameRun.cmd=', cmd)
//     if (game[cmd]) {
//       return game[cmd](context)
//     } else {
//       Logger.error('no game cmd for ' + cmd)
//     }
//   },

//   // TODO refactor these but have to move to typescript first
//   async echo(context) {
//     Logger.log('start echo')
//     return await Dispatcher.gameRun('echo', context)
//   },
//   async look(context) {
//     return Dispatcher.gameRun('look', context)
//   },
//   async hint(context) {
//     return Dispatcher.gameRun('hint', context)
//   },
//   async inventory(context) {
//     return Dispatcher.gameRun('inventory', context)
//   },
//   async restart(context) {
//     return Dispatcher.gameRun('restart', context)
//   },
//   async status(context) {
//     return Dispatcher.gameRun('status', context)
//   },
//   async action(context) {
//     return Dispatcher.gameRun('action', context)
//   },
//   async things(context) {
//     return Dispatcher.gameRun('things', context)
//   },
//   async welcome(context) {
//     return Dispatcher.gameRun('welcome', context)
//   },
//   async reload(context) {
//     return Dispatcher.gameRun('reload', context)
//   },
//   async reset(context) {
//     return Dispatcher.gameRun('reset', context)
//   },

//   async help(context) {
//     const game = await RouterService.findGame(context.session.id)
//     await game.help(context)
//   },

//   async morehelp(context) {
//     // return Dispatcher.gameRun('morehelp', context)
//     const game = await RouterService.findGame(context.session.id)
//     await game.moreHelp(context)
//   },

//   async blockAction(context) {
//     Logger.logObj('button', context.event)
//     Logger.logObj('event.text', context.event.text)
//     Logger.logObj('event.command', context.event.command)

//     // const game = await RouterService.findGame(context.session.id)
//     const buttonAction = context.event.rawEvent.actions[0]
//     Logger.logObj('buttonAction', buttonAction)
//     const value = buttonAction.value // look | examine | more

//     switch (value) {
//       case 'look':
//         return Dispatcher.gameRun('look', context)
//       case 'examine':
//         return Dispatcher.examineWhat(context)
//       case 'inventory':
//         return Dispatcher.inventory(context)
//       case 'morehelp':
//         return Dispatcher.morehelp(context)
//       default:
//         Logger.warn('cannot find event', context.event)
//         // just send it as text input
//         await Dispatcher.fallback(context, value)
//     }
//   },

//   async otherEvent(context) {
//     Logger.logObj('other event', context.event)
//     Logger.logObj('event.rawEvent.actions', context.event.rawEvent.actions)
//     Logger.logObj('other.text', context.event.text)
//     Logger.logObj('other.command', context.event.command)
//   },

//   // TODO - show the list of items and remember context
//   // or a popup dialog?
//   async examineWhat(context) {
//     await context.sendText('type `x thing` to pick what or who you want to look at')
//   },

//   async examine(
//     context,
//     {
//       match: {
//         groups: { item },
//       },
//     }
//   ) {
//     const game = await RouterService.findGame(context.session.id)
//     Logger.logObj('examine item: ', item)
//     await game.story.examine(item, game.player, context)
//   },

//   async ask(
//     context,
//     {
//       match: {
//         groups: { message, actor },
//       },
//     }
//   ) {
//     const game = await RouterService.findGame(context.session.id)
//     Logger.logObj('ask', { actor, message })
//     await game.story.room.ask(actor, message)
//   },

//   // complex actions like `use X on Y`
//   async parseRegexRoutes(context, input) {
//     const parsed = RexParser.parseRegexRules(input)
//     // console.log('parsed', parsed)
//     if (parsed && parsed.event) {
//       const game = await RouterService.findGame(context.session.id)
//       let actor, event, reply, actorName
//       const player = game.player

//       switch (parsed.target) {

//         case 'findThing':
//           event = parsed.event
//           actor = game.story.room.findThing(parsed.groups.item)
//           reply = await actor[event](parsed, context, player)
//           return reply // for tests

//         case 'firstActor':
//           event = parsed.event
//           actor = game.story.room.firstActor()
//           if (actor) {
//             reply = await actor[event](parsed, context, player)
//             return reply // for tests
//           }
//           break

//         // named actor
//         case 'actor':
//           actorName = parsed.groups.actor
//           actor = actor = game.story.room.findActor(actorName)
//           if (!actor) break
//           // event is set by parser ruleSet
//           event = parsed.event
//           if (actor[event]) {
//             reply = await actor[event](parsed, context, player)
//             return reply // for tests
//           } else {
//             context.sendText(`I don't know how to ${ event }  ${ actor.name }`)
//             Logger.warn('cannot find event ', event, 'on actor:', actor.name)
//           }
//           return true

//         case 'thing':
//           Logger.warn('thing events not handled yet')
//           return false  // not handled
//       }
//     }
//   },

//   /**
//    * basic routes like `restart` or `examine X`
//    *
//    * @param {*} context
//    * @param {*} input
//    * @returns
//    */
//   async commandActions(context, input) {
//     input = input || context.event.text
//     const found = RexParser.commandParser(input)
//     if (found?.route) {
//       Logger.logObj('fixedRoutes.found', found)
//       const func = found.route.event
//       await func(context, found)
//       return found
//     }
//     return false
//   },

//   /**
//    * try event on all items in the room
//    * then the room itself
//    * @param {*} context
//    * @param {*} input
//    * @returns
//    */
//   async roomActions(context, input) {
//     const game = await RouterService.findGame(context.session.id)
//     return await game.story.room.tryRoomActions(input, context)
//   },


//   // try event on all items in the room
//   // then the room itself
//   async basicInputActions(context, input) {
//     input = input || context.event.text
//     const game = await RouterService.findGame(context.session.id)
//     const parsed = RexParser.basicInputParser(input, game.story.currentRoom)
//     return await game.story.room.tryAllActions(parsed, context)
//   },

//   // allows us to override input
//   async fallback(context, input) {
//     // Logger.logObj('fallback =>', { input, event: context.event })
//     if (typeof input !== 'string') {
//       // we got an empty object from the botTender
//       input = context.event.text
//     }

//     Logger.log('fallback:.input', input)
//     const found =
//       await Dispatcher.commandActions(context, input) ||
//       await Dispatcher.roomActions(context, input) ||
//       await Dispatcher.basicInputActions(context, input) ||
//       await Dispatcher.parseRegexRoutes(context, input)
//   },

// }


// export default Dispatcher
