const Dispatcher = require('./Dispatcher.js');
const TestUtils = require('../../lib/TestUtils');
const RouterService = require('./RouterService')
const Logger = require('../../lib/Logger.js');

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
  Logger.logObj('x note reply', reply)
  const atts = context.chat.msg.attachments
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^There seem to be a sequence of letters/)
})

test('goto command', async () => {
  context.reset()
  const game = await RouterService.findGame(1234)
  await game.init({ storyName: 'office' })
  expect(game.story.room.name).toBe('office')
  context.setInput('goto cupboard')
  const reply = await Dispatcher.fallback(context)
  // TODO - more detail for matcher?
  expect(game.story.room.name).toBe('cupboard')
})


xtest('base router', async () => {
  context.setInput('restart')
  await Dispatcher.fallback(context)
  expect(context.received).toMatch('restart')
})


