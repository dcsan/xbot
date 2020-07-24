import Logger from "../Logger"
import Util from '../Util'
import Item from '../../mup/models/Item'

const SlackBuilder = {

  logging: true,

  setLogging(flag) {
    SlackBuilder.logging = flag
  },

  buttonItem(text, value = false) {
    value = value || text
    return {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text,
        "emoji": true
      },
      "value": value
    }
  },

  wrapActionsInBlock(elements) {
    return (
      {
        "type": "actions",
        elements
      }
    )
  },

  buttonsBlock(buttons) {
    const buttonElements = buttons.map(b => SlackBuilder.buttonItem(b))
    const block = SlackBuilder.wrapActionsInBlock(buttonElements)
    return block
  },

  sendButtons(buttons, context) {
    const block = SlackBuilder.buttonsBlock(buttons)
    SlackBuilder.sendBlocks([block], context)
  },

  textBlock(text) {
    if (!text) {
      Logger.fatal('textBlock with no text!:', text)
    }
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

  imageSection(opts) {
    return {
      type: "image",
      title: "some image",
      image_url: Util.imageUrl(opts.imageUrl),
      alt_text: opts.examine || opts.description || 'image',
    }
  },

  imageBlock(doc, item) {
    item = item || { name: 'item' } // default
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

  imageBox(opts) {
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

  wrapBlocks(blocks) {
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
  async flexOutput(msg, context) {
    if (typeof (msg) === 'string') {
      await context.sendText(msg)
    } else if (Array.isArray(msg)) {
      msg.map(m => context.sendText(m))
    } else {
      await context.chat.postMessage(msg)
    }
  },

  async sendList(list, context) {
    const msg = list.join('\n')
    await context.sendText(msg)
  },

  async sendText(text, context) {
    if (!context) {
      throw ('no context passed to .sendText')
    }
    if (!text) {
      throw ('sendText but no text')
    }
    await context.sendText(text)
  },

  async sendBlocks(blocks, context) {
    if (!context || !context.chat) {
      Logger.error('tried to sendBlocks with no context.chat:', context.chat)
    }
    if (!blocks || !blocks.length) {
      Logger.error('tried to sendBlocks with no blocks:', blocks)
    }
    const msg = SlackBuilder.wrapBlocks(blocks)
    Logger.log('sendBlocks:', blocks.length)
    try {
      await context.chat.postMessage(msg)
    } catch (err) {
      Logger.logJson('ERROR chat.postMessage error. msg=>', msg)
      Logger.error('ERROR', err.response.data)
    }
  },

  async sendItemCard(stateInfoDoc, item: Item, context) {
    let blocks: any[] = []
    if (!stateInfoDoc) {
      blocks.push(SlackBuilder.textBlock(item.short))
    } else {
      if (stateInfoDoc.imageUrl) {
        blocks.push(SlackBuilder.imageBlock(stateInfoDoc, item))
      }
      // FIXME decide consistent naming or fallback
      const text = stateInfoDoc.long || stateInfoDoc.short || stateInfoDoc.text
      blocks.push(SlackBuilder.textBlock(text))
    }
    await SlackBuilder.sendBlocks(blocks, context)
  }

}

export default SlackBuilder
