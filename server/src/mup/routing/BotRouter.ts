// import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import AppConfig from '../../lib/AppConfig'
import { Pal, ISlackEvent } from '../pal/base/Pal'
import { RexParser, ParserResult } from '../parser/RexParser'
import { SynManager, ISyn } from '../parser//Synonyms'

import { MakeLogger } from '../../lib/LogLib'
import { dfQuery } from '../nlp/DfWrapper'

import Util from '../../lib/Util'
import Game from 'mup/models/Game'
import { GameManager } from '../models/GameManager'
import {
  // RouterService,
  // PosResult,
  PalMsg,
  SceneEvent,
  // ActionResult
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
    const input: string = pal.lastText()
    pal.chatLogger.logInput({ who: 'user', text: input, type: 'text' })
    return await BotRouter.anyEvent(pal, input, 'text')
  },

  async actionEvent(pal: Pal, input?: string): Promise<boolean | undefined> {
    input = input || pal.lastActionValue()
    // pal.lastEvent.action.value ||
    // pal.lastEvent.action.text?.text  // button with URL link

    pal.chatLogger.logInput({ who: 'user', text: input, type: 'event' })
    return await BotRouter.anyEvent(pal, input!, 'action')
  },

  async command(pal, slackEvent: ISlackEvent): Promise<boolean | undefined> {
    const input = `${slackEvent.command!.command} ${slackEvent.command!.text}`
    return await BotRouter.anyEvent(pal, input, 'command')
  },

  async anyEvent(pal: Pal, input: string, _eventType: string = 'text'): Promise<boolean | undefined> {
    logger.break('anyEvent.input: ', input)

    if (!input || Util.shouldIgnore(input)) {
      logger.warn('shouldIgnore? TRUE:', input)
      return false
    } else {
      logger.log('not ignore:', input)
    }
    if (!Util.isCommand(input)) {
      logger.log('not isCommand:', input)
      return false
    }
    if (Util.isMutedChannel(pal)) {
      logger.log('isMutedChannel:', input)
      return false
    }

    input = Util.stripPrefix(input)
    const roomName = '' // FIXME for filtering what to replace/optimize
    const clean = SynManager.simplify(input, roomName)
    const pres: ParserResult = RexParser.parseCommands(clean)

    pal.logInput(input)  // store it for GameFuncs

    const game: Game = await GameManager.findGame({ pal })
    let evt: SceneEvent = { pal, pres, game }

    logger.log('evt.pres.clean', evt.pres.clean)

    let handled =
      await this.preCommands(evt) ||
      await this.tryRoomActions(evt) ||
      await this.postCommands(evt) ||
      await this.nluCommands(evt)

    let palMsg: PalMsg = {
      text: input,
    }

    logger.log('handled:', handled)

    if (handled) {
      palMsg.notHandled = false
      palMsg.intent = evt.pres.clean
      await pal.cbLogInput(palMsg) // 2nd param is NOThandled (inverse)
      return true
    } else {
      palMsg.notHandled = true
      await pal.cbLogInput(palMsg)
      const err = `no match: [${clean}]`
      // await pal.debugMessage(err)
      logger.warn(err)
      const target = evt.pres.pos?.target
      const verb = evt.pres.pos?.verb
      let msg = ''
      if (verb && target) {
        msg = `I don't know how to ${verb} ${target}`
      } else if (verb) {
        msg = `I don't know how to ${verb}`
      } else if (target) {
        msg = `I can't see a ${target}`
      } else {
        // dont understand at all!
        // TODO handle with an emoji reaction?
        if (Math.random() < 0.1) {
          await pal.sendReaction('help')
          // msg = `I don't understand ${clean}`
        }
      }
      if (msg) {
        await evt.pal.sendText(msg)
      }
      return false
    }
  },

  // run before room actions
  // for high-priority admin commands
  async preCommands(evt: SceneEvent): Promise<boolean | undefined> {
    if (evt.pres.rule?.type !== 'preCommand') {
      logger.log('no preCommands')
      return false
    }
    // logger.log('tryCommands for evt.pres=', evt.pres.clean)
    logger.log('preCommands found rule =>', evt.pres.rule.cname, evt.pres.rule.event)
    const result = await evt.pres.rule?.event(evt)
    logger.log('tryCommands.result =>', result)  // FIXME - track results?
    return true // parser found a command
  },

  // action.matches special commands
  // this checks against all the `actions.match` script in the room
  async tryRoomActions(evt: SceneEvent): Promise<boolean | undefined> {
    const result = await evt.game.story.room.findAndRunAction(evt)
    if (result) {
      logger.log('tryRoomActions.result =>', result)
    } else {
      logger.log('tryRoomActions no match for: ', evt.pres.clean)
    }
    return result
  },

  // get item fixed commands
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

  // we didn't get a hit on plain input so use NLP to get a better response
  // and try the whole chain of room actions again
  async nluCommands(evt: SceneEvent): Promise<boolean | undefined> {
    const nluResult = await dfQuery(evt.pres.clean)
    const { textResponse } = nluResult
    if (!textResponse) {
      logger.warn('no nlu.textResponse', nluResult)
    } else {
      logger.log('using nlu.textResponse:', textResponse)
    }

    // parse again based on NLU parsed input
    evt.pres = RexParser.parseCommands(textResponse)

    // chain of methods
    let handled =
      await this.tryRoomActions(evt) ||
      await this.postCommands(evt)

    logger.log('nluCommands.handled:', handled)

    return handled
  }

}

export default BotRouter
