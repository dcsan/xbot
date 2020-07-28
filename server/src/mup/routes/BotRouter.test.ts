import { TestEnv } from '../../lib/TestUtils';
import BotRouter from './BotRouter';
import { RouterService } from './RouterService';
import { HandleCodes } from '../models/ErrorHandler';
import Logger from '../../lib/Logger';

const log = console.log

beforeAll(async () => {
  process.stdout.write('start > BotRouterTest\n')
})

afterAll(async () => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done > BotRouterTest\n')
})

it('should handle verb target to get thing', async () => {
  const env = new TestEnv()
  env.game.story.gotoRoom('cell')
  const evt = env.makeSceneEvent('get soap')
  expect(evt.pres.pos?.target).toBe('soap')
  const res = await BotRouter.tryCommands(evt)
  expect(res.err).not.toBe(true)
  expect(res.handled).toBe(HandleCodes.foundCommand)
  expect(evt.pal.blob).toMatch(/You get the soap/i)
})

it('handle canTake: false items', async () => {

  const env = new TestEnv()
  env.game.story.gotoRoom('cell')

  const evt = env.makeSceneEvent('get table')
  expect(evt.pres.pos?.target).toBe('table')
  const res = await BotRouter.tryCommands(evt)
  expect(res.err).not.toBe(true)
  expect(res.handled).toBe(HandleCodes.foundCommand)
  expect(evt.pal.blob).toMatch(/You can't take the table/i)

})

it('should have fallback if thing cannot be found', async () => {
  const env = new TestEnv()
  env.game.story.gotoRoom('cell')
  const evt = env.makeSceneEvent('get XYZ')
  expect(evt.pres.pos?.target).toBe('xyz')
  expect(evt.pres.rule?.event).toBe(RouterService.takeRoomThing)
  const done = await BotRouter.tryCommands(evt)
  // expect(done).toBe(true)
  expect(evt.pal.allText).toMatch(/You can't see/i)
})

it('should allow to examine something', async () => {
  const env = new TestEnv()
  env.pal.input('x soap')
  await BotRouter.textEvent(env.pal)
  // console.log('store', JSON.stringify(env.pal.channel.store))
  expect(env.pal.blob).toMatch(/time for a good scrub/)
  // expect(env.pal.allText).toMatch(/time for a good scrubbing/)
})


it('should allow top level room command with actions', async () => {
  const env = new TestEnv()
  env.game.story.gotoRoom('cell')
  const door = env.game.story.room.findThing('door')
  expect(door?.state).toBe('locked')  // initial
  env.pal.input('sesame')
  const res = await BotRouter.textEvent(env.pal)
  expect(res.handled).toBe(HandleCodes.okReplied)
  expect(res.err).not.toBe(true)
  expect(env.pal.getReceivedText(0)).toMatch(/You shout/i)
  Logger.assertTrue(!res.err, 'res', res)
  expect(res.err).not.toBe(true)
  expect(res.handled).toBe(HandleCodes.okReplied)

  expect(door?.state).toBe('open')
})
