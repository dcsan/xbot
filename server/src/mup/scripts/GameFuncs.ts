import { SceneEvent, ActionData } from '../MupTypes'
import { MakeLogger } from '../../lib/LogLib';
const logger = new MakeLogger('scripts/GameFuncs')

import BotRouter from '../routing/BotRouter'
// JS functions invoked from script

const GameFuncs = {
  async checkWashing(_action: ActionData, evt: SceneEvent): Promise<boolean> {
    const player = evt.game?.player!

    logger.log('js.checkWashing >>')

    if (!player.hasItem('soap')) {
      logger.log('js.checkWashing: no soap')
      await evt.pal.sendText("You don't have any soap!")
      return false
    }

    const sink = evt.game?.story.room.findThing('sink')
    if (sink?.getProp('handle') !== 'yes') {
      logger.log('js.checkWashing: no handle')
      await evt.pal.sendText("The handle on the sink is missing")
      return false
    }

    // if (evt.pal.lastInput !== 'wash hands neck ears face') {
    //   evt.pal.sendText("Hmm, that is not according to procedure.")
    //   return false
    // }

    await evt.pal.sendText("All washed up")
    await BotRouter.anyEvent(evt.pal, 'task4', 'text')

    logger.log('js.checkWashing OK >> task4')

    return true
  }
}

export { GameFuncs }