// import AppConfig from '../../lib/AppConfig'
import { getMockPal } from '../../lib/TestUtils'
// import Logger from '../../lib/Logger'
import Game from './Game'
import { Pal } from '../pal/Pal'
import { LoadOptions } from '../MupTypes'
// @ts-ignore
test('game loading', async () => {
  const pal: Pal = getMockPal()
  const opts: LoadOptions = {
    storyName: 'office',
    pal
  }
  const game = new Game(opts)
  await game.reset()
  expect(game.story.room.name).toBe('office')
  expect(game.story.room.actors.length).toBe(1)
})

