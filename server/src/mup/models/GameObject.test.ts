import Game from './Game.js';
import Room from './Room.js';
import { RexParser, ParserResult } from '../routes/RexParser'
import { TestEnv } from '../../lib/TestUtils';
import { ActionData, SceneEvent } from '../MupTypes'
import { Logger } from '../../lib/LogLib'

const log = console.log

afterAll(() => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done')
})


it('initial state', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  game.story.gotoRoom('office')
  const lamp = game.story.room.findThing('lamp')
  expect(lamp?.state).toBe('default')
})


it('take item', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  const evt = testEnv.makeSceneEvent('get lamp')
  await game.story.gotoRoom('office')
  const lamp = game.story.room.findThing('lamp')
  await game.story.room.takeItemByName('lamp', evt)
  // await lamp?.takeAction(evt)
  expect(lamp?.has).toBe('yes')
  // expect(pal.getLogLineText(0)).toBe('you get the Lamp')

  // await lamp?.takeAction(evt)
  // expect(pal.getLogLineText(2)).toBe('you already have the Lamp')

  await lamp?.dropItem(testEnv.pal)
  expect(lamp?.has).toBe('no')
  // expect(pal.getLogLineText(4)).toBe('you drop the Lamp')

  // await lamp?.dropItem(pal)
  // expect(lamp?.has).toBe(false)
  // expect(pal.getLogLineText(5)).toBe("you don't have the Lamp")

  // console.log(testEnv.pal.getLogs())

})

xit('can find item action', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  await game.story.gotoRoom('office')

  const item = game.story.room.findThing('soap')

  // log(item?.actions)
  // const action = item?.findAction('take')
  // log(item?.actions)
  // expect(action?.match).toBe('take')
})


it('can change state by actions', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  const evt = testEnv.makeSceneEvent('get lamp')

  await game.story.gotoRoom('reception')

  const item = game.story.room.findThing('wardrobe')
  expect(item?.doc.name).toBe('wardrobe')

  expect(item?.state).toBe('closed')
  expect(item?.description).toBe('The wardrobe is closed')
  const action: ActionData | undefined = item?.roomObj?.findAction('open wardrobe')

  // FIXME - not returning action results
  // expect(action).toBeDefined()

  // const evt: SceneEvent = testEnv.makeSceneEvent('wear')

  // log('action', action)
  if (action) {
    expect(action).toHaveProperty('then')
    await item?.runAction(action, evt)
  }
  expect(item?.getProp('state')).toBe('openFull')
  expect(item?.description).toMatch(/You see some clothes inside/)
})

it('can check conditions before actions', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  const room: Room = game.story.room
  await game.story.gotoRoom('lobby')
  room.reset()

  const clothes = game.story.room.findThing('clothes')
  const wardrobe = game.story.room.findThing('wardrobe')
  expect(wardrobe?.state).toBe('closed')
  // const evt: SceneEvent = testEnv.makeSceneEvent('wear')
  // await clothes?.findAndRunAction(evt)
  // const evt = testEnv.makeSceneEvent('get clothes')
  // console.log('logs', testEnv.pal.getLogs())
  // expect(testEnv.pal.getLogLineText(1)).toBe("You'll have to open the wardrobe first.")
})
