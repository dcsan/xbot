const Dispatcher = require('./Dispatcher.js');

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
  expect(context.sent.text).toBe("Sid: Hmm it looks like a combination or a PIN code")
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
