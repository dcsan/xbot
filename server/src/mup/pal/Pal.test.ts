import { Pal } from './Pal'
import { TestEnv } from '../../lib/TestUtils'

it('should export all text', () => {
  const env = new TestEnv()
  env.pal.sendText('this is line one')
  env.pal.sendText('and a second line')
  // console.log('logs', env.pal.logger.lines)

  // expect(env.pal.getLogLineText(0)).toMatch(/reset game/i)
  // FIXME - new games reset twice
  // expect(env.pal.getLogLineText(1)).toMatch(/reset game/i)
  expect(env.pal.getLogLineText(0)).toBe('this is line one')
  expect(env.pal.getLogLineText(1)).toBe('and a second line')

})

