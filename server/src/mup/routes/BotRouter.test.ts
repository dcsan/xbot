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
  expect(evt.pal.blob).toMatch(/You get the soap/i)
})

it('handle canTake: false items', async () => {

  const env = new TestEnv()
  env.game.story.gotoRoom('cell')

  const evt = env.makeSceneEvent('get table')
  expect(evt.result.pos?.target).toBe('table')
  const done = await BotRouter.tryCommands(evt)
  expect(done).toBe(true)
  expect(evt.pal.blob).toMatch(/You can't take the table/i)

})


it('should have fallback if thing cannot be found', async () => {
  const env = new TestEnv()
  env.game.story.gotoRoom('cell')
  const evt = env.makeSceneEvent('get XYZ')
  expect(evt.result.pos?.target).toBe('xyz')
  expect(evt.result.rule?.event).toBe(RouterService.takeRoomThing)
  const done = await BotRouter.tryCommands(evt)
  // expect(done).toBe(true)
  expect(evt.pal.allText).toMatch(/You can't see/i)
})

it('should allow to examine something', async () => {
  const env = new TestEnv()
  env.pal.input('x soap')
  await BotRouter.textEvent(env.pal)
  console.log('store', JSON.stringify(env.pal.channel.store))
  expect(env.pal.blob).toMatch(/time for a good scrub/)
  // expect(env.pal.allText).toMatch(/time for a good scrubbing/)
})


it('should allow top level room command with actions', async () => {
  const env = new TestEnv()
  const door = env.game.story.room.findThing('door')
  expect(door?.state).toBe('locked')  // initial
  env.pal.input('sesame')
  await BotRouter.textEvent(env.pal)
  expect(env.pal.getReceivedText(0)).toMatch(/You shout/i)
  expect(door?.state).toBe('open')
})
