// Platform Abstraction Layer
import Logger from '../../lib/Logger'

// parent of SlackAdapter etc
interface IChannel {
  say: any
  message: any
}

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

  async sendButtons(buttons) {
    Logger.log('sendButtons', buttons)
    await this.channel.say('buttons')
  }

}

export { Pal }
