const Game = require('./Game.js');
const WordUtils = require('../lib/WordUtils')
const TestUtils = require('../lib/TestUtils');
const RexParser = require('./parser/RexParser.js');
const context = TestUtils.context

const game = new Game(1234)

beforeEach( async () => {
  context.reset()
  await game.init(false)
})

test('replace object names', async () => {
  const parsed = game.story.room.findActionItem('unlock the chest')
  expect(parsed).toBe('chest')

  const item = game.story.room.findItem(parsed.item)
  item.runActions

})



