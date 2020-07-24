import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'
import Game from 'mup/models/Game'
import { RouterService, SceneEvent } from './RouterService'

const BotRouter = {

  async textEvent(slackEvent) {

    Logger.logObj('slackEvent text', slackEvent.message.text)
    // const { message: MessageEvent, say: SayFn } = slackEvent
    const pal = new Pal(slackEvent)
    const { message } = slackEvent

    const game: Game = await RouterService.findGame(pal)
    const input = slackEvent.message.text
    await pal.debugMessage(`input: ${ input }`)

    // commands
    const result: ParserResult | undefined = RexParser.parseCommands(input)
    if (result) {
      // await pal.sendText(`parsed: ${ result.parsed.groups }`)
      await pal.debugMessage(`rule: ${ result.rule.cname }`)
      const evt: SceneEvent = { pal, result }
      // dispatch the method
      await result.rule.event(evt)
      Logger.logObj('result', result)
      return
    }

    // room actions
    let actionResult = await game.story.room.tryRoomActions(input, pal)


    await pal.sendText('cannot find route')
    Logger.log('cannot find route', message)
  }

}


export default BotRouter

