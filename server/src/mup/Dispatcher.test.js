const Dispatcher = require('./Dispatcher.js');

const TestUtils = require('../lib/TestUtils')
const context = TestUtils.context

//@ts-ignore
test('Dispatcher', async () => {
  await Dispatcher.echo(context)
  // console.log('called', context.text)
  expect(context.text).toBe('game [1234] echo!')
})
