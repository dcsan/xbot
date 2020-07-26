import _ from 'lodash'
import { RexParser } from './RexParser';
import { RouterService } from './RouterService'

// import Game from '../models/Game.js';
import { createTestEnv } from '../../lib/TestUtils'
import { ParserResult } from './RexParser'
import { SceneEvent } from './RouterService'

// import Logger from '../../lib/Logger.js';


// xtest('routeParser', async () => {
//   const found = await RexParser.fixedRouteParser('start')
//   expect(found.route.cname).toBe('restart')
//   expect(found.route.event).toBe(RouterService.startGame)
// })

test('cheat command', async () => {
  const { game, pal } = await createTestEnv()

  await game.reset()
  const result: ParserResult = RexParser.parseCommands('cheat')
  const evt: SceneEvent = { pal, result, game }
  const cheatInfo = await RouterService.handleCheat(evt)
  // Logger.logObj('info', cheatInfo, true)
  expect(cheatInfo.itemEvents).toBeDefined()
  expect(cheatInfo.roomEvents).toBeDefined()
  expect(cheatInfo.actors).toBeDefined()
  // TODO - more detail for matcher?
  expect(pal.getReceivedText()).toMatch(/room/gim)
})

