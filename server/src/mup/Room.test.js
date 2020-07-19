const Game = require('./Game.js');
const WordUtils = require('../lib/WordUtils')
const TestUtils = require('../lib/TestUtils');
const RexParser = require('./parser/RexParser.js');
const { basicInputParser } = require('./parser/RexParser.js');

const log = console.log

const context = TestUtils.context
const game = new Game(1234)

beforeEach( async() => {
  context.reset()
  await game.init(false)
  await game.story.room.reset()
})

test('item names', async () => {
  const names = game.story.room.itemFormalNamesOneLine()
  expect(names).toEqual("a `Desk`, a `Note`, a `Chest`, a `Lock`, a `Key`, a `Door`")
  // expect(names).toEqual(["a Desk", "a Note", "a Chest", "a Lock", "a Key", "a Door"])
})



test('look room', async () => {
  const blocks = await game.story.room.look(context)
  // console.log(blocks)
  expect(blocks).toHaveLength(4)
  expect(blocks[0].type).toBe('image')
  expect(blocks[3].type).toBe('section')  // items
  expect(blocks[3].text.text).toMatch(/You see a `Desk`, a `Note`/)
})



//@ts-ignore
test('Game setup', async () => {
  const actor = await game.story.room.findActor('sid')
  expect(actor.cname).toBe('sid')
  expect(game.story.room.doc.name).toBe('office')
})



//@ts-ignore
test('room examine actor', async () => {
  expect(context.sent.msg).toBe(undefined)
  const actor = await game.story.room.findActor('sid')
  const parsed = {
    event: 'examine',
    target: 'firstItem',
    groups: {
      item: 'note'
    }
  }
  const res = await actor.examine(parsed, context, game.player)
  const atts = context.chat.msg.attachments
  const blocks = context.flatBlocks()
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^Sid hasn't been/)
})


//@ts-ignore
test('examine item', async () => {
  const item = game.story.room.findItem('chest')
  const parsed = {
    event: 'examine',
    target: 'firstItem',
    groups: {
      item: 'note'
    }
  }
  const found = await item.examine(parsed, context, game.player)
  const atts = context.chat.msg.attachments
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^The chest is locked/)
})


test('room item actions', async () => {
  const input = "read the note"
  context.setInput(input)
  const result = await game.story.room.tryActions(context)
  // log({sent: context.sent, chat: context.chat.msg})

  expect(context.received.text).toMatch(/You read the note/)

  const blocks = context.flatBlocks()
  expect(blocks).toHaveLength(2)

  expect(blocks[0].type).toBe('image')
  expect(blocks[0].title.text).toBe('Note')

  // expect(blocks[1].text.text).toMatch(/^The note has .*/)
  expect(blocks[1].text.text).toMatch('The note just has')

  expect(result).toEqual(true)
})



