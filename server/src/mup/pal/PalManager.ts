import { Pal, ISlackEvent } from '../pal/Pal'
import { MakeLogger } from '../../lib/LogLib'

const logger = new MakeLogger('PalManager')

let palCache = {}

const PalManager = {

  // TODO store in mongo
  findPal(channelEvent: ISlackEvent | any): Pal {
    const sid =
      channelEvent.event?.channel ||
      channelEvent.payload?.channel?.id ||
      channelEvent.payload?.channel_id ||    // action
      channelEvent.body?.container?.channel_id

    if (!sid) {
      logger.fatal('cannot get sessionId', JSON.stringify(channelEvent, null, 2))
    }

    let pal: Pal = palCache[sid]
    if (pal) {
      logger.log('cached pal')
      pal.event(channelEvent)
      return pal
    }

    // else create it
    // logger.logObj(`pal not found for sid [${sid}]`, { payload: channelEvent.payload })
    logger.log('new pal for', { sid })
    pal = new Pal(channelEvent)
    palCache[sid] = pal
    return pal
  },

}

export { PalManager }
