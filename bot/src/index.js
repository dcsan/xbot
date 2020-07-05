const { router, text } = require('bottender/router')
const { Story } = require('./mup/Story')
const { Player } = require('./mup/Player')
const debug = require('debug')('mup:index')

let story
let player // TODO - sessions

const config = {
  storyName: 'chest',
}

function flatten (textList) {
  textList = textList.filter( n => n) // remove nulls / empties
  return textList.join('\n')
}

function init() {
  story = new Story()
  player = new Player()
  story.reload(config.storyName)
}

async function SayHi(context) {
  await context.sendText('Hi!')
}

async function SayHello(context) {
  await context.sendText('Hello!')
}

async function reload(context) {
  await context.sendText('reloading...')
  story.reload(config.storyName)
  await context.sendText('loaded!')
}

async function look(context) {
  const msg = story.look()
  await context.sendText(msg)
}

async function Stuff(context) {
  const msg = story.stuff()
  await context.sendText(msg)
}

async function Inventory(context) {
  const invItems = player.inventory()
  await context.sendText('You are holding:')
  await context.sendText(flatten(invItems))
}

async function Inspect(
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
  await context.sendText(msg)
}

async function Actions(
  context,
  {
    match: {
      groups: { action, item },
    },
  }
) {
  debug('inspect: ', item)
  // await context.sendText(`trying ${action} on ${item} ...`)
  const results = story.room.runActions(action, item, player)
  await context.sendText(flatten(results))
}

module.exports = async function App() {
  return router([
    text('hi', SayHi),
    text('hello', SayHello),
    text(['reload', 'rl'], reload),
    text(['look', 'l'], look),

    // TODO - build list of actions on entering room
    text(/^(?<action>open|use|read|get|take|give|drop) (?<item>.*)$/i, Actions),
    text(['stuff'], Stuff),
    text(/^(i|inspect) (?<item>.*)$/i, Inspect),
    text(/^inv|status|st$/i, Inventory),
  ])
}

init() // startup
