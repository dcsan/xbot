import { Pal, IPal, FlexEvent } from '../base/Pal'
import Util from '../../../lib/Util'
import {
  // ChatLogger,
  IChatRow
} from '../ChatLogger'

import { MakeLogger } from '../../../lib/LogLib'
import {
  ISlackEvent,
  ISlackSection,
  ISlackBlock
} from './SlackTypes'
import SlackBuilder from './SlackBuilder'

const logger = new MakeLogger('SlackPal')

class SlackPal extends Pal implements IPal {

  // lastEvent: ISlackEvent
  // lastEvent: FlexEvent
  // lastSlackEvent: ISlackEvent

  constructor(channelEvent: any, sid: string) {
    super(channelEvent, sid)
    this.lastEvent = channelEvent
  }

  processTemplate(text: string): string {
    const username = this.lastEvent.user?.username
    logger.log('processTemplate user:', this.lastEvent.user)
    if (username) {
      text = text.replace(/$username/gi, username)
    }
    return text
  }

  lastText(): string {
    return this.lastEvent.message.text
  }

  lastActionValue(): string {
    const text =
      this.lastEvent.action.value ||
      this.lastEvent.action.text?.text  // button with URL link
    return text!
  }

  // TODO - fix up these types
  // rename as this is more like sendSay
  async wrapSay(msg: IChatRow) {
    await this.chatLogger.logRow(msg)
    try {
      await this.lastEvent.say(msg)
    } catch (err) {
      logger.logJson('ERROR channel.say =>', msg)
      logger.error('ERROR', err)  // FIXME maybe not .data ?
    }
  }

  async sendText(text: string) {
    text = this.processTemplate(text)
    const block = SlackBuilder.textBlock(text)
    await this.sendBlocks([block])
    // await this.wrapSay({ text, type: 'text', who: 'bot' })
  }

  async sendImage(url: string) {
    await this.wrapSay({ text: url, type: 'image', who: 'bot' })
  }

  async sendUnfurl(text: string) {
    const msg = {
      text,
      type: 'unfurl',
      who: 'bot',
      unfurl_links: false,
      unfurl_media: false
    }
    await this.wrapSay(msg)
  }

  // convenience to send an array of lines
  async sendList(list: string[]) {
    const text = list.join('\n')
    await this.wrapSay({ text, type: 'text', who: 'bot' })
  }

  async postMessage(msg: any) {
    msg.type = 'post'
    await this.wrapSay(msg)
  }

  async debugMessage(obj) {
    logger.warn('debug message', obj)
    // TODO - fixme / revive
    // if (AppConfig.logLevel <= 3) return
    // // const clean = { ...obj } // remove nulls?
    // const clean = Util.removeEmptyKeys(obj)
    // // console.log('json', JSON.stringify(clean, null, 2))
    // const blob = yaml.dump(clean, { skipInvalid: true, lineWidth: 200 })
    // console.log('yaml', blob)
    // await this.wrapSay(Util.quoteCode(blob), 'debug')
  }

  async sendButtons(buttons: string[]) {
    const block = SlackBuilder.buttonsBlock(buttons)
    await this.sendBlocks([block])
    await this.chatLogger.logRow({ who: 'bot', text: buttons.join(' | '), type: 'buttons' })
  }

  // we keep imageURLs local for other Pals that read from file system
  expandImageUrls(blocks: ISlackBlock[]) {
    blocks = blocks.map(block => {
      if (block.type === 'image') {
        block.image_url = Util.imageUrl(block.image_url)
      }
      return block
    })
    return blocks
  }

  async sendBlocks(blocks: ISlackBlock[]) {
    if (!blocks || !blocks.length) {
      console.trace('tried to sendBlocks with no blocks:', blocks)
    }
    blocks = this.expandImageUrls(blocks)
    const msg: ISlackSection = SlackBuilder.wrapBlocks(blocks)
    try {
      await this.lastEvent.say(msg)
    } catch (err) {
      logger.error('slack err', err)
      logger.logObj('sending msg:', msg)
    }
    await this.chatLogger.logBlocks(msg)
    // await this.wrapSay(msg, 'blocks')
  }
}

export { SlackPal }

