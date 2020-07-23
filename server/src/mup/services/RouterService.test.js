const _ = require('lodash')
const RexParser = require('./RexParser.js');
const RouterService = require('./RouterService')
const Dispatcher = require('./Dispatcher.js');
const Game = require('../models/Game.js');

const TestUtils = require('../../lib/TestUtils');
const Logger = require('../../lib/Logger.js');

const log = console.log
const context = TestUtils.context

test('routeParser', async () => {
  const found = await RexParser.fixedRouteParser('start')
  expect(found.route.cname).toBe('restart')
  expect(found.route.event).toBe(RouterService.startGame)
})

test('cheat command', async () => {
  context.reset()
  const game = await RouterService.findGame(1234)
  await game.init({storyName: 'office'})
  const cheatInfo = await RouterService.cheat(context)
  // Logger.logObj('info', cheatInfo, true)
  expect(cheatInfo.itemEvents).toBeDefined()
  expect(cheatInfo.roomEvents).toBeDefined()
  expect(cheatInfo.actors).toBeDefined()
  // TODO - more detail for matcher?
  expect(context.received.text).toMatch(/room/gim)
})

