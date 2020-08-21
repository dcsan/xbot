// a mock channel event for testing
// simulates the SlackEvent or other adapter incoming event

import { ISlackEvent } from './SlackTypes'

interface IMessage {
  text: string
}


// actually based on a single Event, we create a channel
// TODO refactor
class MockChannelEvent implements ISlackEvent {
  store: any[]
  payload: {
    text: string
    channel: string // sessionId
  }

  action: { value: string }
  message: IMessage
  sessionId: string

  constructor(sid: string = 'mock1234') {
    this.store = []
    this.sessionId = sid
    this.message = {
      text: ''
    }   // nothing coming in yet
    this.action = {
      value: ''
    }
    this.payload = {
      text: '',
      channel: sid
    }
  }

  // the adapter should log this first
  say(msg) {
    this.store.push(msg)
    // logger.log('mock.say', msg)
  }

}

export { MockChannelEvent as MockChannel, IMessage }
