// Platform Abstraction Layer
import Logger from '../../lib/Logger'
import Util from '../../lib/Util'
import SlackBuilder from '../../lib/adapters/SlackBuilder'
// parent of SlackAdapter etc
interface IChannel {
  say: any
  message: any
}

const debugFlag = true

class Pal {
  channel: IChannel
  sessionId: string

  constructor(channel) {
    Logger.log('new pal')
    this.channel = channel
    this.sessionId = "12345"
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
    if (debugFlag) await this.channel.say(Util.quoteCode(text))
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
    Logger.log('sendBlocks:', blocks.length)
    try {
      await this.channel.say(msg)
    } catch (err) {
      Logger.logJson('ERROR channel.say =>', msg)
      Logger.error('ERROR', err.response.data)
    }
  }

}

export { Pal }
