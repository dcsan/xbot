import AppConfig from '../../lib/AppConfig'
import TestUtils from '../../lib/TestUtils'
import Logger from '../../lib/Logger'
import Game from './Game.js';

// @ts-ignore
test('game loading', async () => {

  Logger.log('name', AppConfig.read('STORYNAME'))
  const game = new Game(1234)
  await game.init({storyName: 'office'})
  expect(game.story.room.name).toBe('office')
  expect(game.story.room.actors.length).toBe(1)
})

