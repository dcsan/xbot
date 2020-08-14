import { Pal, IChannel } from '../pal/Pal'
import { Logger } from '../../lib/LogLib'

let palCache = {}

const PalManager = {

  // TODO store in mongo
  findPal(channelEvent: IChannel | any): Pal {
    const sid =
      channelEvent.event?.channel ||
      channelEvent.body?.channel?.id ||
      channelEvent.body?.container?.channel_id

    if (!sid) {
      Logger.warn('cannot get channelId', JSON.stringify(channelEvent, null, 2))
    }

    let pal: Pal = palCache[sid]
    if (pal) {
      Logger.log('cached pal')
      pal.event(channelEvent)
      return pal
    }

    Logger.log('pal not found', sid, 'in', palCache)

    // else create it
    Logger.log('new pal for', { sid })
    pal = new Pal(channelEvent)
    palCache[sid] = pal
    return pal
  },

}

export { PalManager }
