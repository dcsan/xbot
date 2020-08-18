// FIXME - maybe not needed

import { ISlackEvent } from './SlackTypes'

interface IMessage {
  text: string
}


// actually based on a single Event, we create a channel
// TODO refactor
class MockChannel implements ISlackEvent {
  store: any[]
  payload: {
    channel: string // sessionId
  }

  action: { value: string }
  message: IMessage
  sessionId: string

  constructor(sid: string = 'mock1234') {
    this.store = []
    this.sessionId = sid
    this.message = { text: '' }   // nothing coming in yet
    this.action = { value: '' }
    this.payload = {
      channel: sid
    }
  }

  say(msg) {
    this.store.push(msg)
    // logger.log('mock.say', msg)
  }

}

export { MockChannel, IMessage }
