const Game = require('./Game.js');
// const test = require('ava');
// const sinon = require('sinon')

const TestUtils = require('../lib/TestUtils')
const context = TestUtils.context

const game = new Game(1234)
const actor = game.story.room.findActor('Sid')

beforeEach(() => {
  context.reset()
})

// @ts-ignore
test('mock api', () => {
  context.sendText('test msg')
  expect(context.sent.text).toBe('test msg')
})


//@ts-ignore
test('game loading', () => {

  game.init(false)
  expect(game.story.room.actors.length).toBe(1)
  const actor = game.story.room.actors[0]
  expect(actor.doc.name).toBe('Sid')
  expect(actor.doc.triggers.length).toBe(10)

  actor.replyTo('hi', context)
  expect(context.sent.text).toBe('Sid: Hi back!')

})

test('default replies', () => {

  const defs = actor.doc.defaultReplies
  expect(defs.length).toBe(3)

  const parsed = {
    groups: {
      message: 'does not exist'
    }
  }
  // check it steps through in sequence
  actor.replyWithDefault(parsed, context)
  let expected = `${actor.doc.name}: ` + defs[1]
  expect(context.sent.text).toBe(expected)

  actor.replyWithDefault(parsed, context)
  expected = `${actor.doc.name}: ` + defs[2]
  expect(context.sent.text).toBe(expected)

  actor.replyWithDefault(parsed, context)
  expected = `${actor.doc.name}: ` + defs[0]
  expect(context.sent.text).toBe(expected)

  actor.replyWithDefault(parsed, context)
  expected = `${actor.doc.name}: ` + defs[1]
  expect(context.sent.text).toBe(expected)

})

test('greeting', () => {
  actor.replyTo('hi', context)
  expect(context.sent.text).toBe("Sid: Hi back!")
})

test('ask password', () => {
  actor.replyTo('password', context)
  expect(context.sent.text).toBe("Sid: I'm not telling you!")
})


test('ask Sid about the note', () => {
  const reply = actor.replyTo("about the note", context)
  // console.log(reply)
  expect(context.sent.text).toBe("Sid: Hmm it looks like a combination or a PIN code")
})



