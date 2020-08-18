// import * as _ from "lodash"
import { RexParser, ParserResult } from '../parser/RexParser';
import { RouterService } from './RouterService'

// import Game from '../models/Game.js';
import { TestEnv } from '../../lib/TestUtils'
import { SceneEvent } from './RouterService'

test('cheat command', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  const pres: ParserResult = RexParser.parseCommands('cheat')
  const evt: SceneEvent = { pal: testEnv.pal, pres, game }
  const cheatInfo = await RouterService.handleCheat(evt)
  // Logger.logObj('info', cheatInfo, true)
  expect(cheatInfo.room).toBeDefined()
  expect(cheatInfo.roomActions).toBeDefined()
  expect(cheatInfo.actors).toBeDefined()
  // TODO - more detail for matcher?
  expect(testEnv.pal.chatLogger.tailText(1)).toMatch(/room/gim)
})

