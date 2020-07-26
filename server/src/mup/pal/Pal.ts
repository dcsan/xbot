// Platform Abstraction Layer
import yaml from 'js-yaml'
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from './SlackBuilder'

import AppConfig from '../../lib/AppConfig'

const debugOutput = AppConfig.debugMode
// const debugOutput = false

// parent of SlackAdapter etc
interface IChannel {
  say: any
  store: any[]
  sessionId: string
}

class MockChannel implements IChannel {
  store: any[]

  constructor(sid: string = 'mock1234') {
    this.store = []
    this.sessionId = sid
  }
  sessionId: string

  say(msg) {
    this.store.push(msg)
    Logger.log('mock.say', msg)
  }
}



class Pal {
  channel: IChannel | MockChannel
  sessionId: string

  constructor(channel: IChannel) {
    Logger.log('new pal')
    this.channel = channel
    this.sessionId = channel.sessionId || 'temp1234'
  }

  // for unit tests, get a line of stuff that was sent in
  getReceivedText(idx): string {
    return this.channel.store[idx]
  }

  channelStore() {
    return this.channel.store
  }

  reply(message) {
    this.channel.say(message)
  }

  async sendText(text) {
    await this.channel.say(text)
  }

  async postMessage(msg: any) {
    await this.channel.say(msg)
  }

  async debugMessage(obj) {
    if (!debugOutput) return
    // const clean = { ...obj } // remove nulls?
    const clean = Util.removeEmptyKeys(obj)
    console.log('json', JSON.stringify(clean, null, 2))
    const blob = yaml.dump(clean, { skipInvalid: true, lineWidth: 200 })
    console.log('yaml', blob)
    await this.channel.say(Util.quoteCode(blob))
  }

  async sendButtons(buttons) {
    const block = SlackBuilder.buttonsBlock(buttons)
    await this.sendBlocks([block])
  }

  async sendBlocks(blocks) {
    if (!blocks || !blocks.length) {
      Logger.error('tried to sendBlocks with no blocks:', blocks)
    }
    const msg = SlackBuilder.wrapBlocks(blocks)
    if (debugOutput) {
      Logger.log('sendBlocks:', blocks.length)
    }
    try {
      await this.channel.say(msg)
    } catch (err) {
      Logger.logJson('ERROR channel.say =>', msg)
      Logger.error('ERROR', err)  // FIXME maybe not .data ?
    }
  }

}

export { Pal, MockChannel }
