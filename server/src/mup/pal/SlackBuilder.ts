import { Logger } from "../../lib/LogLib"
import Util from '../../lib/Util'
import Item from '../models/Item'
import { GameObject } from '../models/GameObject'

import { ActionBranch } from '../MupTypes'
import AppConfig from '../../lib/AppConfig'


import { StateBlock } from '../MupTypes'

const SlackBuilder = {

  logging: AppConfig.logLevel,

  setLogging(flag) {
    SlackBuilder.logging = flag
  },

  // a single button: text|value
  buttonItem(buttonLine: string) {
    let [text, value] = buttonLine.split('|')
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

  buttonsBlock(buttons: string[]) {
    const buttonElements = buttons.map(b => SlackBuilder.buttonItem(b))
    const block = SlackBuilder.wrapActionsInBlock(buttonElements)
    return block
  },

  contextBlock(text) {
    const block = {
      "type": "context",
      "elements": [
        // {
        //   "type": "image",
        //   "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
        //   "alt_text": "cute cat"
        // },
        {
          "type": "mrkdwn",
          "text": text
        }
      ]
    }
    return block
  },

  textBlock(text: string) {
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

  // we pass the whole doc as it needs text for the alt/caption
  imageSection(doc: StateBlock) {
    return {
      type: "image",
      title: "some image",
      image_url: Util.imageUrl(doc.imageUrl),
      alt_text: doc.short || doc.name || 'image',
    }
  },

  imageBlock(doc: StateBlock, thing: GameObject) {
    return {
      "type": "image",
      "title": {
        "type": "plain_text",   // no mrkdwn?
        "text": thing.name || doc.short || "image", // name of the STATE not the room?
        "emoji": true
      },
      "image_url": Util.imageUrl(doc.imageUrl),
      "alt_text": doc.name || doc.short || "image"
    }
  },

  // imageBox(opts) {
  //   return {
  //     "type": "section",
  //     "text": {
  //       "type": "mrkdwn",
  //       "text": opts.text || "item"
  //     },
  //     "accessory": {
  //       "type": "image",
  //       "image_url": Util.imageUrl(opts.imageUrl),
  //       "alt_text": opts.name || "item"
  //     },
  //   }
  // },

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

  async itemCard(stateInfo: StateBlock, thing: GameObject) {
    let blocks: any[] = []
    if (stateInfo.imageUrl) {
      blocks.push(SlackBuilder.imageBlock(stateInfo, thing))
    }
    const text = stateInfo.long || stateInfo.short
    if (text) {
      blocks.push(SlackBuilder.textBlock(text))
    }
    if (stateInfo.buttons) {
      const buttonsBlock = SlackBuilder.buttonsBlock(stateInfo.buttons)
      blocks.push(buttonsBlock)
    }
    return blocks
  }

}

export default SlackBuilder
