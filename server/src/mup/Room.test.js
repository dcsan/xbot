const Game = require('./Game.js');
// const test = require('ava');
// const sinon = require('sinon')

const TestUtils = require('../lib/TestUtils')
const context = TestUtils.context

//@ts-ignore
test('Game', async () => {
  const game = new Game(1234)
  game.init(false)
  const actor = await game.story.room.findActor('Sid')
  expect(actor.name).toBe('Sid')

  actor.replyTo('password', context)
  expect(context.sent.text).toBe("Sid: I'm not telling you!" )

})
