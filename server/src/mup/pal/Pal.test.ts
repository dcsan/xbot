import { Pal } from './Pal'
import { TestEnv } from '../../lib/TestUtils'

it('should export all text', () => {
  const env = new TestEnv()
  env.pal.sendText('this is line one')
  env.pal.sendText('and a second line')
  expect(env.pal.allText).toBe('this is line one\nand a second line')
  expect(env.pal.allText).toMatch(/a second line/)  // excerpt
})

