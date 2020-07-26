import Room from './Room.js'
import Game from './Game.js'
import { GameManager } from './GameManager'
import { Pal, MockChannel } from '../pal/Pal'
import { RexParser, ParserResult } from '../routes/RexParser'
import { SceneEvent } from '../MupTypes'
import { ActionResult } from '../models/GameObject'
import Logger from '../../lib/Logger'
import { TestEnv } from '../../lib/TestUtils'

// const WordUtils = require('../lib/WordUtils')
// import TestUtils from '../../lib/TestUtils';
// import RexParser from '../services/RexParser.js';
// const RexParser = require('./parser/RexParser.js');
// const { basicInputParser } = require('./parser/RexParser.js');




it('should have a name', async () => {
  const { game } = new TestEnv()
  expect(game).toBeDefined()
  expect(game.story.storyName).toBe('office')
})

xit('should respond to smell action', async () => {
  const { game, pal } = new TestEnv()
  expect(game.story.room.cname).toBe('office')
  expect(game.story.room.description).toMatch(/A boring looking/)

  const input = "smell"
  const result: ParserResult = RexParser.parseCommands(input)
  expect(result.parsed).not.toBeDefined()
  const evt: SceneEvent = { pal, result, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)
  expect(actualResult.handled).toBe(true)
  expect(actualResult.klass).toBe('room')
  expect(actualResult?.history ? actualResult?.history[0] : false).toBe('reply')
  expect(evt.pal.channel.store[0]).toMatch(/A musty smell/)
})

it('should handle a special action with a goto', async () => {
  const { game, pal } = new TestEnv()
  await game.story.gotoRoom('office')
  expect(game.story.room.cname).toBe('office')
  expect(game.story.room.description).toMatch(/A boring looking/)

  const input = "teleport cupboard"
  const result: ParserResult = RexParser.parseCommands(input)
  expect(result.parsed).not.toBeDefined()

  const evt: SceneEvent = { pal, result, game }
  const actualResult: ActionResult = await game.story.room.findAndRunAction(evt)

  expect(actualResult.handled).toBe(true)
  expect(game.story.room.name).toBe('cupboard')
  expect(actualResult.klass).toBe('room')
  expect(actualResult.history?.length).toBe(2)
  expect(actualResult.history ? actualResult.history[0] : false).toBe('reply')
  expect(evt.pal.channel.store[0]).toMatch(/you click your heels/i)
})


// const context = TestUtils.context
// const game = new Game(1234)

// beforeEach( async() => {
//   context.reset()
//   await game.init({ storyName: 'office' })
//   await game.story.room.reset()
// })

// test('item names', async () => {
//   const names = game.story.room.itemFormalNamesOneLine()
//   expect(names).toMatch(/a `Lamp`, a `Desk`, a `Note`, a `Chest/)
//   // expect(names).toEqual(["a Desk", "a Note", "a Chest", "a Lock", "a Key", "a Door"])
// })

// test('look room', async () => {
//   const blocks = await game.story.room.look(context)
//   // console.log(blocks)
//   expect(blocks).toHaveLength(4)
//   expect(blocks[0].type).toBe('image')
//   expect(blocks[3].type).toBe('section')  // items
//   expect(blocks[3].text.text).toMatch(/You see a `Lamp`, a `Desk`, a `Note`/)
// })

// //@ts-ignore
// test('Game setup', async () => {
//   const actor = await game.story.room.findActor('sid')
//   expect(actor.cname).toBe('sid')
//   expect(game.story.room.doc.name).toBe('office')
// })

// //@ts-ignore
// test('room examine actor', async () => {
//   expect(context.sent.msg).toBe(undefined)
//   const actor = await game.story.room.findActor('sid')
//   const parsed = {
//     event: 'examine',
//     target: 'firstItem',
//     groups: {
//       item: 'note'
//     }
//   }
//   const res = await actor.examine(parsed, context, game.player)
//   const atts = context.chat.msg.attachments
//   const blocks = context.flatBlocks()
//   // console.log('blocks', blocks)
//   expect(blocks).toHaveLength(2)
//   expect(blocks[1].text.text).toMatch(/^Sid hasn't been/)
// })

// //@ts-ignore
// test('examine item', async () => {
//   const item = game.story.room.findItem('chest')
//   const parsed = {
//     event: 'examine',
//     target: 'firstItem',
//     groups: {
//       item: 'note'
//     }
//   }
//   const found = await item.examine(parsed, context, game.player)
//   const atts = context.chat.msg.attachments
//   const blocks = atts[0].blocks
//   // console.log('att', atts)
//   // console.log('blocks', blocks)
//   expect(blocks).toHaveLength(2)
//   expect(blocks[1].text.text).toMatch(/^The chest is locked/)
// })

// test('load named story', async () => {
//   await game.init({ storyName: 'office', context })
//   // @ts-ignore
//   expect(game.story.doc.cname).toBe('office')
//   expect(game.story.doc.name).toBe('The Office')
// })

// test('gotoRoom', async () => {
//   await game.init({ storyName: 'office', context })
//   // expect(game.story.room.cname).toBe('start')
//   await game.story.gotoRoom('lobby', context)
//   expect(game.story.room.cname).toBe('lobby')
//   await game.story.currentRoom.gotoRoom('office', context)
//   expect(game.story.currentRoom.cname).toBe('office')
// })

// // FIXME - do this for the test story
// test('try room action', async () => {
//   await game.init({ storyName: 'office', context })
//   const input = 'rub lamp'
//   const parsed = RexParser.basicInputParser(input, game.story.currentRoom)
//   const reply = await game.story.room.tryAllActions(parsed, context)
//   // console.log('reply', reply)
//   expect(reply.type).toBe('itemAction')
//   expect(reply.action.actionData.goto).toBe('lobby')
//   expect(game.story.room.name).toBe('lobby')
//   expect(context.received.text).toMatch(/You rub the lamp and suddenly/)
// })

// test('room item actions', async () => {
//   const input = "read the note"
//   // context.setInput(input)
//   const parsed = RexParser.basicInputParser(input, game.story.currentRoom)
//   const result = await game.story.currentRoom.tryAllActions(parsed, context)
//   // log({sent: context.sent, chat: context.chat.msg})
//   expect(context.received.text).toMatch(/You read the note/)
//   const blocks = context.flatBlocks()
//   expect(blocks).toHaveLength(2)
//   expect(blocks[0].type).toBe('image')
//   expect(blocks[0].title.text).toBe('Note')
//   // expect(blocks[1].text.text).toMatch(/^The note has .*/)
//   expect(blocks[1].text.text).toMatch('The note just has')
//   expect(result.type).toEqual('itemAction')
// })
