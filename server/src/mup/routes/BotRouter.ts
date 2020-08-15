// import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import AppConfig from '../../lib/AppConfig'
import { Pal, ISlackEvent } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import { MakeLogger } from '../../lib/LogLib'
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

const logger = new MakeLogger('botRouter')

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

  async command(pal, slackEvent: ISlackEvent): Promise<boolean | undefined> {
    const input = `${slackEvent.command!.command} ${slackEvent.command!.text}`
    return await BotRouter.anyEvent(pal, input, 'command')
  },

  async anyEvent(pal: Pal, input: string, _eventType: string = 'text'): Promise<boolean | undefined> {
    logger.log('anyEvent.input:', input)
    // if (input[0])

    if (Util.shouldIgnore(input)) {
      logger.log('ignoring')
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
    const handled: boolean | undefined =
      await this.tryRoomActions(evt) ||
      await this.tryCommands(evt)

    if (!handled) {
      const err = `no match: [${clean}]`
      await pal.debugMessage(err)
      logger.warn(err)
      const target = evt.pres.pos?.target
      const verb = evt.pres.pos?.verb
      let msg = ''
      if (target && verb) {
        msg = `I don't know how to ${verb} the ${target}`
      } else if (target) {
        msg = `I can't see a ${target}`
      } else {
        msg = `I don't understand ${input}`
      }
      evt.pal.sendText(msg)
    } else {
      const msg = ({
        input,
        clean,
        ruleCname: pres.rule?.cname,
        // ruleType: pres.rule?.type,
        // parsed: pres.parsed,
        // groups: pres.parsed?.groups,
        pos: pres.pos,
        // eventType,
        handled,
        // from: 'router',
      })
      logger.log('response:', msg)
    }
    return handled
  },

  async tryRoomActions(evt: SceneEvent): Promise<boolean | undefined> {
    logger.log('tryRoomActions evt.pres.clean=', evt.pres.clean)
    const result = await evt.game.story.room.findAndRunAction(evt)
    logger.log('roomActions.result =>', result)
    return result
  },

  async tryCommands(evt: SceneEvent): Promise<boolean | undefined> {
    if (evt.pres.rule?.type !== 'command') {
      logger.log('skip tryCommands for non room action for evt.pres.rule=', evt.pres.rule)
      return false
    }
    // logger.log('tryCommands for evt.pres=', evt.pres.clean)
    logger.log('tryCommands found rule =>', evt.pres.rule.cname)
    const result = await evt.pres.rule?.event(evt)
    logger.log('tryCommands.result =>', result)  // FIXME - track results?
    return true // parser found a command
  },

}

export default BotRouter
