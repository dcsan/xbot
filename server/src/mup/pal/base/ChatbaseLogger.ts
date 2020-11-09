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

  async log(msg: PalMsg) {
    const cbMsg = chatbase.newMessage()
    cbMsg.setPlatform('DISCORD')
      .setTimestamp(Date.now().toString())
      .setUserId(msg.channel)

    assert(cbMsg.api_key === AppConfig.read('CHATBASE_KEY'))
    if (msg.sender === 'bot') {
      // add 1.2s to reply timestamps because we're sending them out of order
      const ts = (Date.now() + 500).toString()
      cbMsg.setAsTypeAgent()
        .setTimestamp(ts)
    } else {
      cbMsg.setAsTypeUser()
    }
    if (msg.notHandled) {
      cbMsg.setAsNotHandled()
    } else {
      cbMsg.setAsHandled()
    }

    cbMsg.setMessage(msg.text)
    const logres = await cbMsg.send()
    logger.logObj('cbLog', {
      text: msg.text,
      type: logres.type,
      not_handled: logres.not_handled
    })

  }

}

export { CbLogger }
