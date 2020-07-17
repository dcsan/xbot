const Game = require('./Game.js');
// const test = require('ava');
// const sinon = require('sinon')

const TestUtils = require('../lib/TestUtils')
const context = TestUtils.context

beforeEach(() => {
  context.reset()
})

//@ts-ignore
test('Game setup', async () => {
  const game = new Game(1234)
  await game.init(false)
  const actor = await game.story.room.findActor('sid')
  expect(actor.cname).toBe('sid')
  expect(game.story.room.doc.name).toBe('office')
})



//@ts-ignore
test('examine actor', async () => {
  const game = new Game(1234)
  expect(context.sent.msg).toBe(undefined)
  await game.init(false)
  const actor = await game.story.room.findActor('sid')
  const res = await actor.examine(context)
  const atts = context.chat.msg.attachments
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^Sid hasn't been/)
})


//@ts-ignore
test('examine chest', async () => {
  const game = new Game(1234)
  expect(context.sent.msg).toBe(undefined)
  await game.init(false)
  const item = await game.story.room.findItem('chest')
  const res = await item.examine(context)
  const atts = context.chat.msg.attachments
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^The chest is locked/)
})
