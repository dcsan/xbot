import Game from './Game.js';

it('should pass', () => {

})

// const test = require('ava');
// const sinon = require('sinon')

// import TestUtils from '../../lib/TestUtils'
// const context = TestUtils.context

// const game = new Game(1234)

// beforeEach(async () => {
//   await game.init({ storyName: 'office' })
//   context.reset()
// })

// // @ts-ignore
// test('mock api', () => {
//   context.sendText('test msg')
//   expect(context.sent.text).toBe('test msg')
// })


// //@ts-ignore
// test('game loading', () => {

//   expect(game.story.room.actors.length).toBe(1)
//   const actor = game.story.room.actors[0]
//   expect(actor.doc.name).toBe('Sid')
//   expect(actor.doc.actions.length).toBe(12)

//   actor.tryAction({ actionName: 'hi' }, context)
//   expect(context.sent.text).toBe('Sid: Hi back!')

// })

// xtest('default replies', async () => {
//   const actor = game.story.room.findActor('Sid')
//   const defs = actor.doc.defaultReplies
//   expect(defs.length).toBe(3)

//   const parsed = {
//     groups: {
//       message: 'does not exist'
//     }
  // }
  // // check it steps through in sequence
  // await actor.replyWithDefault(parsed, context)
  // let expected = `${ actor.doc.name }: ` + defs[1]
  // expect(context.sent.text).toBe(expected)

  // await actor.replyWithDefault(parsed, context)
  // expected = `${ actor.doc.name }: ` + defs[2]
  // expect(context.sent.text).toBe(expected)

  // await actor.replyWithDefault(parsed, context)
  // expected = `${ actor.doc.name }: ` + defs[0]
  // expect(context.sent.text).toBe(expected)

  // await actor.replyWithDefault(parsed, context)
  // expected = `${ actor.doc.name }: ` + defs[1]
  // expect(context.sent.text).toBe(expected)

// })

// test('greeting', async () => {
//   const actor = game.story.room.findActor('Sid')
//   await actor.tryAction({ actionName: 'hi', }, context)
//   expect(context.sent.text).toBe("Sid: Hi back!")
// })

// test('ask password', async () => {
//   const actor = game.story.room.findActor('Sid')
//   await actor.tryAction({ actionName: 'password' }, context)
//   expect(context.sent.text).toBe("Sid: I'm not telling you!")
// })


// test('ask Sid about the note', async () => {
//   const actor = game.story.room.findActor('Sid')
//   await actor.tryAction({ actionName: 'about the note' }, context)
//   // console.log(reply)
//   expect(context.sent.text).toMatch(/It's a weird looking memo written/)
// })



