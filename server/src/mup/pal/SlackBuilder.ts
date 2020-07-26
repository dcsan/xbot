import Logger from "../../lib/Logger"
import Util from '../../lib/Util'
import Item from '../models/Item'

import { ActionBlock } from '../models/GameObject'
import AppConfig from '../../lib/AppConfig'

const SlackBuilder = {

  logging: AppConfig.debugMode,

  setLogging(flag) {
    SlackBuilder.logging = flag
  },

  buttonItem(blob) {
    let [text, value] = blob.split('|')
    text = text.trim()
    value = (value || text).trim()
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

  textBlock(text) {
    if (!text) {
      Logger.fatal('textBlock with no text!:', text)
    }
    const block = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text,
        // cannot have emoji in mrkdown?
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


  async itemCard(infoBlock: ActionBlock, item: Item) {
    let blocks: any[] = []
    if (!infoBlock) {
      blocks.push(SlackBuilder.textBlock(item.short))
    } else {
      if (infoBlock.imageUrl) {
        blocks.push(SlackBuilder.imageBlock(infoBlock, item))
      }
      // FIXME decide consistent naming or fallback
      const text = infoBlock.reply || '...item'
      blocks.push(SlackBuilder.textBlock(text))
    }
    return blocks
  }

}

export default SlackBuilder
