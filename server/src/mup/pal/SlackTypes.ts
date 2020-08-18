import { IMessage } from './MockChannel'

interface ISlackSection {
  attachments: [
    {
      blocks: any[]
    }
  ]
}

// parent of SlackAdapter etc
interface ISlackEvent {
  // ack?: any   // function
  ack?(): void
  say: any
  message: IMessage // input message from user
  store: any[]
  sessionId: string
  action: {
    value: string,
  },
  payload: {
    channel: string // sessionId
  },
  command?: {
    command: string
    text: string
  }
}

export { ISlackEvent, ISlackSection }
