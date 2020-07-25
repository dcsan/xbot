// import Dispatcher from './Dispatcher.js';
// import TestUtils from '../../lib/TestUtils';
// import RouterService from './RouterService'
// import Logger from '../../lib/Logger.js';

// const context = TestUtils.context
// const log = console.log

// beforeEach(() => {
//   context.reset()
// })

// const getGame = async () => {
//   const game = await RouterService.findGame(1234)
//   await game.init({ storyName: 'office' })
//   return game
// }


// //@ts-ignore
// test('echo', async () => {
//   await Dispatcher.echo(context)
//   expect(context.sent.text).toBe('game [1234] echo!')
// })

// test('roomActions smash window', async () => {
//   const game = await getGame()
//   expect(game.story.room.cname).toBe('office')
//   const result = await Dispatcher.roomActions(context, 'smash the window')
//   log('result', result)
//   expect(result.type).toBe('roomAction')
//   expect(result.type).toBe('roomAction')
// })

// // complex actions

// xtest('fallback with actor reply', async () => {
//   await getGame()
//   // const context = Object.assign({}, TestUtils.context)
//   expect(context.sent.text).toBeUndefined()
//   const reply = await Dispatcher.fallback(context, "ask sid how are you")
//   console.log('reply', reply)
//   console.log('called', context.sent.text)
//   expect(context.sent.text).toBe("Sid: I'm doing great thanks")
// })


// xtest('fallback firstActor reply', async () => {
//   const reply = await Dispatcher.fallback(context, "ask about the note")
//   // console.log('reply', reply)
//   // console.log('called', context.sent.text)
//   expect(context.sent.text).toMatch(/Sid: It's a weird looking memo written there/)
// })

// test('lookat object', async () => {
//   const reply = await Dispatcher.fallback(context, "x note")
//   Logger.logObj('x note reply', reply)
//   const atts = context.chat.msg.attachments
//   const blocks = atts[0].blocks
//   // console.log('att', atts)
//   // console.log('blocks', blocks)
//   expect(blocks).toHaveLength(2)
//   expect(blocks[1].text.text).toMatch(/^There seem to be a sequence of letters/)
// })

// test('goto command', async () => {
//   context.reset()
//   expect(game.story.room.name).toBe('office')
//   context.setInput('goto cupboard')
//   const reply = await Dispatcher.fallback(context)
//   // TODO - more detail for matcher?
//   expect(game.story.room.name).toBe('cupboard')
// })


// xtest('base router', async () => {
//   context.setInput('restart')
//   await Dispatcher.fallback(context)
//   expect(context.received).toMatch('restart')
// })


