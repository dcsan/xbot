const { router, text, slack } = require('bottender/router')
// const Logger = require('./lib/Logger')

const Dispatcher = require('./mup/services/Dispatcher')

module.exports = async function App () {
  // Logger.log('init routes game', game)

  const routes = router([
    text(/^e$|^echo$/i, Dispatcher.echo),

    // text(/^test$/i, gameObj.SayTest),
    text(/^l$|^look$/i, Dispatcher.look),
    text(/^h$|^hint$/i, Dispatcher.hint),

    text(/^i$|^inv$|^inventory$/i, Dispatcher.inventory),
    // text(/^(x|examine|l|look at) (?<item>.*)$/i, Dispatcher.examine),

    // // debug commands
    // text(['rs', 'restart'], Dispatcher.restart),
    text(/^st$|^status$/i, Dispatcher.status),
    text(['rl', 'reload'], Dispatcher.reload),

    // TODO - build list of actions on entering room
    // text(/^(?<action>open|use|read|get|take|give|drop) (?<item>.*)$/i, Dispatcher.actions),
    // text(['things'], Dispatcher.things),

    text(/^help$/i, Dispatcher.help),
    // text('', Dispatcher.menu),
    // testing
    // text('image', Dispatcher.menu.testImage),
    // text(/delay/i, Dispatcher.delay),
    // text(/^(s|say) (?<item>.*) (to) (?<actor>.*)$/i, Dispatcher.ask),
    // text('welcome', Dispatcher.welcome),
    text('*', Dispatcher.fallback),
    slack.event('member_joined_channel', Dispatcher.welcome),
    // @ts-ignore
    slack.event('interactive_message', Dispatcher.slashCommand),
    // @ts-ignore
    slack.event('block_actions', Dispatcher.blockAction),
    slack.any(Dispatcher.otherEvent),

  ])
  // Logger.log('router done', Dispatcher.story)
  return routes
}

// console.log('parsed botRoutes')