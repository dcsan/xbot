import { Pal } from '../pal/Pal'
import Game from './Game'
import Logger from '../../lib/Logger'
import { LoadOptions } from 'mup/MupTypes'

let GameList: Game[] = []

const GameManager = {

  // TODO store in mongo
  async findGame(opts: LoadOptions): Promise<Game> {
    const sid = opts.pal.sessionId
    let game = GameList[sid]
    if (!game) {
      game = new Game(opts)
      GameList[sid] = game
      await game.reset()
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', game.story.room.name)
    }
    // Logger.log('returning game', gameSession.sid)
    return game
  },

}

export { GameManager }
