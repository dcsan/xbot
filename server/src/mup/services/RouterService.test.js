const _ = require('lodash')
const RexParser = require('./RexParser.js');
const RouterService = require('./RouterService')
const Dispatcher = require('./Dispatcher.js');
const Game = require('../models/Game.js');

const TestUtils = require('../../lib/TestUtils');
const Logger = require('../../lib/Logger.js');

const log = console.log

test('routeParser', async () => {
  const route = await RexParser.routeParser('start')
  expect(route.cname).toBe('restart')
  expect(route.event).toBe(RouterService.startGame)
})

