import { TestEnv } from '../../lib/TestUtils'

test('item states', async () => {
  const { game } = new TestEnv()
  await game.story.gotoRoom('office')
  const room = game.story.currentRoom
  const chest = room.findItem('chest')
  expect(chest?.cname).toBe('chest')
  expect(chest?.state).toBe('locked')
})


test('get item', async () => {
  const { game } = new TestEnv()
  await game.story.gotoRoom('office')
  const room = game.story.currentRoom

  const chest = room.findItem('chest')
  expect(chest?.cname).toBe('chest')
  expect(chest?.state).toBe('locked')
  // thru the other accessor
  expect(chest?.getProp('state')).toBe('locked')
})

