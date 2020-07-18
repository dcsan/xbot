const Game = require('./Game.js');
const WordUtils = require('../lib/WordUtils')
const TestUtils = require('../lib/TestUtils');
const RexParser = require('./parser/RexParser.js');
const context = TestUtils.context

const game = new Game(1234)

// beforeEach( async () => {
//   context.reset()
//   await game.init(false)
// })

test('replace object names', async () => {

  const item = game.story.room.findItem('chest')
  item.reset()
  expect(item.state).toBe('locked')
})



