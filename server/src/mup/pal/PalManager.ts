import { Pal, ISlackEvent } from '../pal/Pal'
import { DiscordPal } from '../pal/discord/DiscordPal'
import {
  Message
} from "discord.js";

import { MakeLogger } from '../../lib/LogLib'

const logger = new MakeLogger('PalManager')

let palCache = {}

const PalManager = {

  // TODO store in mongo
  findSlackPal(slackEvent: ISlackEvent | any, sid?: string): Pal {
    sid = sid ||
      slackEvent.event?.channel ||
      slackEvent.payload?.channel?.id ||
      slackEvent.payload?.channel_id ||    // action
      slackEvent.body?.container?.channel_id

    if (!sid) {
      logger.fatal('cannot get sessionId', JSON.stringify(slackEvent, null, 2))
    }
    let pal: Pal = palCache[sid!]
    if (!pal) {
      pal = new Pal(slackEvent, sid!)
      palCache[sid!] = pal
    }
    pal.lastEvent = slackEvent
    return pal
  },

  findDiscoPal(message: Message): Pal {
    const sid = message.channel.id
    let pal: Pal = palCache[sid]

    if (!pal) {
      pal = new DiscordPal(message, sid!)
      palCache[sid!] = pal
      logger.log('cached pal')
    } // else
    pal.lastEvent = message
    return pal
  }

}

export { PalManager }
