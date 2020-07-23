const Dispatcher = require('../services/Dispatcher')
const RouterService = require('../services/RouterService')
const TestUtils = require('../../lib/TestUtils')

const context = TestUtils.context

beforeEach( async() => {
  context.reset()
})

const sendMessage = async (input) => {
  context.setInput(input)
  await Dispatcher.fallback(context)
  return context
}

xtest('start', async () => {
  const game = await RouterService.findGame(1234)
  await sendMessage('start')
  expect(context.received).toBe('goto room')
})
