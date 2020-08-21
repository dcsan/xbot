import { SlashCommand } from '@slack/bolt'

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

  // just extracting the main payload types from SlashCommand | Message
  payload: {
    command?: string;
    text: string;
    user_id?: string;
    user_name?: string;
    team_id?: string;
    channel_id?: string;
    // token: string;
    // response_url: string;
    // trigger_id: string;
    // team_domain: string;
    // channel_name: string;
    // enterprise_id?: string;
    // enterprise_name?: string;
  }
  // SlashCommand
  // {
  //   channel: string // sessionId
  // },
  command?: {
    command: string
    text: string
  }
}

export { ISlackEvent, ISlackSection }
