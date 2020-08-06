// import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import AppConfig from '../../lib/AppConfig'
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import { Logger } from '../../lib/Logger'
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

async function chainEvents(chain: any, evt: SceneEvent): Promise<ActionResult> {
  for (const fn of chain) {
    const res: ActionResult = await fn(evt)
    if (!res.err) {
      return res
      // break
    }
  }
  return {
    handled: HandleCodes.unknown,
    err: true
  }
}

const BotRouter = {

  async textEvent(pal: Pal): Promise<ActionResult> {
    const input: string = pal.channelEvent.message.text
    pal.logEvent({ who: 'user', text: input, type: 'text' })
    return await BotRouter.anyEvent(pal, input, 'text')
  },

  async actionEvent(pal: Pal): Promise<ActionResult> {
    const input: string = pal.channelEvent.action.value
    return await BotRouter.anyEvent(pal, input, 'action')
  },

  async anyEvent(pal: Pal, input: string, eventType: string = 'text'): Promise<ActionResult> {
    Logger.log('anyEvent.input:', input)
    // if (input[0])
    if (/^[-'"\./# ,>\\]/.test(input)) {
      // ignore prefixed
      Logger.log('ignore prefixed: ', input)
      return { handled: HandleCodes.skippedPrefix }
    }
    // const { message: MessageEvent, say: SayFn } = slackEvent
    const clean = WordUtils.basicNormalize(input)
    pal.input(clean)  // store it for GameFuncs
    const storyName = AppConfig.read('storyName')
    const game: Game = await GameManager.findGame({ pal, storyName })
    const pres: ParserResult = RexParser.parseCommands(clean)

    const evt: SceneEvent = { pal, pres, game }

    // chain of methods
    const actionResult: ActionResult =
      await chainEvents([
        this.tryRoomActions,
        // this.tryThingActions,
        this.tryCommands,
      ], evt)

    if (actionResult.err) {
      const err = {
        msg: `cannot find route for [${clean}]`,
        code: actionResult.handled
      }
      await pal.debugMessage(err)
      Logger.warn('no match', err)
      ErrorHandler.sendError(actionResult.handled, evt, { input: clean })
    } else {
      await pal.debugMessage({
        ruleCname: pres.rule?.cname,
        ruleType: pres.rule?.type,
        input: clean,
        parsed: pres.parsed,
        groups: pres.parsed?.groups,
        pos: pres.pos,
        eventType,
        handled: actionResult.handled,
        from: 'router',
      })
    }
    return actionResult
  },

  async tryCommands(evt: SceneEvent): Promise<ActionResult> {
    if (evt.pres.rule?.type !== 'command') return { handled: HandleCodes.unknown, err: true }
    // await evt.pal.debugMessage(`rule: ${ evt.pres.rule?.cname }`)
    // invoke method in RouterService
    // call the function
    await evt.pres.rule?.event(evt)
    return {
      err: false,
      handled: HandleCodes.foundCommand
    }
  },

  async tryRoomActions(evt: SceneEvent): Promise<ActionResult | undefined> {
    const res: ActionResult | undefined = await evt.game?.story.room.findAndRunAction(evt)
    return res
  },

  // async tryThingActions(evt: SceneEvent): Promise<ActionResult> {
  //   const nounList: string[] = evt.game.story.room.getAllThingNames()
  //   const pres: ParserResult = RexParser.parseNounVerbs(evt.pres.clean, nounList)
  //   // const { subject, verb } = result.parsed?.groups
  //   if (pres.pos?.verb && pres.pos?.target) {
  //     return await evt.game.story.room.tryThingActions(pres, evt)
  //   }
  //   const res: ActionResult = {
  //     handled: HandleCodes.errMissingPos,
  //     err: true
  //   }
  //   return res
  // }

}

export default BotRouter
