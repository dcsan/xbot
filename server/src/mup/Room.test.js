const Game = require('./Game.js');
const WordUtils = require('../lib/WordUtils')
const TestUtils = require('../lib/TestUtils');
const RexParser = require('./parser/RexParser.js');
const context = TestUtils.context

beforeEach(() => {
  context.reset()
})

test('item names', async () => {
  const game = new Game(1234)
  await game.init(false)
  const names = game.story.room.itemFormalNamesOneLine()
  expect(names).toEqual('a Desk, a Note, a Chest, a Lock, a Key, a Door')
  // expect(names).toEqual(["a Desk", "a Note", "a Chest", "a Lock", "a Key", "a Door"])
})



test('look room', async () => {
  const game = new Game(1234)
  await game.init(false)
  const blocks = await game.story.room.look(context)
  // console.log(blocks)
  expect(blocks).toHaveLength(4)
  expect(blocks[0].type).toBe('image')
  expect(blocks[3].type).toBe('section')  // items
  expect(blocks[3].text.text).toMatch(/^You see a Desk, a Note/)  // items
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
test('room examine actor', async () => {
  const game = new Game(1234)
  expect(context.sent.msg).toBe(undefined)
  await game.init(false)
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
  const blocks = atts[0].blocks
  // console.log('att', atts)
  // console.log('blocks', blocks)
  expect(blocks).toHaveLength(2)
  expect(blocks[1].text.text).toMatch(/^Sid hasn't been/)
})


//@ts-ignore
test('examine item', async () => {
  const game = new Game(1234)
  await game.init(false)
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


// test('room items regex maker', async () => {
//   const game = new Game(1234)
//   await game.init(false)
//   const { rex, rexStr } = game.story.room.makeRoomItemsRex()
//   expect(rexStr).toEqual( '(?<item>\bdesk|note|chest|lock|key|door\b)' )
// })


test('replace object names', async () => {
  const game = new Game(1234)
  await game.init(false)
  // remove item name

  const tests = [
    ['unlock the chest', 'unlock', 'chest'],
    ['foobar the snoozle', undefined, undefined],
    // ['read note', 'read', 'note'],
    // ['open the chest with the key', 'open with key', 'chest'],
    // ['open the chest', 'open', 'chest'],
    // ['foobar the door', 'foobar', 'door'],    // not exist verb
  ]

  tests.forEach( test => {
    let [input, expectAction, expectItem] = test
    input = WordUtils.cheapNormalize(input)
    const found = game.story.room.findActionItem(input)
    console.log('ret found', input, found)
    expect(item).toBe(expectItem)
    expect(action).toBe(expectAction)
  })

})

