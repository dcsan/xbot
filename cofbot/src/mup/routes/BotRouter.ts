import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'
import Game from 'mup/models/Game'
import { GameManager } from 'mup/models/GameManager'
import { RouterService, SceneEvent } from './RouterService'

const BotRouter = {

  async textEvent(slackEvent) {

    Logger.logObj('slackEvent text', slackEvent.message.text)
    // const { message: MessageEvent, say: SayFn } = slackEvent
    const pal = new Pal(slackEvent)
    const input = slackEvent.message.text
    const game: Game = await GameManager.findGame(pal)
    await pal.debugMessage(`input: ${ input }`)
    const result: ParserResult = RexParser.parseCommands(input)

    const evt: SceneEvent = { pal, result, game }

    // commands
    const handled =
      await this.tryCommands(evt) ||
      await game.story.room.findAndRunAction(evt)

    // room actions

    if (!handled) {
      const msg = `cannot find route for [${ input }]`
      await pal.debugMessage(msg)
      Logger.warn('no match', msg)
    }

  },

  async tryCommands(evt: SceneEvent): Promise<boolean> {
    if (evt.result.rule?.type !== 'command') return false
    await evt.pal.debugMessage(`rule: ${ evt.result.rule?.cname }`)
    // invoke method in RouterService
    await evt.result.rule?.event(evt)
    return true
  }

}


export default BotRouter

