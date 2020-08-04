import { TestEnv } from '../../lib/TestUtils'
import Game from './Game'
import { LoadOptions } from '../MupTypes'

test('office game loading', async () => {
  const { pal, game } = new TestEnv('office')
  expect(game.story.doc.title).toBe('The Office')
  expect(game.story.doc.cname).toBe('office')
  expect(game.story.rooms.length).toBe(4)

  game.story.gotoRoom('office')
  expect(game.story.room.name).toBe('office')
  // expect(game.story.room.actors.length).toBe(1)
})

test('asylum game loading', async () => {
  const { pal, game } = new TestEnv('asylum')
  game.story.load({ storyName: 'asylum', pal })
  expect(game.story.doc.title).toBe('Escape From Bell Hill (Asylum #6)')
  expect(game.story.doc.cname).toBe('asylum')
  expect(game.story.rooms.length).toBe(6)

  game.story.gotoRoom('cell')
  expect(game.story.room.name).toBe('cell')
  // expect(game.story.room.actors.length).toBe(1)
})

