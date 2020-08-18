import { TestEnv } from '../../lib/TestUtils';
import BotRouter from './BotRouter';
import { RouterService } from './RouterService';
// import { HandleCodes } from '../models/ErrorHandler';
// import { Logger } from '../../lib/LogLib';

// import { ActionResult } from '../MupTypes'

// const log = console.log

let testEnv: TestEnv

// async function setupStory() {
//   await testEnv.loadGame('office')
//   await testEnv.game.story.gotoRoom('lobby')
//   return testEnv
// }

beforeAll(async () => {
  testEnv = new TestEnv()
})

beforeEach(async () => {
  await testEnv.initStory('office', 'lobby')
  // await setupStory()
  // process.stdout.write('start > BotRouterTest\n')
})

afterAll(async () => {
  await testEnv.close()
  // Logger.log('done')
  // log('done')
  // process.stdout.write('done > BotRouterTest\n')
})


it('should handle verb target to get thing', async () => {
  const evt = testEnv.makeSceneEvent('get soap')
  expect(evt.pres.pos?.target).toBe('Soap')
  const res = await BotRouter.tryCommands(evt)
  expect(res).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/You take the soap/i)
})

it('handle canTake: false items', async () => {
  const evt = testEnv.makeSceneEvent('get table')
  expect(evt.pres.pos?.target).toBe('table')
  const res = await BotRouter.tryCommands(evt)
  expect(res).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/You can't take the table/i)

})

it('should have fallback if thing cannot be found', async () => {
  const evt = testEnv.makeSceneEvent('get XYZ')
  expect(evt.pres.pos?.target).toBe('xyz')
  expect(evt.pres.rule?.event).toBe(RouterService.takeRoomThing)
  const done = await BotRouter.tryCommands(evt)
  expect(done).toBe(true)
  // Logger.logObj('txt', evt.pal.allText, true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/You can't see/i)
})

it('should allow to examine something', async () => {
  await BotRouter.anyEvent(testEnv.pal, 'look', 'test')
  await BotRouter.anyEvent(testEnv.pal, 'x shirt', 'test')
  expect(testEnv.pal.chatLogger.tailText(2)).toMatch(/a spare office shirt/i)
})


it('should allow top level room command with actions', async () => {
  await testEnv.initStory('office', 'lobby')
  const door = await testEnv.game?.story.room.findThing('door')
  expect(door?.state).toBe('locked')  // initial
  await testEnv.pal.sendInput('sesame')
  // const handled = await BotRouter.textEvent(testEnv.pal)

  expect(testEnv.pal.chatLogger.tailText(2)).toMatch(/The door opens/i)

  expect(door?.state).toBe('open')
})


it('should allow generic get and take', async () => {
  await testEnv.initStory('office', 'lobby')

  expect(testEnv.game.player.hasItem('shirt')).toBe(false)
  expect(await testEnv.getReply('get shirt')).toMatch(/You take the shirt/i)
  expect(await testEnv.getReply('inv')).toMatch(/shirt/i)

  // you can look at items you have in inventory
  expect(await testEnv.getReply('x shirt')).toMatch(/a spare office shirt/i)

  expect(await testEnv.getReply('get shirt')).toMatch(/You already have the shirt/i)

  expect(testEnv.game.player.hasItem('shirt')).toBe(true)

})

it('should allow you to get items based on special scripts', async () => {

  expect(testEnv.game.player.hasItem('letter')).toBe(false)

  expect(await testEnv.getReply('get letter')).toMatch(/You read the letter/i)
  expect(await testEnv.getReply('inv')).toMatch(/letter/i)

  // expect(await testEnv.getReply('take letter')).toMatch(/You've read the letter'/i)
  expect(await testEnv.getReply('x letter')).toMatch(/a letter with something shocking/i)
  expect(await testEnv.getReply('read letter')).toMatch(/a letter with something shocking/i)

  expect(testEnv.game.player.hasItem('letter')).toBe(true)

})

