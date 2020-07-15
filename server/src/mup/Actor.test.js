const Game = require('./Game.js');
// const test = require('ava');
// const sinon = require('sinon')

const TestUtils = require('../lib/TestUtils')
const context = TestUtils.context

const game = new Game(1234)
const actor = game.story.room.findActor('Sid')

// @ts-ignore
test('mock api', () => {
  context.sendText('test msg')
  expect(context.text).toBe('test msg')
})


//@ts-ignore
test('game loading', () => {

  game.reset(false)
  expect(game.story.room.actors.length).toBe(1)
  const actor = game.story.room.actors[0]
  expect(actor.doc.name).toBe('Sid')
  expect(actor.doc.triggers.length).toBe(4)

  actor.ask('hi', context)
  expect(context.text).toBe('Sid: Hi back!')

})

test('default replies', () => {

  const defs = actor.doc.defaultReplies
  expect(defs.length).toBe(3)

  // check it steps through in sequence
  actor.ask('random', context)
  let expected = `${actor.doc.name}: ` + defs[1]
  expect(context.text).toBe(expected)

  actor.ask('random', context)
  expected = `${actor.doc.name}: ` + defs[2]
  expect(context.text).toBe(expected)

  actor.ask('random', context)
  expected = `${actor.doc.name}: ` + defs[0]
  expect(context.text).toBe(expected)

  actor.ask('random', context)
  expected = `${actor.doc.name}: ` + defs[1]
  expect(context.text).toBe(expected)

})

test('greeting', () => {
  actor.ask('hi', context)
  expect(context.text).toBe("Sid: Hi back!")
})

test('ask password', () => {
  actor.ask('password', context)
  expect(context.text).toBe("Sid: I'm not telling you!")
})



