// PAL Platform Abstraction Layer
// select relevant Pal to dispatch events to

import { Pal, ISlackEvent } from './base/Pal'
import {
  Message
} from "discord.js";

import { SlackPal } from './slack/SlackPal'
import { DiscordPal } from '../pal/discord/DiscordPal'

import { MakeLogger } from '../../lib/LogLib'

const logger = new MakeLogger('PalManager')

// could hold both slack and discord Pals
let palCache = {}

const PalManager = {

  // TODO store in mongo
  findSlackPal(slackEvent: ISlackEvent | any, sid?: string): SlackPal {
    sid = sid ||
      slackEvent.event?.channel ||
      slackEvent.payload?.channel?.id ||
      slackEvent.payload?.channel_id ||    // action
      slackEvent.body?.container?.channel_id

    if (!sid) {
      logger.fatal('cannot get sessionId', JSON.stringify(slackEvent, null, 2))
    }
    let pal: SlackPal = palCache[sid!]
    if (!pal) {
      pal = new SlackPal(slackEvent, sid!)
      palCache[sid!] = pal
    }
    pal.lastEvent = slackEvent
    return pal
  },

  findDiscoPal(message: Message): DiscordPal {
    const sid = message.channel.id
    let pal: DiscordPal = palCache[sid]

    if (!pal) {
      pal = new DiscordPal(message, sid!)
      palCache[sid!] = pal
      logger.log('cached pal')
    } // else
    pal.setLastEvent(message)
    return pal
  }

}

export { PalManager }
