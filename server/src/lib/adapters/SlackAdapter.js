const Logger = require("../Logger")
const Util = require('../Util')

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

  imageSection (opts) {
    return {
      type: "image",
      title: "some image",
      image_url: Util.imageUrl(opts.imageUrl),
      alt_text: opts.examine || opts.description || 'image',
    }
  },

  imageBlock (opts) {
    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": opts.text || "item"
      },
      "accessory": {
        "type": "image",
        "image_url": Util.imageUrl(opts.imageUrl),
        "alt_text": opts.name || "item"
      },
    }
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
      msg.map(m => context.sendText(m))
    } else {
      await context.chat.postMessage(msg)
    }
  },

  async sendList (list, context) {
    const msg = list.join('\n')
    await context.sendText(msg)
  },

  async sendText (text, context) {
    if (!context) {
      throw ('no context passed to .sendText')
    }
    if (!text) {
      throw ('sendText but no text')
    }
    await context.sendText(text)
  },

  async sendBlocks (blocks, context) {
    const msg = SlackAdapter.wrapBlocks(blocks)
    Logger.logObj('msg', msg)
    context.chat.postMessage(msg)
  },

  async sendItemCard (stateInfo, item, context) {
    let blocks = []
    if (!stateInfo) {
      blocks.push(SlackAdapter.textBlock(item.description))
    } else {
      if (stateInfo.imageUrl) {
        blocks.push(SlackAdapter.imageBlock(stateInfo))
      } else {
        blocks.push(SlackAdapter.textBlock(stateInfo.text))
      }
    }
    SlackAdapter.sendBlocks(blocks, context)
  }

}

module.exports = SlackAdapter
