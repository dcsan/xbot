import { BaseBuilder } from '../base/BaseBuilder'

import { MakeLogger } from "../../../lib/LogLib"
const logger = new MakeLogger('DiscordBuilder')

class DiscordBuilder extends BaseBuilder {

  // a single button: text|value|emoji
  static buttonItem(buttonLine: string) {
    let [text, value, icon] = buttonLine.split('|')
    icon = icon ? (icon).trim() : ''
    text = text.trim()
    value = (value || text).trim()
    const item = {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text,
        "emoji": true
      },
      icon, // for discord emoji
      "value": value
    }
    logger.log('buttonItem', item)
    return item
  }

  static buttonsBlock(buttons: string[]) {
    const buttonElements = buttons.map(b => this.buttonItem(b))
    const block = this.wrapActionsInBlock(buttonElements)
    return block
  }

}

export { DiscordBuilder }