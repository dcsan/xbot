const AppConfig = require('../../lib/AppConfig')
const TestUtils = require('../../lib/TestUtils')
const Logger = require('../../lib/Logger')
const Game = require('./Game.js');

// @ts-ignore
test('game loading', async () => {

  Logger.log('name', AppConfig.read('STORYNAME'))
  const game = new Game(1234)
  await game.init({storyName: 'office'})
  expect(game.story.room.name).toBe('office')
  expect(game.story.room.actors.length).toBe(1)
})

