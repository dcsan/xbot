// Platform Abstraction Layer

import {
  Message
} from "discord.js";


// import fs from 'fs'
// import path from 'path'
// import yaml from 'js-yaml'
import AppConfig from '../../../lib/AppConfig'

// TODO - cleanup different log methods
// get to just one common log method
import { ChatLogger, IChatRow } from '../ChatLogger'
import { MakeLogger } from '../../../lib/LogLib'
import { MockChannel, IMessage } from '../mock/MockChannel'
import { ISlackEvent, ISlackSection } from '../slack/SlackTypes'
import { BaseBuilder } from './BaseBuilder'

// import Util from '../../lib/Util'

// import chalk from 'chalk'

const logger = new MakeLogger('BasePal')

const debugOutput = AppConfig.logLevel
const logMode = false

export interface IPal {
  sendBlocks(blocks): Promise<any>
  sendText(msg: string)
  postMessage(msg: string)
  showLog()

  // discord only
  clearChannel(): Promise<void>
  showInstallUrl(): Promise<void>
  showVoiceChannel(_pal: Pal): Promise<void>
  wrapSay(msg: IChatRow): Promise<void>
  sendImage(url: string): Promise<void>
  sendUnfurl(text: string): Promise<void>
  sendList(list: string[]): Promise<void>
  debugMessage(obj): Promise<void>
  sendButtons(buttons: string[]): Promise<void>
  channelName(): string

  // fixme - signatue
  isAdmin(): boolean

  // builder methods
  // buttonsBlock(buttons: string[]): Buttons
}

// FIXME - some special union type?
export type FlexEvent = ISlackEvent | MockChannel | Message

class Pal implements IPal {

  // lastEvent: FlexEvent
  // FIXME - could be slack or discord event type
  lastEvent: any

  sessionId: string
  chatLogger: ChatLogger
  lastInput?: string
  builder = BaseBuilder

  // FIXME - for slack middleware
  constructor(channelEvent: FlexEvent, sid: string) {
    this.lastEvent = channelEvent
    this.sessionId = sid
    this.chatLogger = new ChatLogger(sid)
    // this.builder = BaseBuilder  // overridden in child
    logger.log('new pal', { sessionId: this.sessionId })
  }
  isAdmin(): boolean {
    throw new Error("Method not implemented.")
  }
  channelName(): string {
    logger.error("channelName Method not implemented.");
    return ('cannot find channel name')  // todo in subclass
  }
  sendList(_list: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  debugMessage(_obj: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  sendButtons(_buttons: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  sendUnfurl(_text: string): Promise<void> {
    throw new Error("sendUnfurl Method not implemented.");
  }
  sendImage(_url: string): Promise<void> {
    throw new Error("sendImage Method not implemented.");
  }

  wrapSay(_msg: IChatRow): Promise<void> {
    throw new Error("wrapSay Method not implemented.");
  }

  async showVoiceChannel(_pal: Pal) {
    throw new Error("showVoiceChannel Method not implemented in Pal");
  }
  async clearChannel(): Promise<void> {
    throw new Error("clearChannel Method not implemented in Pal");
  }
  async showInstallUrl(): Promise<void> {
    throw new Error("showInstallUrl Method not implemented in Pal");
  }

  async postMessage(_msg: string) {
    throw new Error("postMessage Method not implemented in Pal");
  }
  showLog() {
    throw new Error("showLog Method not implemented in Pal");
  }

  async sendInvite() {
    this.sendText('invite your friends!')
  }
  // abstract methods
  processTemplate(text: string): string {
    return text
  }

  async sendBlocks(_blocks: any[]) {
    // const msg = this.wrapBlocks_(blocks)
    // await this.chatLogger.logBlocks(msg)
    // throw new Error("sendBlocks Method not implemented in Pal");
    // TODO - implement and this.builder.xx for a builder type based on Pal.type
    logger.warn('sendBlocks not implemented in Pal')
  }

  async sendText(msg: string) {
    logger.warn('sendText not implement in Pal', msg)
  }

  // abstract method
  lastText(): string {
    const msg = "lastText should be implement in child class"
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

  // TODO - find names for common emoji
  emojiName(emoji): string {
    return emoji
  }

  async showTeams() {
    logger.warn('not implemented')
  }

}

export { Pal, MockChannel, ISlackEvent }
