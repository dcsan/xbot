const TestUtils = require('../../lib/TestUtils');
const Game = require('./Game')
// const RexParser = require('./parser/RexParser.js');
// const { basicInputParser } = require('./parser/RexParser.js');


const context = TestUtils.context
let game

beforeEach( async() => {
  context.reset()
  game = new Game(1234)
  await game.init({ storyName: 'office' })
  await game.story.room.reset()
})

test('item states', async () => {
  const room = game.story.currentRoom
  const chest = room.findItem('chest')
  expect(chest.cname).toBe('chest')
  expect(chest.state).toBe('locked')
})
