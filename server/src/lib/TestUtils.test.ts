import TestUtils from '../lib/TestUtils'

const context = TestUtils.context

beforeEach(() => {
  context.reset()
})

test('capture sent text', async () => {
  expect(context.sent.text).toBe(undefined)
  context.sendText('test posting')
  expect(context.sent.text).toBe('test posting')
})

test('capture sent postMessage', async () => {
  expect(context.chat.msg).toBe(undefined)
  context.chat.postMessage('test posting')
  expect(context.chat.msg).toBe('test posting')
})

test('set event on context', async () => {
  expect(context.received.text).toBe(undefined)
  // context.setInput('testing input')
  context.sendText('output message')
  expect(context.received.text).toBe('output message')
})
