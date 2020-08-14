// Platform Abstraction Layer

// TODO - cleanup different log methods
// get to just one common log method

import yaml from 'js-yaml'
import { Logger } from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from './SlackBuilder'
import chalk from 'chalk'

import AppConfig from '../../lib/AppConfig'

const debugOutput = AppConfig.logLevel
// const debugOutput = false

const logMode = false

interface IMessage {
  text: string
}

// parent of SlackAdapter etc
interface IChannel {
  say: any
  message: IMessage // input message from user
  store: any[]
  sessionId: string
  action: {
    value: string,
  },
  payload: {
    channel: string // sessionId
  }
}

// actually based on a single Event, we create a channel
// TODO refactor
class MockChannel implements IChannel {
  store: any[]
  payload: {
    channel: string // sessionId
  }

  action: { value: string }
  message: IMessage
  sessionId: string

  constructor(sid: string = 'mock1234') {
    this.store = []
    this.sessionId = sid
    this.message = { text: '' }   // nothing coming in yet
    this.action = { value: '' }
    this.payload = {
      channel: sid
    }
  }

  say(msg) {
    this.store.push(msg)
    Logger.log('mock.say', msg)
  }

}

interface ChatLogItem {
  who: string
  text: string
  type: string    // text|buttons|
  blob?: any
  count?: number
}

// FIXME - do we need both class and interface?
class ChatLine {
  opts: ChatLogItem

  constructor(opts: ChatLogItem) {
    this.opts = opts
  }

  // wrapper for presentation
  output() {
    const padCount = `${this.opts.count}`.padStart(4, '0')
    // const padWho = `${this.opts.who}`.padEnd(6, ' ')
    const padWho = `${this.opts.who}`
    const cursor = this.opts.who === 'user' ? '<=' : ' =>'
    const showType = this.opts.type === 'text' ? '' : `[${this.opts.type}]`
    return (`${padCount} ${padWho} ${cursor} ${this.opts.text} ${showType}`)
  }
}

class ChatLogger {
  lines: ChatLine[]

  constructor() {
    this.lines = []
  }

  log(opts: ChatLogItem) {
    // just keep count in here
    opts.count = this.lines.length
    const line = new ChatLine(opts)
    this.lines.push(line)
    // console.log('logged:', line.output())
  }
}

class Pal {
  channelEvent: IChannel | MockChannel
  sessionId: string
  logger: ChatLogger
  lastInput?: string

  // FIXME - for slack middleware
  constructor(channelEvent: any) {
    this.channelEvent = channelEvent
    this.sessionId = channelEvent.payload?.channel || 'temp1234'
    this.logger = new ChatLogger()
    Logger.log('new pal', { sessionId: this.sessionId })
  }

  event(channelEvent: any) {
    // TODO keep a list of events?
    this.channelEvent = channelEvent
  }

  // for unit tests, get a line of stuff that was sent in
  // getReceivedText(idx): string {
  //   return this.channelEvent.store[idx]
  // }

  // just the text items
  get allText(): string {
    return this.channelEvent.store.join('\n')
  }

  // smash it to a blob for regex comparison
  get blob(): string {
    return JSON.stringify(this.channelEvent.store)
  }

  channelStore() {
    return this.channelEvent.store
  }

  // for testing
  sendInput(text) {
    this.lastInput = text
    if (this.channelEvent.message) {
      this.channelEvent.message.text = text
    }
  }

  lastOutput() {
    Logger.logObj('pal.logger', this.logger, true)
    return this.logger.lines[this.logger.lines.length - 1]
  }

  // reply(message) {
  //   this.channelEvent.say(message)
  // }

  async wrapSay(msg, type = 'text') {
    if (logMode) {
      Logger.logObj('msg', msg)
    }
    this.logOutput(msg, type)
    try {
      await this.channelEvent.say(msg)
    } catch (err) {
      Logger.logJson('ERROR channel.say =>', msg)
      Logger.error('ERROR', err)  // FIXME maybe not .data ?
    }
  }

  async sendText(text: string) {
    this.wrapSay(text, 'text')
  }

  async sendList(list: string[]) {
    const text = list.join('\n')
    this.wrapSay(text, 'text')
  }

  async postMessage(msg: any) {
    this.wrapSay(msg, 'post')
  }

  async debugMessage(obj) {
    if (AppConfig.logLevel <= 3) return
    // const clean = { ...obj } // remove nulls?
    const clean = Util.removeEmptyKeys(obj)
    // console.log('json', JSON.stringify(clean, null, 2))
    const blob = yaml.dump(clean, { skipInvalid: true, lineWidth: 200 })
    console.log('yaml', blob)
    await this.wrapSay(Util.quoteCode(blob), 'debug')
  }

  async sendButtons(buttons: string[]) {
    const block = SlackBuilder.buttonsBlock(buttons)
    await this.sendBlocks([block])
    this.logger.log({ who: 'bot', text: buttons.join(' | '), type: 'buttons' })
  }

  logBlocks(blob) {
    try {

      blob.attachments.forEach(att => {
        att.blocks.forEach(block => {
          let text = block.type // initialize
          switch (block.type) {
            case 'image':
              text = block.title.text
              break
            case 'section':
              text = block.text.text
              break
            case 'actions':
              text = block.elements[0].text.text
              break
          }
          this.logger.log({ who: 'bot', text, type: block.type })
        })
      })
    } catch (err) {
      Logger.warn('logging err', err)
      this.logger.log({ who: 'bot', text: JSON.stringify(blob), blob, type: 'blob' })
    }
  }

  // called for incoming events
  logInput(opts: ChatLogItem) {
    this.logger.log(opts)
  }

  // log bot output messages
  logOutput(msg, type: string) {
    if (debugOutput) {
      Logger.log('send:', msg)
    }
    switch (type) {
      case 'blocks':
        this.logBlocks(msg)
        break
      case 'text':
        this.logger.log({ type: 'text', who: 'bot', text: msg })
        break
      default:
        Logger.log('unknown type to log', type)
        this.logger.log({ who: 'bot', text: msg, type })
    }
  }

  async sendBlocks(blocks) {
    if (!blocks || !blocks.length) {
      console.trace('tried to sendBlocks with no blocks:', blocks)
    }
    const msg = SlackBuilder.wrapBlocks(blocks)
    this.wrapSay(msg, 'blocks')
  }

  getLogs() {
    return this.logger.lines
  }

  // getLogLineText(index = -1) {
  //   if (index === -1) {
  //     index = this.logger.lines.length - 1
  //   }
  //   const log: ChatLine = this.logger.lines[index]
  //   return log.opts.text
  // }

  logTail(lines: number = 1): string[] {
    const logs = this.logger.lines.map(line => line.opts.text)
    const len = logs.length
    return logs.slice(len - lines, len)
  }

  logTailText(lines = 1): string {
    const logs = this.logTail(lines)
    return logs.join(' / ')
  }

  async showLog() {
    const lines: string[] = []
    this.logger.lines.forEach(line => {
      lines.push(line.output())
    })
    const text = lines.join('\n')
    Logger.log('log', text)
    this.channelEvent.say(Util.quoteCode(text))
    return text
  }

}

export { Pal, MockChannel, IChannel }
