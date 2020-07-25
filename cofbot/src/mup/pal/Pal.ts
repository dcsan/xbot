// Platform Abstraction Layer
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from './SlackBuilder'

const debugOutput = false

// parent of SlackAdapter etc
interface IChannel {
  say: any
  store: any[]
}

class MockChannel implements IChannel {
  store: any[]

  constructor() {
    this.store = []
  }

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
    this.sessionId = "12345"
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

  async debugMessage(text) {
    if (debugOutput) await this.channel.say(Util.quoteCode(text))
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
      Logger.error('ERROR', err.response.data)
    }
  }

}

export { Pal, MockChannel }
