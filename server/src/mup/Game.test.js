const AppConfig = require('../lib/AppConfig')
const TestUtils = require('../lib/TestUtils')
const Logger = require('../lib/Logger')
const Game = require('./Game.js');

// @ts-ignore
test('game loading', () => {

  Logger.log('name', AppConfig.read('STORYNAME'))
  const game = new Game(1234)
  expect(game.story.room.name).toBe('office')
  expect(game.story.room.actors.length).toBe(1)
})

