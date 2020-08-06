import Game from './Game.js';
import Room from './Room.js';
import { RexParser, ParserResult } from '../routes/RexParser'
import { TestEnv } from '../../lib/TestUtils';
import { ActionData, SceneEvent } from '../MupTypes'
import { Logger } from '../../lib/Logger'

const log = console.log

afterAll(() => {
  // Logger.log('done')
  // log('done')
  process.stdout.write('done')
})


it('initial state', async () => {
  const { game } = new TestEnv()
  game.story.gotoRoom('office')
  const lamp = game.story.room.findItem('lamp')
  expect(lamp?.state).toBe('unlit')

})


it('take item', async () => {
  const env = new TestEnv()
  const { game, pal } = env
  const evt = env.makeSceneEvent('get lamp')
  await game.story.gotoRoom('office')
  const lamp = game.story.room.findThing('lamp')
  await lamp?.takeAction(evt)
  expect(lamp?.has).toBe(true)
  expect(pal.getLogLineText(0)).toBe('you get the Lamp')

  await lamp?.takeAction(evt)
  expect(pal.getLogLineText(2)).toBe('you already have the Lamp')

  await lamp?.dropItem(pal)
  expect(lamp?.has).toBe(false)
  expect(pal.getLogLineText(4)).toBe('you drop the Lamp')

  await lamp?.dropItem(pal)
  expect(lamp?.has).toBe(false)
  expect(pal.getLogLineText(5)).toBe("you don't have the Lamp")

  // Logger.logObj('lines', pal.getLogs(), true)

})

xit('can find item action', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')

  const item = game.story.room.findItem('soap')

  // log(item?.actions)
  // const action = item?.findAction('take')
  // log(item?.actions)
  // expect(action?.match).toBe('take')
})


it('can change state by actions', async () => {
  const env = new TestEnv('office')
  const { game, pal } = env
  const evt = env.makeSceneEvent('get lamp')

  await game.story.gotoRoom('cell')

  const item = game.story.room.findItem('wardrobe')
  expect(item?.doc.name).toBe('wardrobe')

  expect(item?.state).toBe('closed')
  expect(item?.description).toBe('The wardrobe is closed')
  const action: ActionData | undefined = item?.findRoom?.findAction('open chest')

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

// moved all actions to the room for now
xit('item has action', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')
  const action1: ActionData = game.story.room.findAction('use matches on lamp')
  expect(action1.if).toHaveLength(1)
  const action2: ActionData = game.story.room.findAction('use the matches with a lamp')
  expect(action2.if).toHaveLength(1)
})

it('can check conditions before actions', async () => {
  const testEnv = new TestEnv()
  const { game } = testEnv
  const room: Room = game.story.room
  await game.story.gotoRoom('cell')
  room.reset()

  const clothes = game.story.room.findItem('clothes')
  const wardrobe = game.story.room.findItem('wardrobe')
  expect(wardrobe?.state).toBe('closed')
  const evt: SceneEvent = testEnv.makeSceneEvent('wear')
  await clothes?.findAndRunAction(evt)
  // const evt = testEnv.makeSceneEvent('get clothes')
  expect(testEnv.pal.getLogLineText(-1)).toBe("You'll have to open the wardrobe first.")
})


// xit('can use one item on another', async () => {

//   expect(matches).toBeDefined()
//   if (matches) {
//     // needed for test
//     matches.props['has'] = 'no'
//     room.findAndRunAction(evt)
//     expect(pal.getReceivedText(0)).toMatch(/you don't have any matches/)

//     matches.props['has'] = 'no'
//     room.findAndRunAction(evt)
//   }
//   expect(pal.getReceivedText(0)).toMatch(/you light the lamp/)
//   expect(lamp?.props['lit']).toBe('yes')

// })
