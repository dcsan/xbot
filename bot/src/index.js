const { router, text, slack } = require('bottender/router')
const { Story } = require('./mup/Story')
const { Player } = require('./mup/Player')
const Room = require('./mup/Room')
const Menu = require('./mup/Menu')
const debug = require('debug')('mup:index')

let story
let player // TODO - sessions
let menu

const config = {
  storyName: 'chest',
}

function flatten (textList) {
  textList = textList.filter(n => n) // remove nulls / empties
  return textList.join('\n')
}

function init () {
  story = new Story()
  player = new Player()
  menu = new Menu()
  story.reload(config.storyName)
}

async function SayHi (context) {
  await context.sendText('Hi!')
}

async function SayHello (context) {
  await context.sendText('Hello!')
}

async function reload (context) {
  await context.sendText('reloading...')
  story.reload(config.storyName)
  await context.sendText('loaded!')
}

async function Look (context) {
  const msg = story.look()
  await context.sendText(msg)
}

async function Stuff (context) {
  const msg = story.stuff()
  await context.sendText(msg)
}

async function Reset (context) {
  player.reset()
  story.reset()
  await context.sendText("reset done!")
}

async function Inventory (context) {
  const invItems = player.inventory()
  await context.sendText('You are holding:')
  await context.sendText(flatten(invItems))
}

async function Hint (context) {
  context.postEphemeral({ text: 'Hint!' });
}

async function Inspect (
  context,
  {
    match: {
      groups: { item },
    },
  }
) {
  debug('inspect: ', item)
  await context.sendText(`you inspect the ${item}`)
  const msg = story.inspect(item)
  debug('msg', JSON.stringify(msg, null, 2))
  await context.postMessage(msg)

  // TODO - also check inventory items
  // await context.sendText(msg)
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
  const results = story.room.runActions(action, item, player)
  await context.sendText(flatten(results))
}

async function HandleSlack (context) {
  // debug('slack.any', context)
  debug('rawEvent', context.event.rawEvent)
  debug('event.type', context.event.type)
  debug('event.subtype', context.event.subtype)
  debug('event.action', context.event.action)
  if (context.event.action) {
    context.sendText(`event.action: ${context.event.action.value}`)
  } else {
    context.sendText(`other event ${context.event.type}`)
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


module.exports = async function App () {
  return router([
    text('hi', SayHi),
    text('hello', SayHello),
    text(['reload', 'rl'], reload),
    text(['look', 'l'], Look),
    text(['reset'], Reset),
    text(['hint'], Hint),

    // TODO - build list of actions on entering room
    text(/^(?<action>open|use|read|get|take|give|drop) (?<item>.*)$/i, Actions),
    text(['stuff'], Stuff),
    text(/^(i|inspect) (?<item>.*)$/i, Inspect),
    text(/^inv|status|st$/i, Inventory),
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
