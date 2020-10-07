// Platform Abstraction Layer

import {
  Message
} from "discord.js";


// import fs from 'fs'
// import path from 'path'
// import yaml from 'js-yaml'
import AppConfig from '../../lib/AppConfig'

// TODO - cleanup different log methods
// get to just one common log method
import { ChatLogger, IChatRow } from './ChatLogger'
import { MakeLogger } from '../../lib/LogLib'
import { MockChannel, IMessage } from './MockChannel'
import { ISlackEvent, ISlackSection } from './slack/SlackTypes'

// import Util from '../../lib/Util'

// import chalk from 'chalk'

const logger = new MakeLogger('Pal')

const debugOutput = AppConfig.logLevel
const logMode = false

interface IPal {
  sendBlocks(blocks): Promise<any>
  sendText(msg: string)
  postMessage(msg: string)
  showLog()

  // discord only
  clearChannel(): Promise<void>
  showInstallUrl(): Promise<void>
  showVoiceChannel(_pal: Pal): Promise<void>
}

export type FlexEvent = ISlackEvent | MockChannel | Message

class Pal implements IPal {
  lastEvent: FlexEvent
  sessionId: string
  chatLogger: ChatLogger
  lastInput?: string

  // FIXME - for slack middleware
  constructor(channelEvent: FlexEvent, sid: string) {
    this.lastEvent = channelEvent
    this.sessionId = sid
    this.chatLogger = new ChatLogger(sid)
    logger.log('new pal', { sessionId: this.sessionId })
  }

  async showVoiceChannel(_pal: Pal) {
    throw new Error("Method not implemented.");
  }
  async clearChannel(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async showInstallUrl(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  postMessage(_msg: string) {
    throw new Error("Method not implemented.");
  }
  showLog() {
    throw new Error("Method not implemented.");
  }

  // abstract methods
  processTemplate(text: string): string {
    return text
  }

  async sendBlocks(_blocks: any[]) {
    // const msg = this.wrapBlocks_(blocks)
    // await this.chatLogger.logBlocks(msg)
    // throw new Error("sendBlocks Method not implemented.");
    // TODO - implement and this.builder.xx for a builder type based on Pal.type
    logger.warn('sendBlocks not implemented')
  }

  sendText(msg: string) {
    logger.warn('send text should be in child', msg)
  }

  // abstract method
  lastText(): string {
    const msg = "should be implement in child class"
    logger.error(msg)
    return msg
  }

  lastActionValue(): string {
    const msg = "lastActionValue should be in subclass"
    logger.error(msg)
    return msg
  }

  // for testing
  async logInput(text: string) {
    this.lastInput = text
    await this.chatLogger.logInput({ text, type: 'input', who: 'user' })
    // if (this.channelEvent.message) {
    //   this.channelEvent.message.text = text
    // }
  }

  lastOutput() {
    logger.logObj('pal.logger', this.chatLogger, { force: true })
    return this.chatLogger.rows[this.chatLogger.rows.length - 1]
  }

  getLogs() {
    return this.chatLogger.rows
  }


}

export { Pal, MockChannel, ISlackEvent }
