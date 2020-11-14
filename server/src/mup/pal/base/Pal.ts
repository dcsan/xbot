// Platform Abstraction Layer

import {
  Message
} from "discord.js";

import AppConfig from '../../../lib/AppConfig'
import { PalMsg } from '../../MupTypes'

// TODO - cleanup different log methods
// get to just one common log method
import { CbLogger } from './ChatbaseLogger'
import { ChatLogger, IChatRow } from '../ChatLogger'

import { MockChannel, IMessage } from '../mock/MockChannel'
import { ISlackEvent, ISlackSection, ISlackBlock } from '../slack/SlackTypes'
import { BaseBuilder } from './BaseBuilder'

import { MakeLogger } from '../../../lib/LogLib'
const logger = new MakeLogger('BasePal')

// import Util from '../../lib/Util'

// import chalk from 'chalk'


const debugOutput = AppConfig.logLevel
const logMode = false

export interface IPal {
  sendBlocks(blocks): Promise<any>
  sendText(msg: string)
  sendReaction(msg: string)
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

  sendSection(section: ISlackBlock): Promise<void>
  sendImageBlock(section: ISlackBlock): Promise<void>
  // builder methods
  // buttonsBlock(buttons: string[]): Buttons
}

// FIXME - some special union type?
export type FlexEvent = ISlackEvent | MockChannel | Message

class Pal implements IPal {

  // lastEvent: FlexEvent
  // FIXME - could be slack or discord event type
  lastEvent: any
  lastSent: any // for tagging emoji onto

  sessionId: string
  chatLogger: ChatLogger
  lastInput?: string
  builder = BaseBuilder

  // FIXME - for slack middleware
  constructor(channelEvent: FlexEvent, sid: string) {
    this.lastEvent = channelEvent
    this.lastSent = channelEvent  // until we overwrite
    this.sessionId = sid
    this.chatLogger = new ChatLogger(sid)
    // this.builder = BaseBuilder  // overridden in child
    logger.log('new pal', { sessionId: this.sessionId })
  }
  async sendSection(_section: ISlackBlock): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async sendImageBlock(_section: ISlackBlock): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async sendReaction(_msg: string) {
    throw new Error("sendRection Method not implemented.");
  }
  isAdmin(): boolean {
    throw new Error("isAdmin Method not implemented.")
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

  async wrapSay(_msg: IChatRow) {
    logger.error('wrapSay not implemented ')
    // throw new Error("wrapSay Method not implemented.");
  }
  cbLogInput(_input: string, _notHandled: boolean): Promise<void> {
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

  async sendInvite(text = "Invite your friends!") {
    this.sendText('invite your friends! ' + text)
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
    logger.error('sendBlocks not implemented in Pal')
  }

  async sendText(msg: string) {
    logger.error('sendText not implement in BasePal', msg)
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

  // called from router to route event types
  setLastEvent(event: any) {
    // will be different for slack
    logger.log('setLastEvent channel.id', event.channel?.id)
    this.lastEvent = event
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

  cbLog(palMsg: PalMsg) {
    CbLogger.log(palMsg)
  }

  async showTeams() {
    logger.warn('not implemented')
  }

}

export { Pal, MockChannel, ISlackEvent }
