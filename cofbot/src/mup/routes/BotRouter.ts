import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'

import { SceneEvent } from './RouterService'

const BotRouter = {

  async textEvent(slackEvent) {
    Logger.logObj('slackEvent text', slackEvent.message.text)
    // const { message: MessageEvent, say: SayFn } = slackEvent
    const { message, say } = slackEvent
    const result: ParserResult | undefined = RexParser.parseAll(slackEvent.message.text)
    const pal = new Pal(slackEvent)

    if (result) {
      Logger.logObj('result', result)
      const evt: SceneEvent = { pal, result }
      result.rule.event(evt)
    } else {
      Logger.log('cannot find route', message)
    }

    // const found =
    //   await Dispatcher.commandActions(context, input) ||
    //   await Dispatcher.roomActions(context, input) ||
    //   await Dispatcher.basicInputActions(context, input) ||
    //   await Dispatcher.parseRegexRoutes(context, input)

    await say(`you said ${ message.text }`)
  }

}

export default BotRouter

