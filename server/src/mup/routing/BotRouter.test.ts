import { TestEnv } from '../../lib/TestUtils';
import BotRouter from './BotRouter';
import { RouterService } from './RouterService';
// import { HandleCodes } from '../models/ErrorHandler';
import { MakeLogger } from '../../lib/LogLib';
const logger = new MakeLogger('botrouter.test')

// import { ActionResult } from '../MupTypes'

const log = logger.log

let testEnv: TestEnv

// async function setupStory() {
//   await testEnv.loadGame('office')
//   await testEnv.game.story.gotoRoom('lobby')
//   return testEnv
// }

beforeAll(async () => {
  testEnv = new TestEnv()
  await testEnv.init()  // open DB conn
  await testEnv.resetChatLogs()
})

beforeEach(async () => {
  await testEnv.initStory('asylum', 'cell')
  // expect(testEnv.dbConn._readyState).toBe(1)
})

// afterAll(async () => {
//   await testEnv.close()
// })


it('should handle verb target to get thing', async () => {
  const evt = testEnv.makeSceneEvent('get soap')
  expect(evt.pres.pos?.target).toBe('soap')
  const res = await BotRouter.postCommands(evt)
  expect(res).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/You take the soap/i)
})

it('handle canTake: false items', async () => {
  const evt = testEnv.makeSceneEvent('get table')
  expect(evt.pres.pos?.target).toBe('table')
  const res = await BotRouter.postCommands(evt)
  expect(res).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/You can't take the table/i)

})

it('should have fallback if thing cannot be found', async () => {
  const evt = testEnv.makeSceneEvent('get XYZ')
  expect(evt.pres.pos?.target).toBe('XYZ')
  expect(evt.pres.rule?.event).toBe(RouterService.takeRoomThing)
  const done = await BotRouter.postCommands(evt)
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
  // await testEnv.initStory('office', 'lobby')
  // log('findItem >')
  const door = await testEnv.game?.story.room.findThing('door')!
  // log('found item:', door.cname)
  // log('door.state', door.state)
  expect(door?.state).toBe('locked')  // initial
  // log('door.state', door.state)

  // log('sendInput >')
  // await testEnv.pal.sendInput('sesame')
  await BotRouter.anyEvent(testEnv.pal, 'sesame')
  // log('< sendInput.DONE')
  // log('door.state >', door.state)
  // const handled = await BotRouter.textEvent(testEnv.pal)

  // log('check rows >', testEnv.pal.chatLogger.rows)
  // log('check tail >', door.state)
  expect(testEnv.pal.chatLogger.tailText(2)).toMatch(/The door opens/i)

  expect(door?.state).toBe('open')
})


it('should allow generic get and take', async () => {

  expect(testEnv.game.player.hasItem('shirt')).toBe(false)
  expect(await testEnv.getReply('get shirt')).toMatch(/You take the shirt/i)
  // expect(await testEnv.getReply('inv')).toMatch(/\[Shirt\]/i)

  // you can look at items you have in inventory
  expect(await testEnv.getReply('x shirt')).toMatch(/a spare office shirt/i)

  expect(await testEnv.getReply('get shirt')).toMatch(/You already have the shirt/i)

  expect(testEnv.game.player.hasItem('shirt')).toBe(true)

})

it('should allow you to get items based on special scripts', async () => {

  expect(testEnv.game.player.hasItem('letter')).toBe(false)

  expect(await testEnv.getReply('get letter')).toMatch(/You take the letter/i)
  expect(await testEnv.getReply('inv')).toMatch(/letter/i)

  // expect(await testEnv.getReply('take letter')).toMatch(/You've read the letter'/i)
  expect(await testEnv.getReply('x letter')).toMatch(/a letter with something shocking/i)
  expect(await testEnv.getReply('read letter')).toMatch(/a letter with something shocking/i)

  expect(testEnv.game.player.hasItem('letter')).toBe(true)

})

