const Dispatcher = require('./Dispatcher.js');
const Game = require('./Game.js');
const TestUtils = require('../lib/TestUtils');
const Logger = require('../lib/Logger.js');

const context = TestUtils.context

beforeEach(() => {
  context.reset()
})

//@ts-ignore
test('echo', async () => {
  await Dispatcher.echo(context)
  expect(context.sent.text).toBe('game [1234] echo!')
})

test('fallback with actor reply', async () => {
  // const context = Object.assign({}, TestUtils.context)
  expect(context.sent.text).toBeUndefined()
  const event = {
    text: "ask Sid how are you"
  }
  context.event = event

  const reply = await Dispatcher.fallback(context)
  // console.log('reply', reply)
  // console.log('called', context.sent.text)
  expect(context.sent.text).toBe("Sid: I'm doing great thanks")
})


test('fallback firstActor reply', async () => {
  // const context = Object.assign({}, TestUtils.context)
  expect(context.sent.text).toBeUndefined()
  const event = {
    text: "ask about the note"
  }
  context.event = event

  const reply = await Dispatcher.fallback(context)
  // console.log('reply', reply)
  // console.log('called', context.sent.text)
  expect(context.sent.text).toMatch(/Sid: It's a weird looking memo written there/)
})

test('examine object', async () => {
  context.event = { text: "x note" }

  const reply = await Dispatcher.fallback(context)
  const atts = context.chat.msg.attachments
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^There seem to be a sequence of letters/)
})

test('go to asylum and look', async () => {
  const game = await Dispatcher.findGame(1234)
  await game.init({storyName: 'asylum'})
  await game.story.goto('intro')
  expect(game.story.room.name).toBe('intro')
  context.setInput('sleep')
  const reply = await Dispatcher.fallback(context)
  expect(context.received.text).toMatch(/You get a good night/)
  expect(game.story.room.name).toBe('lobby')
})

