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

  imageBlock (doc, item) {
    item = item || { name: 'item'} // default
    return {
      "type": "image",
      "title": {
        "type": "plain_text",   // no mrkdwn?
        "text": item.name,
        "emoji": true
      },
      "image_url": Util.imageUrl(doc.imageUrl),
      "alt_text": "item",    // should be item.name
    }
  },

  imageBox (opts) {
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
    if (!context || !context.chat) {
      Logger.error('tried to sendBlocks with no context.chat:', context)
    }
    if (!blocks || !blocks.length) {
      Logger.error('tried to sendBlocks with no blocks:', blocks)
    }

    const msg = SlackAdapter.wrapBlocks(blocks)
    Logger.logObj('sendBlocks:', blocks.length)
    await context.chat.postMessage(msg)
  },

  async sendItemCard (stateInfo, item, context) {
    let blocks = []
    if (!stateInfo) {
      blocks.push(SlackAdapter.textBlock(item.short))
    } else {
      if (stateInfo.imageUrl) {
        blocks.push(SlackAdapter.imageBlock(stateInfo, item))
      }
      // FIXME decide consistent naming or fallback
      const text = stateInfo.long || stateInfo.short || stateInfo.text
      blocks.push(SlackAdapter.textBlock(text))
    }
    await SlackAdapter.sendBlocks(blocks, context)
  }

}

module.exports = SlackAdapter
