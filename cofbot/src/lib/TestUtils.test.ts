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
  expect(context.event).toBe(undefined)
  context.event = { text: 'input message' }
  expect(context.event.text).toBe('input message')
})
