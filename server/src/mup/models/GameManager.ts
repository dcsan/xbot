import { Pal } from '../pal/Pal'
import Game from './Game'
import { MakeLogger } from '../../lib/LogLib'
import { LoadOptions } from 'mup/MupTypes'
import AppConfig from '../../lib/AppConfig'
const logger = new MakeLogger('GameManager')

let GameList: Game[] = []

const GameManager = {

  // TODO store in mongo
  async findGame(opts: LoadOptions): Promise<Game> {
    const sid = opts.pal.sessionId

    let game: Game = GameList[sid]
    if (!game) {
      game = new Game(opts)
      GameList[sid] = game
      // dont reset existing games just new ones
      await game.reset(opts.pal)
      logger.log('new game', sid)
      logger.log('init routes gameObj.story', game.story.room.name)
    }
    return game
  },

}

export { GameManager }
