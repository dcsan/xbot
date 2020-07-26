
import { createTestEnv } from '../../lib/TestUtils'

// const RexParser = require('./parser/RexParser.js');
// const { basicInputParser } = require('./parser/RexParser.js');


test('item states', async () => {
  const { game } = await createTestEnv()
  const room = game.story.currentRoom
  const chest = room.findItem('chest')
  expect(chest?.cname).toBe('chest')
  expect(chest?.state).toBe('locked')
})
