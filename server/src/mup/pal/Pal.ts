// Platform Abstraction Layer


// import fs from 'fs'
// import path from 'path'
// import yaml from 'js-yaml'
import AppConfig from '../../lib/AppConfig'

// TODO - cleanup different log methods
// get to just one common log method
import { ChatLogger, IChatRow } from './ChatLogger'
import { MakeLogger } from '../../lib/LogLib'
import { MockChannel, IMessage } from './MockChannel'
import { ISlackEvent, ISlackSection } from './SlackTypes'

import Util from '../../lib/Util'
import SlackBuilder from './SlackBuilder'
// import chalk from 'chalk'


const logger = new MakeLogger('Pal')

const debugOutput = AppConfig.logLevel
const logMode = false

class Pal {
  slackEvent: ISlackEvent | MockChannel
  sessionId: string
  chatLogger: ChatLogger
  lastInput?: string

  // FIXME - for slack middleware
  constructor(channelEvent: any, sid: string) {
    this.slackEvent = channelEvent
    this.sessionId = sid
    this.chatLogger = new ChatLogger(sid)
    logger.log('new pal', { sessionId: this.sessionId })
  }

  // when a new event comes in to the same channel we just update the event
  // but keep the same Pal object for things like linked game/session/internal convoId
  event(slackEvent: any) {
    // TODO keep a list of events?
    this.slackEvent = slackEvent
  }

  // for testing
  async sendInput(text: string) {
    this.lastInput = text
    await this.chatLogger.logInput({ text, type: 'input', who: 'user' })
    // if (this.channelEvent.message) {
    //   this.channelEvent.message.text = text
    // }
  }

  lastOutput() {
    logger.logObj('pal.logger', this.chatLogger, true)
    return this.chatLogger.rows[this.chatLogger.rows.length - 1]
  }

  // TODO - fix up these types
  async wrapSay(msg: IChatRow) {
    await this.chatLogger.logRow(msg)
    try {
      await this.slackEvent.say(msg)
    } catch (err) {
      logger.logJson('ERROR channel.say =>', msg)
      logger.error('ERROR', err)  // FIXME maybe not .data ?
    }
  }

  async sendText(text: string) {
    await this.wrapSay({ text, type: 'text', who: 'bot' })
  }

  async sendImage(text: string) {
    await this.wrapSay({ text, type: 'image', who: 'bot' })
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

  async sendBlocks(blocks) {
    if (!blocks || !blocks.length) {
      console.trace('tried to sendBlocks with no blocks:', blocks)
    }
    const msg: ISlackSection = SlackBuilder.wrapBlocks(blocks)
    await this.slackEvent.say(msg)
    await this.chatLogger.logBlocks(msg)
    // await this.wrapSay(msg, 'blocks')
  }

  getLogs() {
    return this.chatLogger.rows
  }

  async showLog() {
    const text = this.chatLogger.tailText(-1)
    this.slackEvent.say(Util.quoteCode(text))
    return text
  }

}

export { Pal, MockChannel, ISlackEvent }
