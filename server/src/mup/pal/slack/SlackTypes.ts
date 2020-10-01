import { SlashCommand } from '@slack/bolt'

import { IMessage } from '../MockChannel'

export interface ISlackSection {
  attachments: [
    {
      blocks: any[]
    }
  ]
}

// parent of SlackAdapter etc
export interface ISlackEvent {
  // ack?: any   // function
  ack?(): void
  say: any
  message: IMessage // input message from user
  store: any[]
  sessionId: string
  user?: {
    id: string
    username: string
    name: string
    team_id: string
  }
  action: {
    value?: string,
    text?: {
      text?: string
      type?: string // plain_text | ??
      emoji?: boolean
    }

    action_id?: string
    block_id?: string
    type?: string  // button | ???
    action_ts?: string // epoch timestamp 1598002814.864981
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


// FIXME - try to find slack types OR use Union types
export interface ISlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  elements?: any[]
  title?: any
  image_url?: string
  alt_text?: string
}

