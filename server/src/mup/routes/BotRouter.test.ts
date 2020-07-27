import { RexParser, ParserResult } from './RexParser';
import BotRouter from './BotRouter';
import { RouterService } from './RouterService'
import { TestEnv } from '../../lib/TestUtils'
import Logger from '../../lib/Logger';

const log = console.log

it('should handle verb target to get thing', async () => {

  const env = new TestEnv()
  env.game.story.gotoRoom('cell')

  const evt = env.makeSceneEvent('get soap')
  expect(evt.result.pos?.target).toBe('soap')
  const done = await BotRouter.tryCommands(evt)
  expect(done).toBe(true)
  expect(evt.pal.getReceivedText(0)).toBe('you get the Soap')

})

it('should have fallback if thing cannot be found', async () => {
  const env = new TestEnv()
  env.game.story.gotoRoom('cell')
  const evt = env.makeSceneEvent('get XYZ')
  expect(evt.result.pos?.target).toBe('xyz')
  expect(evt.result.rule?.event).toBe(RouterService.takeRoomThing)
  // expect(done).toBe(true)
  expect(evt.pal.getReceivedText(0)).toBe('you get the Soap')
})

it('should allow to examine something', async () => {
  const env = new TestEnv()
  env.pal.input('x soap')
  await BotRouter.textEvent(env.pal)
  expect(env.pal.getReceivedText(0)).toMatch(/time for a good scrubbing/)
})


it('should allow top level room command with actions', async () => {
  const env = new TestEnv()
  env.pal.input('sesame')
  const door = env.game.story.room.findThing('door')
  await BotRouter.textEvent(env.pal)
  expect(door?.state).toBe('locked')
  expect(env.pal.getReceivedText(0)).toMatch(/You shout/i)
  expect(door?.state).toBe('open')
})
