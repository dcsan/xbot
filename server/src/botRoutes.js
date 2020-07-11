const { router, text, slack } = require('bottender/router')
const { Story } = require('./mup/Story')
const { Player } = require('./mup/Player')
const Menu = require('./mup/Menu')
const Logger = require('./lib/Logger')
const SlackAdapter = require('./lib/adapters/SlackAdapter')
const Game = require('./mup/Game')
const debug = require('debug')('mup:index')

let story
let player // TODO - sessions
let menu
let game


const config = {
  storyName: 'office-hack',
}

function flatten (textList) {
  textList = textList.filter(n => n) // remove nulls / empties
  return textList.join('\n')
}

function init () {
  story = new Story()
  player = new Player()
  Reset()
  Logger.log('setup botRoutes')
}

async function SayTest (context) {
  await context.sendText('Testing OK!')
}

async function reload (context) {
  await context.sendText('reloading...')
  story.reload(config.storyName)
  await context.sendText('loaded!')
}

async function Look (context) {
  await story.look(context)
}

async function Stuff (context) {
  const msg = story.stuff()
  await context.sendText(msg)
}

async function Reset (context) {
  story.reload(config.storyName)
  menu = new Menu()
  game = new Game()
  player.reset()
  story.reset()
  if (context) {
    await context.sendText("reset done!")
  }
}

async function Inventory (context) {
  const invItems = player.inventory()
  await context.sendText('You are holding:')
  await context.sendText(flatten(invItems))
}

async function Help (context) {
  await game.help(context)
}

async function Hint (context) {
  // context.postEphemeral({ text: 'Hint!' });
  story.runCommand('/hint', context)
}



async function Examine (
  context,
  {
    match: {
      groups: { item },
    },
  }
) {
  debug('examine: ', item)
  await context.sendText(`you examine the ${item}`)
  const msg = story.examine(item)
  await SlackAdapter.flexOutput(msg, context)
}

async function Actions (
  context,
  {
    match: {
      groups: { action, item },
    },
  }
) {
  debug('actions: ', item)
  // await context.sendText(`trying ${action} on ${item} ...`)
  await story.room.runActions(action, item, player, context)
}

async function HandleSlack (context) {
  // debug('slack.any', context)
  if (context.chat)
  debug('rawEvent', context.event.rawEvent)
  debug('event.type', context.event.type)
  debug('event.subtype', context.event.subtype)
  debug('event.action', context.event.action)
  debug('event.command', context.event.command)

  if (context.event.action) {
    Logger.logObj('.action:', context.event.action.value)
    context.sendText(`event.action: ${context.event.action.value}`)
  } else if (context.event.command) {
    const commandText = context.event.command
    Logger.logObj('commandText:', commandText)
    story.runCommand(commandText, context)
    // context.chat.postMessage(result)
    // context.sendText(`other event ${context.event.type}`)
  } else {
    Logger.logObj('unknown slack event:', context.event)
  }
}

async function Welcome (context) {
  debug('Welcome event', context.event.rawEvent)
  context.sendText('Welcome!')
}

async function Button (context) {
  debug('event', context.event)
  await context.sendText(
    `I received your '${context.event.callbackId}' action`
  )
}

async function Start (context) {
  await context.chat.postMessage(
    story.start()
  )
}

async function Status (context) {
  await story.status(context)
  await story.room.status(context)
  await player.status(context)
}


module.exports = async function App () {
  return router([
    text('test', SayTest),
    text(['l', 'look'], Look),
    text(['h', 'hint'], Hint),
    text(['?', 'help'], Help),
    text(['i', 'inv', 'inventory'], Inventory),
    text(/^(x|examine) (?<item>.*)$/i, Examine),

    // debug commands
    text(['start'], Start),   //
    text(['rs', 'reset'], Reset),
    text(['st', 'status'], Status),
    text(['rl', 'reload'], reload),

    // TODO - build list of actions on entering room
    text(/^(?<action>open|use|read|get|take|give|drop) (?<item>.*)$/i, Actions),
    text(['stuff'], Stuff),

    // testing
    text('menu', menu.show),
    text('image', menu.testImage),
    text('test2', menu.test2),
    slack.event('member_joined_channel', Welcome),
    // slack.event('interactive_message', Button),
    // slack.message(HandleSlack),
    slack.any(HandleSlack),
  ])
}

init() // startup
