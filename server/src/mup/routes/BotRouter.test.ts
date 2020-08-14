import { TestEnv } from '../../lib/TestUtils';
import BotRouter from './BotRouter';
import { RouterService } from './RouterService';
import { HandleCodes } from '../models/ErrorHandler';
import { Logger } from '../../lib/Logger';

import { ActionResult } from '../MupTypes'

const log = console.log

beforeAll(async () => {
  // process.stdout.write('start > BotRouterTest\n')
})

afterAll(async () => {
  // Logger.log('done')
  // log('done')
  // process.stdout.write('done > BotRouterTest\n')
})

it('should handle verb target to get thing', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')

  testEnv.game?.story.gotoRoom('cell')
  const evt = testEnv.makeSceneEvent('get soap')
  expect(evt.pres.pos?.target).toBe('soap')
  const res = await BotRouter.tryCommands(evt)
  expect(res.err).not.toBe(true)
  expect(res.handled).toBe(HandleCodes.foundCommand)
  expect(evt.pal.logTailText(2)).toMatch(/You take the soap/i)
})

it('handle canTake: false items', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  testEnv.game?.story.gotoRoom('cell')

  const evt = testEnv.makeSceneEvent('get table')
  expect(evt.pres.pos?.target).toBe('table')
  const res = await BotRouter.tryCommands(evt)
  expect(res.err).not.toBe(true)
  expect(res.handled).toBe(HandleCodes.foundCommand)
  expect(evt.pal.logTailText(2)).toMatch(/You can't take the table/i)

})

it('should have fallback if thing cannot be found', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  game.story.gotoRoom('cell')
  const evt = testEnv.makeSceneEvent('get XYZ')
  expect(evt.pres.pos?.target).toBe('xyz')
  expect(evt.pres.rule?.event).toBe(RouterService.takeRoomThing)
  const done = await BotRouter.tryCommands(evt)
  // expect(done).toBe(true)
  // Logger.logObj('txt', evt.pal.allText, true)
  expect(evt.pal.logTailText(2)).toMatch(/You can't see/i)
})

it('should allow to examine something', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('cell')

  // const evt = env.makeSceneEvent('x soap')
  await BotRouter.anyEvent(testEnv.pal, 'look', 'test')
  await BotRouter.anyEvent(testEnv.pal, 'x gown', 'test')
  // console.log(await testEnv.pal.showLog())

  expect(testEnv.pal.logTailText(2)).toMatch(/An old dressing gown/i)

})


it('should allow top level room command with actions', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')

  testEnv.game?.story.gotoRoom('cell')
  const door = testEnv.game?.story.room.findThing('door')
  expect(door?.state).toBe('locked')  // initial
  testEnv.pal.sendInput('sesame')
  const res: ActionResult = await BotRouter.textEvent(testEnv.pal)
  // expect(res.handled).toBe(HandleCodes.processing)
  expect(res.err).not.toBe(true)
  expect(testEnv.pal.logTailText(1)).toMatch(/The door opens/i)
  Logger.assertTrue(!res.err, 'res', res)
  expect(res.err).not.toBe(true)
  // expect(res.handled).toBe(HandleCodes.okReplied)

  expect(door?.state).toBe('open')
})

describe('inventory', () => {
  it('should allow you to get items', async () => {
    const testEnv = new TestEnv()
    await testEnv.loadGame('office')
    expect(await testEnv.getReply('get letter')).toMatch(/You take the letter/i)
    expect(await testEnv.getReply('inv')).toMatch(/letter/i)

  })
})

