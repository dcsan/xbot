const { router, text, slack } = require('bottender/router')
// const Logger = require('./lib/Logger')

// const SlackAdapter = require('./lib/adapters/SlackAdapter')
// const debug = require('debug')('mup:index')
// const Util = require('./lib/Util')

// const Game = require('./mup/Game')
const Dispatcher = require('./mup/Dispatcher')

module.exports = async function App () {
  // Logger.log('init routes game', game)

  const routes = router([
    text(/^e$|^echo$/i, Dispatcher.echo),

    // text(/^test$/i, gameObj.SayTest),
    text(/^l$|^look$/i, Dispatcher.look ),
    text(/^h$|^hint$/i, Dispatcher.hint),

    text(/^help$/i, Dispatcher.help),
    text(/^i$|^inv$|^inventory$/i, Dispatcher.inventory),
    text(/^(x|examine|l|look at) (?<item>.*)$/i, Dispatcher.examine),

    // // debug commands
    text(/^start$/i, Dispatcher.start),
    text(/^st$|^status$/i, Dispatcher.status),
    text(['rs', 'reset'], Dispatcher.reset),
    text(['rl', 'reload'], Dispatcher.reload),

    // TODO - build list of actions on entering room
    // text(/^(?<action>open|use|read|get|take|give|drop) (?<item>.*)$/i, Dispatcher.actions),
    text(['things'], Dispatcher.things),

    // testing
    // text('menu', Dispatcher.menu.show),
    // text('image', Dispatcher.menu.testImage),
    // text(/delay/i, Dispatcher.delay),

    // text(/^(s|say) (?<item>.*) (to) (?<actor>.*)$/i, Dispatcher.ask),

    text('welcome', Dispatcher.welcome),
    slack.event('member_joined_channel', Dispatcher.welcome),
    slack.event('interactive_message', Dispatcher.button),
    text('*', Dispatcher.fallback),
    // slack.any(Dispatcher.HandleSlack),

  ])
  // Logger.log('router done', Dispatcher.story)
  return routes
}

// console.log('parsed botRoutes')
