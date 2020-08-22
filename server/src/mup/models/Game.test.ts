import { TestEnv } from '../../lib/TestUtils'
import Game from './Game'
import { LoadOptions } from '../MupTypes'

test('office game loading', async () => {
  // const { pal, game } = new TestEnv('office')
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')

  expect(game.story.doc.title).toBe('The Office')
  expect(game.story.room.name).toBe('lobby')
  expect(game.story.rooms.length).toBe(3)

  game.story.gotoRoom('office')
  expect(game.story.room.name).toBe('office')
  // expect(game.story.room.actors.length).toBe(1)
})

test('asylum game loading', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('asylum')
  game.story.load({ storyName: 'asylum', pal: testEnv.pal })
  expect(game.story.doc.title).toMatch(/Escape From Bell Hill/i)
  expect(game.story.doc.cname).toBe('asylum')
  expect(game.story.rooms.length).toBe(8)

  game.story.gotoRoom('cell')
  expect(game.story.room.name).toBe('cell')
  // expect(game.story.room.actors.length).toBe(1)
})

