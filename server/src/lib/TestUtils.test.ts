import { TestEnv } from './TestUtils'

it('should create a test env', async () => {
  const { game, pal } = new TestEnv()
  expect(game.story.storyName).toBe('office')

})