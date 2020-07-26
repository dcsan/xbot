import { TestEnv } from '../../lib/TestUtils'
import Game from './Game'
import { LoadOptions } from '../MupTypes'

test('game loading', async () => {
  const { pal } = new TestEnv()
  const opts: LoadOptions = {
    storyName: 'office',
    pal
  }
  const game = new Game(opts)
  await game.reset()
  game.story.gotoRoom('office')
  expect(game.story.doc.name).toBe('The Office')
  expect(game.story.room.name).toBe('office')
  expect(game.story.room.actors.length).toBe(1)
})

