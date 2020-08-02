import { TestEnv } from '../../lib/TestUtils'
import { ActionResult, SceneEvent } from '../MupTypes'
import { ParserResult, RexParser } from '../routes/RexParser'
import { HandleCodes } from './ErrorHandler'

afterAll(() => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done > Room.test')
})

it('should have a name', async () => {
  const { game } = new TestEnv()
  expect(game).toBeDefined()
  expect(game.story.storyName).toBe('office')
})

it('should respond to smell action', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')
  expect(game.story.room.cname).toBe('office')
  expect(game.story.room.description).toMatch(/A large empty room/)

  const input = "smell"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal, pres, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)
  expect(actualResult.err).not.toBe(true)
  expect(actualResult.handled).toBe(HandleCodes.processing)
  expect(actualResult.klass).toBe('room')
  expect(actualResult?.history ? actualResult?.history[0] : false).toBe('reply')
  expect(evt.pal.channelEvent.store[0]).toMatch(/A musty smell/)
})

it('should respond to random sesame action', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('cell')
  expect(game.story.room.cname).toBe('cell')

  const input = "sesame"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal, pres, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)
  expect(actualResult.err).not.toBe(true)
  expect(actualResult.handled).toBe(HandleCodes.processing)
  expect(actualResult.klass).toBe('room')
  expect(actualResult?.history ? actualResult?.history[0] : false).toBe('reply')
  expect(evt.pal.channelEvent.store[0]).toMatch(/You shout \"sesame\" to the room/)
})



it('should handle a special action with a goto', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')
  expect(game.story.room.cname).toBe('office')
  expect(game.story.room.description).toMatch(/A large empty room/)

  const input = "teleport cupboard"
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.parsed).not.toBeDefined()

  const evt: SceneEvent = { pal, pres, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)

  // console.log('store', evt.pal.channel.store)
  expect(evt.pal.getReceivedText(0)).toMatch(/you click your heels/i)

  expect(actualResult.err).not.toBe(true)
  expect(actualResult.handled).toBe(HandleCodes.foundGoto)
  expect(game.story.room.name).toBe('cupboard')
  expect(actualResult.klass).toBe('room')
  expect(actualResult.history?.length).toBe(2)
  expect(actualResult.history ? actualResult.history[0] : false).toBe('reply')

})


it('should find all things in a room', () => {
  const { game, pal } = new TestEnv()
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
