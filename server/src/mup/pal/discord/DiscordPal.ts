import { Pal } from '../Pal'
import {
  Message
} from "discord.js"

import Util from '../../../lib/Util'

import { ISlackBlock } from '../slack/SlackTypes'
import { MakeLogger } from '../../../lib/LogLib'

const logger = new MakeLogger('DiscordPal')

class DiscordPal extends Pal {

  lastEvent: Message  // to force typechecking

  constructor(message: Message, sid: string) {
    super(message, sid)
    this.lastEvent = message  // to force the type
  }

  lastText(): string {
    const lastEvent = this.lastEvent as Message
    return lastEvent.content
  }

  async sendText(text: string) {
    if (!text) {
      logger.warn('tried to send empty text', text)
    }
    text = this.processTemplate(text)
    await this.lastEvent.channel.send(text)
    // const block = SlackBuilder.textBlock(text)
    // await this.sendBlocks([block])
    // await this.wrapSay({ text, type: 'text', who: 'bot' })
  }

  // blocks [
  //   {
  //     type: 'image',
  //     title: { type: 'plain_text', text: 'lobby', emoji: true },
  //     image_url: 'https://cbg.rik.ai/cdn/storydata/asylum/shots/640/title.jpg?x=26691836',
  //     alt_text: 'default'
  //   },
  //   {
  //     type: 'section',
  //     text: { type: 'mrkdwn', text: "You're in the lobby!" }
  //   }
  // ]

  async sendImage(block: ISlackBlock) {
    const imgPath = Util.localCdnPath(block.image_url)
    await this.lastEvent.channel.send(
      // block.alt_text,
      {
        files: [
          imgPath
        ]
      })
  }

  async sendSection(section: ISlackBlock) {
    const textPart = section.text
    const text = textPart?.text || 'unknown'
    // TODO - can have emoji
    await this.sendText(text)
  }

  async sendBlocks(blocks: ISlackBlock[]) {
    for (const block of blocks) {
      console.log('block', block)
      switch (block.type) {
        case 'image':
          await this.sendImage(block)
          break

        case 'section':
          await this.sendSection(block)
          break

        default:
          logger.warn('unknown block type', block.type)
          logger.logObj('block', block)
          await this.sendText('unknown block \```json\n' + JSON.stringify(block) + '```')
      }

    }
  }

}

export { DiscordPal }

