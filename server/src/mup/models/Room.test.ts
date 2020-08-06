import { TestEnv } from '../../lib/TestUtils'
import { ActionResult, SceneEvent } from '../MupTypes'
import { ParserResult, RexParser } from '../routes/RexParser'
import { HandleCodes } from './ErrorHandler'
import { Logger } from '../../lib/Logger'

afterAll(() => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done > Room.test')
})


it('should respond to smell action', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('office')

  const input = "smell"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)
  expect(actualResult.err).not.toBe(true)
  expect(actualResult.handled).toBe(HandleCodes.processing)
  expect(actualResult.klass).toBe('room')
  // expect(actualResult?.history ? actualResult?.history[0] : false).toBe('reply')
  expect(evt.pal.getLogLineText(-1)).toMatch(/A musty smell/)
})

it('should respond to random sesame action', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('lobby')
  expect(game.story.room.cname).toBe('lobby')

  const input = "sesame"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const trackResult: ActionResult = await game.story.room.findAndRunAction(evt)
  expect(trackResult.err).not.toBe(true)
  expect(trackResult.handled).toBe(HandleCodes.processing)
  expect(trackResult.klass).toBe('room')
  // Logger.logObj('pal.logger', evt.pal.logger, true)
  expect(evt.pal.getLogLineText()).toMatch(/The door opens/)
  // const history: string[] | undefined = trackResult?.history
  // Logger.logObj('history', history)
  // expect(history ? history[0] : '').toBe('reply')
  // expect(evt.pal.channelEvent.store[0]).toMatch(/You shout \"sesame\" to the room/)
})



it('should handle a special action with a goto', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('office')
  expect(game.story.room.cname).toBe('office')
  expect(game.story.room.description).toMatch(/A large empty room/)

  const input = "teleport attic"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()

  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)

  // console.log('store', evt.pal.logger)
  expect(evt.pal.getLogLineText()).toMatch(/The attic is upstairs/i)

  expect(actualResult.err).not.toBe(true)
  expect(actualResult.handled).toBe(HandleCodes.foundGoto)
  expect(game.story.room.name).toBe('attic')
  expect(actualResult.klass).toBe('room')
  expect(actualResult.history?.length).toBe(1)
  expect(actualResult.history ? actualResult.history[0] : false).toBe('goto')
})


it('should find all things in a room', async () => {
  const testEnv = new TestEnv()
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
