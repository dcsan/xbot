import { Pal } from '../pal/Pal'
import Game from './Game'
import Logger from '../../lib/Logger'

let GameList: Game[] = []

const GameManager = {

  // TODO store in mongo
  async findGame(pal: Pal): Promise<Game> {
    const sid = pal.sessionId
    let game = GameList[sid]
    if (!game) {
      game = new Game(sid)
      GameList[sid] = game
      await game.init()
      Logger.log('new game', sid)
      Logger.log('init routes gameObj.story', game.story.room.name)
    }
    // Logger.log('returning game', gameSession.sid)
    return game
  },

}

export { GameManager }
