const Logger = require("../Logger")

const SlackAdapter = {

  textBlock (text) {
    const block = {
      "type": "section",
      // "block_id": "section567",
      "text": {
        "type": "mrkdwn",
        "text": text,
        // "emoji": true
      }
    }
    return block
  },

  wrapBlocks (blocks) {

    const blob = {
      // text: this.data.examine,
      attachments: [
        {
          blocks
        }
      ]
    }
    return blob
  },

  // handle different types of output transparently
  async flexOutput (msg, context) {
    if (typeof (msg) === 'string') {
      await context.sendText(msg)
    } else if (Array.isArray(msg)) {
      msg.map( m => context.sendText(m))
    } else {
      await context.chat.postMessage(msg)
    }
  },

  async sendList (list, context) {
    const msg = list.join('\n')
    await context.sendText(msg)
  },

  async sendText (text, context) {
    if (!text) {
      Logger.error('sendText but no text')
    }
    await context.sendText(text)
  }

}

module.exports = SlackAdapter
