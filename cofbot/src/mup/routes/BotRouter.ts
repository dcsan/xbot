import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'

import { SceneEvent } from './RouterService'

const BotRouter = {

  async textEvent(slackEvent) {
    Logger.logObj('slackEvent text', slackEvent.message.text)
    // const { message: MessageEvent, say: SayFn } = slackEvent
    const pal = new Pal(slackEvent)
    const { message } = slackEvent

    const result: ParserResult | undefined = RexParser.parseAll(slackEvent.message.text)

    await pal.debugMessage(`input: ${ message.text }`)

    if (result) {
      // await pal.sendText(`parsed: ${ result.parsed.groups }`)
      await pal.debugMessage(`rule: ${ result.rule.cname }`)
      const evt: SceneEvent = { pal, result }
      // dispatch the method
      await result.rule.event(evt)
      Logger.logObj('result', result)
    } else {
      await pal.sendText('cannot find route')
      Logger.log('cannot find route', message)
    }

  }

}

export default BotRouter

