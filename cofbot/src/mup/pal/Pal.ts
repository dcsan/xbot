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

  /**
   * post a structured message or blocks
   * @param msg
   */
  async postMessage(msg: any) {
    await this.channel.say(msg)
  }

  async sendBlocks(blocks) {
    const msg = SlackBuilder.wrapBlocks(blocks)
    Logger.warn('sendBlocks', msg)
    await this.channel.say(msg)
  }

  async debugMessage(text) {
    if (debugFlag) await this.channel.say(Util.quoteCode(text))
  }

  async sendButtons(buttons) {
    Logger.log('sendButtons', buttons)
    await this.channel.say('buttons')
  }

}

export { Pal }
