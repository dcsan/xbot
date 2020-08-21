import { Pal, ISlackEvent } from '../pal/Pal'
import { MakeLogger } from '../../lib/LogLib'

const logger = new MakeLogger('PalManager')

let palCache = {}

const PalManager = {

  // TODO store in mongo
  findPal(slackEvent: ISlackEvent | any, sid?: string): Pal {
    sid = sid ||
      slackEvent.event?.channel ||
      slackEvent.payload?.channel?.id ||
      slackEvent.payload?.channel_id ||    // action
      slackEvent.body?.container?.channel_id

    if (!sid) {
      logger.fatal('cannot get sessionId', JSON.stringify(slackEvent, null, 2))
    }

    let pal: Pal = palCache[sid!]
    if (pal) {
      logger.log('cached pal')
      pal.event(slackEvent)
      return pal
    }

    pal = new Pal(slackEvent, sid!)
    palCache[sid!] = pal
    return pal

  }

}

export { PalManager }
