import { SceneEvent, ActionData } from '../MupTypes'
import { Logger } from '../../lib/LogLib'
import BotRouter from '../routing/BotRouter'
// JS functions invoked from script

const GameFuncs = {
  async checkWashing(_action: ActionData, evt: SceneEvent): Promise<boolean> {
    const player = evt.game?.player!
    if (!player.hasItem('soap')) {
      evt.pal.sendText("You don't have any soap!")
      return false
    }

    const sink = evt.game?.story.room.findThing('sink')
    if (sink?.getProp('handle') !== 'yes') {
      evt.pal.sendText("You can't turn that faucet handle like that!")
      return false
    }

    if (evt.pal.lastInput !== 'wash hands neck ears face') {
      evt.pal.sendText("Hmm, that is not according to procedure.")
      return false
    }

    evt.pal.sendText("All washed up")

    await BotRouter.anyEvent(evt.pal, 'task4', 'text')

    Logger.log('checkWashing')
    return true
  }
}

export { GameFuncs }