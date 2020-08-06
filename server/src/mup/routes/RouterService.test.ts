import _ from 'lodash'
import { RexParser } from './RexParser';
import { RouterService } from './RouterService'

// import Game from '../models/Game.js';
import { TestEnv } from '../../lib/TestUtils'
import { ParserResult } from './RexParser'
import { SceneEvent } from './RouterService'

test('cheat command', async () => {
  const { game, pal } = new TestEnv()
  await game.reset()
  const pres: ParserResult = RexParser.parseCommands('cheat')
  const evt: SceneEvent = { pal, pres, game }
  const cheatInfo = await RouterService.handleCheat(evt)
  // Logger.logObj('info', cheatInfo, true)
  expect(cheatInfo.room).toBeDefined()
  expect(cheatInfo.roomActions).toBeDefined()
  expect(cheatInfo.actors).toBeDefined()
  // TODO - more detail for matcher?
  expect(pal.getLogLineText(-1)).toMatch(/room/gim)
})

