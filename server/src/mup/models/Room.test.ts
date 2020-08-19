import { TestEnv } from '../../lib/TestUtils'
import {
  // ActionResult,
  SceneEvent
} from '../MupTypes'
import { ParserResult, RexParser } from '../parser/RexParser'
// import { HandleCodes } from './ErrorHandler'
// import { Logger } from '../../lib/LogLib'

// const log = console.log

const testEnv = new TestEnv()

beforeAll(async () => {
  await testEnv.init()
  await testEnv.resetChatLogs()
  // log('DONE beforeAll')
})


afterAll(async () => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done > Room.test')
  await testEnv.close()
  // log('DONE afterAll')
})


it('should respond to smell action', async () => {

  await testEnv.initStory('office', 'office')
  const input = "smell"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal: testEnv.pal, pres, game: testEnv.game }
  const ran = await testEnv.game.story.room.findAndRunAction(evt)
  expect(ran).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/A musty smell/)
})

it('should respond to random sesame action', async () => {
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('lobby')
  expect(game.story.room.cname).toBe('lobby')

  const input = "sesame"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const ran = await game.story.room.findAndRunAction(evt)
  expect(ran).toBe(true)
  expect(evt.pal.chatLogger.tailText(2)).toMatch(/The door opens/)
})



it('should handle a special action with a goto', async () => {

  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('office')
  const room = game.story.room
  // console.log('room', room)
  expect(room.cname).toBe('office')
  expect(room.description).toMatch(/A large empty room/)

  const input = "teleport attic"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()

  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const ran = await game.story.room.findAndRunAction(evt)
  expect(ran).toBe(true)

  expect(evt.pal.chatLogger.tailText(2)).toMatch(/The attic is upstairs/i)
  expect(game.story.room.name).toBe('attic')
})


it('should find all things in a room', async () => {

  const game = await testEnv.loadGame('office')
  game.story.gotoRoom('office')
  const things = game.story.room.getAllThingNames()
  expect(things).toHaveLength(12)
  expect(things).toContain("Matches")

  const rexStr = things.join('|')
  const rex = new RegExp(rexStr, 'mi')
  expect('box of matches').toMatch(rex)
  expect('soap').toMatch(rex)
  expect('bar of soap').toMatch(rex)

  expect(things).toContain("Soap")
  expect(things).toContain("bar of soap")  // synonyms
})
