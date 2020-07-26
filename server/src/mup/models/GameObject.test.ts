import Game from './Game.js';
import Room from './Room.js';
import { RexParser, ParserResult } from '../routes/RexParser'
import { TestEnv } from '../../lib/TestUtils';
import { ActionData, SceneEvent } from '../MupTypes'



const log = console.log

it('initial state', async () => {
  const { game } = new TestEnv()
  game.story.gotoRoom('office')
  const lamp = game.story.room.findItem('lamp')
  expect(lamp?.state).toBe('unlit')

})


it('take item', async () => {
  const env = new TestEnv()
  const { game, pal } = env
  await game.story.gotoRoom('office')
  const lamp = game.story.room.findItem('lamp')
  await lamp?.getItem(pal)
  expect(lamp?.got).toBe(true)
  expect(pal.getReceivedText(0)).toBe('you get the Lamp')
  await lamp?.dropItem(pal)
  expect(lamp?.got).toBe(false)
  expect(pal.getReceivedText(1)).toBe('you drop the Lamp')
  await lamp?.dropItem(pal)
  expect(lamp?.got).toBe(false)
  expect(pal.getReceivedText(2)).toBe("you don't have the Lamp")
})

it('can find a matching action', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')

  const item = game.story.room.findItem('soap')
  // log(item?.actions)
  const action = item?.findAction('get')
  // log(item?.actions)
  expect(action?.match).toBe('get|take')
})


it('can change state by actions', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('cell')

  const item = game.story.room.findItem('wardrobe')
  expect(item?.doc.name).toBe('wardrobe')

  expect(item?.state).toBe('closed')
  expect(item?.description).toBe('The wardrobe is closed')
  const action: ActionData | undefined = item?.findAction('open')
  expect(action).toBeDefined()
  // log('action', action)
  if (action) {
    expect(action).toHaveProperty('then')
    await item?.runAction(action)
  }
  expect(item?.getProp('state')).toBe('open')
  expect(item?.description).toBe('The wardrobe is open')

})


it('can match optional values', async () => {
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
  game.story.gotoRoom('cell')
  game.story.room.reset()

  const clothes = game.story.room.findItem('clothes')
  const wardrobe = game.story.room.findItem('wardrobe')
  expect(wardrobe?.state).toBe('closed')
  const evt: SceneEvent = testEnv.makeSceneEvent('wear')
  clothes?.findAndRunAction(evt)
  // const evt = testEnv.makeSceneEvent('get clothes')
  expect(testEnv.pal.getReceivedText(0)).toBe("You'll have to open the wardrobe first.")
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
