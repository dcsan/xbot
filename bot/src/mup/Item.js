const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

class Item {
  constructor(data) {
    this.data = data
  }

  examine () {

    let blocks = []

    if (this.data.image) {
      const img = {
        "type": "image",
        "image_url": this.data.image,
        // title: {
        //   type: 'plain_text',
        //   text: this.data.examine
        // },
        "alt_text": this.description
      }
      blocks.push(img)
    }

    const desc = {
      "type": "section",
      "block_id": "section567",
      "text": {
        "type": "mrkdwn",
        "text": this.description
      }
    }
    blocks.push(desc)

    const blob = {
      // text: this.data.examine,
      attachments: [
        {
          blocks
        }
      ]
    }

    Logger.logObj('examine=>', blob)
    return blob
  }

  get description () {
    return this.data.examine || this.data.description || this.data.name
  }

  look () {
    // debug(`look name: ${this.data.name} , data =>`, this.data)
    return this.examine()
  }

  runActions (actionName, player, room) {
    // debug('runActions', actionName, 'on', this.name, 'in', room.name)
    const actionResults = this.data.actions.map((actionData) => {
      let rex = new RegExp(actionData.match)
      // debug('check', actionName, actionData)
      if (actionName.match(rex)) {
        const needs = actionData.needs
        if (!needs || player.hasItem(needs)) {
          // success!
          debug('action passed', actionData)
          if (actionData.pass?.gets) {
            player.addItemByName(actionData.pass.gets)
          }
          return (actionData.pass?.text)
        } else {
          debug('action fail', actionName, actionData)
          return (actionData.fail?.text)
        }
      }
    })
    // debug('actionResults', actionResults)
    return actionResults
  }

  get name () {
    return this.data.name.toLowerCase()
  }

  isNamed (text) {
    // todo - allow synonyms
    return this.name.match(text)
  }
}

module.exports = Item
