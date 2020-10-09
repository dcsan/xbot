import { BaseBuilder } from '../base/BaseBuilder'

class SlackBuilder extends BaseBuilder {

  // a single button: text|value|emoji
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

}

export { SlackBuilder }