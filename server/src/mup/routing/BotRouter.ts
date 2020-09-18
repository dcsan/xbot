// import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import AppConfig from '../../lib/AppConfig'
import { Pal, ISlackEvent } from '../pal/Pal'
import { RexParser, ParserResult } from '../parser/RexParser'
import { MakeLogger } from '../../lib/LogLib'
import { dfQuery } from '../nlp/DfWrapper'

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

// import { ErrorHandler, HandleCodes } from '../models/ErrorHandler'

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
    const input: string = pal.slackEvent.message.text
    pal.chatLogger.logInput({ who: 'user', text: input, type: 'text' })
    return await BotRouter.anyEvent(pal, input, 'text')
  },

  async actionEvent(pal: Pal): Promise<boolean | undefined> {
    const input: string | undefined =
      pal.slackEvent.action.value ||
      pal.slackEvent.action.text?.text  // button with URL link

    pal.chatLogger.logInput({ who: 'user', text: input, type: 'event' })
    return await BotRouter.anyEvent(pal, input!, 'action')
  },

  async command(pal, slackEvent: ISlackEvent): Promise<boolean | undefined> {
    const input = `${slackEvent.command!.command} ${slackEvent.command!.text}`
    return await BotRouter.anyEvent(pal, input, 'command')
  },

  async anyEvent(pal: Pal, input: string, _eventType: string = 'text'): Promise<boolean | undefined> {

    if (!input || Util.shouldIgnore(input)) {
      logger.warn('shouldIgnore:', input)
      return false
    }
    if (!Util.isCommand(input)) {
      logger.warn('isCommand > ignore:', input)
      return false
    }
    input = Util.stripPrefix(input)

    logger.log('anyEvent.input: ', input)
    pal.logInput(input)  // store it for GameFuncs

    const storyName = AppConfig.read('storyName')
    const game: Game = await GameManager.findGame({ pal, storyName })
    const clean: string = WordUtils.basicNormalize(input)
    const pres: ParserResult = RexParser.parseCommands(clean)

    let evt: SceneEvent = { pal, pres, game }

    let handled =
      await this.preCommands(evt) ||
      await this.tryRoomActions(evt)
    if (handled) return handled

    // we didn't get a hit on plain input so use NLP methods
    const nluResult = await dfQuery(input)
    const { textResponse } = nluResult
    if (!textResponse) {
      logger.warn('no nlu.textResponse found', nluResult)
    } else {
      logger.log('using textResponse:', textResponse)
    }

    // chain of methods
    evt.pres = RexParser.parseCommands(textResponse)
    handled =
      await this.tryRoomActions(evt) ||
      await this.postCommands(evt)

    if (handled) {
      return true
    } else {
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
      await evt.pal.sendText(msg)
      return false
    }
  },

  async tryRoomActions(evt: SceneEvent): Promise<boolean | undefined> {
    logger.log('tryRoomActions evt.pres.clean=', evt.pres.clean)
    const result = await evt.game.story.room.findAndRunAction(evt)
    logger.log('roomActions.result =>', result)
    return result
  },

  async preCommands(evt: SceneEvent): Promise<boolean | undefined> {
    if (evt.pres.rule?.type !== 'preCommand') {
      logger.log('skip preCommands')
      return false
    }
    // logger.log('tryCommands for evt.pres=', evt.pres.clean)
    logger.log('preCommands found rule =>', evt.pres.rule.cname)
    const result = await evt.pres.rule?.event(evt)
    logger.log('tryCommands.result =>', result)  // FIXME - track results?
    return true // parser found a command
  },

  async postCommands(evt: SceneEvent): Promise<boolean | undefined> {
    if (evt.pres.rule?.type !== 'postCommand') {
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
