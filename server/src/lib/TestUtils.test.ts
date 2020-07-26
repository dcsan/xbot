import { createTestEnv } from './TestUtils'

it('should create a test env', async () => {
  const { game, pal } = await createTestEnv()
  expect(game.story.storyName).toBe('office')

})