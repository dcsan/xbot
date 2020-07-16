const Dispatcher = require('./Dispatcher.js');

const TestUtils = require('../lib/TestUtils');
const Logger = require('../lib/Logger.js');

//@ts-ignore
test('echo', async () => {
  const context = Object.assign({}, TestUtils.context)
  await Dispatcher.echo(context)
  // console.log('called', context.sent.text)
  expect(context.sent.text).toBe('game [1234] echo!')
})

test('fallback with actor reply', async () => {
  // const context = Object.assign({}, TestUtils.context)
  const context = { ...TestUtils.context }
  context.reset()
  expect(context.sent.text).toBeUndefined()
  const event = {
    text: "ask Sid how are you"
  }
  const input = { ...context, event }

  const reply = await Dispatcher.fallback(input)
  Logger.testLog('reply', reply)
  // console.log('called', context.sent.text)
  expect(context.sent.text).toBe("Sid: I'm doing great thanks")
})



// test('Dispatcher fallback', async () => {
//   // const context = Object.assign({}, TestUtils.context)
//   const context = { ...TestUtils.context }
//   context.reset()
//   expect(context.sent.text).toBeUndefined()
//   const event = {
//     text: "ask Sid about the note"
//   }
//   const input = { ...context, event }

//   const reply = await Dispatcher.fallback(input)
//   Logger.testLog('reply', reply)
//   // console.log('called', context.sent.text)
//   expect(context.sent.text).toBe('fallback')
// })
