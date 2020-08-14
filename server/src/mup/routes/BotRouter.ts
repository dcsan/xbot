// import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import AppConfig from '../../lib/AppConfig'
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import { Logger } from '../../lib/Logger'
import Util from '../../lib/Util'
import Game from 'mup/models/Game'
import { GameManager } from '../models/GameManager'
import {
  // RouterService,
  // PosResult,
  SceneEvent,
  ActionResult
} from '../MupTypes'

import WordUtils from '../../lib/WordUtils'

import { ErrorHandler, HandleCodes } from '../models/ErrorHandler'

// async function chainEvents(chain: any, evt: SceneEvent): Promise<ActionResult> {
//   for (const fn of chain) {
//     const res: ActionResult = await fn(evt)
//     if (!res.err) {
//       return res
//       // break
//     }
//   }
//   return {
//     handled: HandleCodes.unknown,
//     err: true
//   }
// }

const BotRouter = {

  async textEvent(pal: Pal): Promise<boolean | undefined> {
    const input: string = pal.channelEvent.message.text
    pal.logInput({ who: 'user', text: input, type: 'text' })
    return await BotRouter.anyEvent(pal, input, 'text')
  },

  async actionEvent(pal: Pal): Promise<boolean | undefined> {
    const input: string = pal.channelEvent.action.value
    pal.logInput({ who: 'user', text: input, type: 'event' })
    return await BotRouter.anyEvent(pal, input, 'action')
  },

  async anyEvent(pal: Pal, input: string, eventType: string = 'text'): Promise<boolean | undefined> {
    Logger.log('anyEvent.input:', input)
    // if (input[0])

    if (Util.shouldIgnore(input)) {
      // handled but ignored
      return true
    }

    // const { message: MessageEvent, say: SayFn } = slackEvent
    const clean = WordUtils.basicNormalize(input)
    pal.sendInput(clean)  // store it for GameFuncs
    const storyName = AppConfig.read('storyName')
    const game: Game = await GameManager.findGame({ pal, storyName })
    const pres: ParserResult = RexParser.parseCommands(clean)
    const evt: SceneEvent = { pal, pres, game }

    // chain of methods
    const actionResult =
      await this.tryRoomActions(evt) ||
      await this.tryCommands(evt)

    if (!actionResult) {
      const err = `no match: [${clean}]`
      await pal.debugMessage(err)
      Logger.warn(err)
    } else {
      await pal.debugMessage({
        ruleCname: pres.rule?.cname,
        ruleType: pres.rule?.type,
        input: clean,
        parsed: pres.parsed,
        groups: pres.parsed?.groups,
        pos: pres.pos,
        eventType,
        handled: actionResult,
        from: 'router',
      })
    }
    return actionResult
  },

  async tryRoomActions(evt: SceneEvent): Promise<boolean | undefined> {
    const res = await evt.game.story.room.findAndRunAction(evt)
    Logger.log('roomActions.res', res)
    return res
  },

  async tryCommands(evt: SceneEvent): Promise<boolean | undefined> {
    Logger.log('tryCommands for', evt.pres)
    if (evt.pres.rule?.type !== 'command') return false
    const res = await evt.pres.rule?.event(evt)
    Logger.log('tryCommands.res', res)
    return res
  },

}

export default BotRouter
