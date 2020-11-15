// Google ChatBase logging lib
// https://github.com/google/chatbase-node/blob/master/README.md

import { strict as assert } from 'assert';
import AppConfig from '../../../lib/AppConfig'
import chatbase from '@google/chatbase'

import { PalMsg } from '../../MupTypes'

import { MakeLogger } from '../../../lib/LogLib'
const logger = new MakeLogger('CbLogger')

chatbase.setApiKey(AppConfig.read('CHATBASE_KEY'))


const CbLogger = {

  async log(palMsg: PalMsg) {
    logger.log('log palMsg', palMsg)
    assert(palMsg.userId !== null)
    assert(palMsg.platform !== null)
    assert(palMsg.text !== null)
    assert(palMsg.sender !== null)

    const cbMsg = chatbase.newMessage(AppConfig.read('CHATBASE_KEY'))

    // platform
    cbMsg.setPlatform(palMsg.platform)

    const userId = palMsg.userId || palMsg.channel
    assert(userId)
    cbMsg.setUserId(userId)

    let ts
    // type
    switch (palMsg.sender) {
      case 'bot':
        // add 1.2s to reply timestamps because we're sending them out of order
        cbMsg.setAsTypeAgent()
        ts = (Date.now() + 500).toString()
        break

      case 'user':
        cbMsg.setAsTypeUser()
        ts = (Date.now()).toString()
        break

      default:
        logger.warn('no sender set on palMsg')

    }
    // timestamp
    cbMsg.setTimestamp(ts)

    // handled
    if (palMsg.notHandled) {
      cbMsg.setAsNotHandled()
    } else {
      cbMsg.setAsHandled()
    }

    // version
    const appVersion = AppConfig.read('VERSION') || '0.0.1'
    cbMsg.setVersion(appVersion) // the version that the deployed bot is

    // message
    cbMsg.setMessage(palMsg.text)

    // intent
    cbMsg.setIntent(palMsg.intent)

    // do not await
    try {
      const result = await cbMsg.send()
      // cbMsg.send().then((result) => {
      //   logger.logObj('cbLog.result', {
      //     text: palMsg.text,
      //     type: result.type,
      //     not_handled: result.not_handled
      //   })
      // })
    } catch (err) {
      logger.error('fail to CbLog message', palMsg)
      logger.log('err:', err)
    }

  }

}

export { CbLogger }
