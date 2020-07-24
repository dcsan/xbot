import Game from './Game.js';
import WordUtils from '../../lib/WordUtils'
import TestUtils from '../../lib/TestUtils';
import RexParser from '../services/RexParser.js';
const context = TestUtils.context

const game = new Game(1234)

beforeEach( async () => {
  context.reset()
  await game.init({ storyName: 'office' })
})

test('replace object names', async () => {

  const item = await game.story.room.findItem('chest')
  expect(item.cname).toBe('chest')
  item.reset()
  expect(item.state).toBe('locked')
})



