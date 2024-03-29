import Util from '../../../lib/Util'
// import Item from '../../models/Item'
import { GameObject } from '../../models/GameObject'

import { ISlackSection, ISlackBlock } from '../slack/SlackTypes'
// import { ActionBranch } from '../../MupTypes'
import AppConfig from '../../../lib/AppConfig'
import { StateBlock } from '../../MupTypes'

import { MakeLogger } from "../../../lib/LogLib"
const logger = new MakeLogger('BaseBuilder')

class BaseBuilder {

  // logging: AppConfig.logLevel,

  // setLogging(flag) {
  //   BaseBuilder.logging = flag
  // },

  // a single button: text|value|emoji
  // TODO - simplify for MockBuilder / debugging
  static buttonItem(buttonLine: string) {
    let [text, value, icon] = buttonLine.split('|')
    // icon = (icon).trim()
    text = text.trim()
    value = (value || text).trim()
    return {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text,
        "emoji": true
      },
      // icon, // for discord emoji
      "value": value
    }
  }

  static wrapActionsInBlock(elements) {
    return (
      {
        "type": "actions",
        elements
      }
    )
  }

  static buttonsBlock(buttons: string[]) {
    const buttonElements = buttons.map(b => this.buttonItem(b))
    const block = BaseBuilder.wrapActionsInBlock(buttonElements)
    return block
  }

  static emojiBlock(emoji: string[]) {
    const block = {
      type: 'emoji',
      emoji
    }
    return block
  }

  static contextBlock(text) {
    const block: ISlackBlock = {
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
  }

  static textBlock(text: string) {
    const block: ISlackBlock = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text,
        // cannot have emoji in mrkdown?
        // "emoji": true
      }
    }
    return block
  }

  // we pass the whole doc as it needs text for the alt/caption
  static imageSection(doc: StateBlock) {
    return {
      type: "image",
      title: "some image",
      image_url: Util.imageUrl(doc.imageUrl),
      alt_text: doc.short || doc.name || 'image',
    }
  }

  static imageBlock(doc: StateBlock, thing: GameObject): ISlackBlock {

    // FIXME - discord builds images differently
    // const image_url = Util.imageUrl(doc.imageUrl)
    const image_url = doc.imageUrl

    const imgBlock: ISlackBlock = {
      "type": "image",
      "title": {
        "type": "plain_text",   // no mrkdwn?
        "text": thing.name || doc.short || "image", // name of the STATE not the room?
        "emoji": true
      },
      "image_url": image_url,
      "alt_text": doc.name || doc.short || "image"
    }
    return imgBlock
  }

  // link to the item on the web with a button beneath
  static webLink(doc: StateBlock, thing: GameObject) {
    const fullUrl = AppConfig.webDomain + doc.webUrl
    const linkText = doc.webLinkText || `:mag:  Examine ${thing.name}`
    return {
      "type": "actions",
      "elements": [
        {
          type: "button",
          style: "primary",
          text: {
            type: "plain_text",
            text: linkText,
            emoji: true
          },
          url: fullUrl
        }
      ]
    }
  }

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

  static wrapBlocks(blocks): ISlackSection {
    const blob: ISlackSection = {
      // text: this.data.examine,
      attachments: [
        {
          blocks
        }
      ]
    }
    return blob
  }

  // handle different types of output transparently
  static async flexOutput(msg, context) {
    if (typeof (msg) === 'string') {
      await context.sendText(msg)
    } else if (Array.isArray(msg)) {
      msg.map(m => context.sendText(m))
    } else {
      await context.chat.postMessage(msg)
    }
  }

  static async sendList(list, context) {
    const msg = list.join('\n')
    await context.sendText(msg)
  }

  // NOT used? done in Pal now
  static async sendText(text, context) {
    if (!context) {
      throw ('no context passed to .sendText')
    }
    if (!text) {
      throw ('sendText but no text')
    }
    await context.sendText(text)
  }

  static async itemCard(stateInfo: StateBlock, thing: GameObject) {
    let blocks: any[] = []
    if (stateInfo.imageUrl) {
      blocks.push(this.imageBlock(stateInfo, thing))
    }
    const text = stateInfo.long || stateInfo.short
    if (text) {
      blocks.push(this.textBlock(text))
    }
    if (stateInfo.buttons) {
      const buttonsBlock = this.buttonsBlock(stateInfo.buttons)
      blocks.push(buttonsBlock)
    }
    return blocks
  }

  static navbar(_version) {
    const items = [
      'look|look|👀',
      'item|item|🧰',
      'task|task|📕',
      'help|help|❓'
    ]
    // const block = this.wrapActionsInBlock(buttonElements)
    // return block

    const block = this.buttonsBlock(items)
    return (block)
  }


}

export { BaseBuilder }
