import { App, MessageEvent, SayFn, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Pal } from '../pal/Pal'
import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'
import Game from 'mup/models/Game'
import { GameManager } from '../models/GameManager'
import {
  // RouterService,
  // PosResult,
  SceneEvent,
  ActionResult
} from '../MupTypes'

const BotRouter = {

  async textEvent(pal: Pal) {
    const input: string = pal.channel.message.text
    await BotRouter.anyEvent(pal, input, 'text')
  },

  async actionEvent(pal: Pal) {
    const input: string = pal.channel.action.value
    await BotRouter.anyEvent(pal, input, 'action')
  },

  async anyEvent(pal: Pal, input: string, eventType: string) {
    Logger.logObj('anyEvent.input:', input)
    // const { message: MessageEvent, say: SayFn } = slackEvent

    const storyName = 'asylum'
    const game: Game = await GameManager.findGame({ pal, storyName })
    const result: ParserResult = RexParser.parseCommands(input)

    const evt: SceneEvent = { pal, result, game }

    // chain of methods
    const handled =
      // basic commands look|cheat|go
      await this.tryCommands(evt) ||
      // room actions
      await this.tryRoomActions(evt) ||
      // object matched actions `open window` => window.open
      await this.tryThingActions(evt)

    if (!handled) {
      const msg = `cannot find route for [${ input }]`
      await pal.debugMessage(msg)
      Logger.warn('no match', msg)
    } else {
      await pal.debugMessage({
        ruleCname: result.rule?.cname,
        ruleType: result.rule?.type,
        input,
        parsed: result.parsed,
        groups: result.parsed?.groups,
        pos: result.pos,
        eventType,
        handled,
        from: 'router',
      })
    }
  },

  async tryCommands(evt: SceneEvent): Promise<boolean> {
    if (evt.result.rule?.type !== 'command') return false
    // await evt.pal.debugMessage(`rule: ${ evt.result.rule?.cname }`)
    // invoke method in RouterService
    await evt.result.rule?.event(evt)
    return true
  },

  async tryRoomActions(evt: SceneEvent): Promise<boolean> {
    const res: ActionResult = await evt.game.story.room.findAndRunAction(evt)
    return res.handled
  },

  async tryThingActions(evt: SceneEvent): Promise<ActionResult> {
    const nounList: string[] = evt.game.story.room.getAllThingNames()
    const result: ParserResult = RexParser.parseNounVerbs(evt.result.clean, nounList)
    // const { subject, verb } = result.parsed?.groups
    if (result.pos?.verb && result.pos?.target) {
      return await evt.game.story.room.tryThingActions(result, evt)
    }
    return {
      handled: false
    }
  }

}


export default BotRouter

