const Game = require('./Game.js');
const test = require('ava');
const sinon = require('sinon')

const fakeContext = {
  text: false,

  sendText (text) {
    this.text = text
  }
}

// @ts-ignore
test('mock api', t => {
  fakeContext.sendText('test msg')
  t.is(fakeContext.text, 'test msg')
})


//@ts-ignore
test('game loading', t => {

  const game = new Game(1234)
  game.reset(false)
  t.is(game.story.room.actors.length, 1)
  const actor = game.story.room.actors[0]
  t.is(actor.doc.name, 'Sid')
  t.is(actor.doc.triggers.length, 3)

  actor.ask('hi', fakeContext)
  t.is(fakeContext.text, 'Sid: Hi back!')

  const defs = actor.doc.defaultReplies
  t.is(defs.length, 3)

  // check it steps through in sequence
  actor.ask('random', fakeContext)
  let expected = `${actor.doc.name}: ` + defs[1]
  t.is(fakeContext.text, expected)

  actor.ask('random', fakeContext)
  expected = `${actor.doc.name}: ` + defs[2]
  t.is(fakeContext.text, expected)

  actor.ask('random', fakeContext)
  expected = `${actor.doc.name}: ` + defs[0]
  t.is(fakeContext.text, expected)

  actor.ask('random', fakeContext)
  expected = `${actor.doc.name}: ` + defs[1]
  t.is(fakeContext.text, expected)

})
