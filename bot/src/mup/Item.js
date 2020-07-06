const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

class Item {
  constructor(data) {
    this.data = data
  }

  inspect () {

    // let blocks = [
    //   {
    //     "type": "section",
    //     "block_id": "section567",
    //     "text": {
    //       "type": "mrkdwn",
    //       "text": this.data.inspect
    //     },
    //   },
    // ]

    let blocks = []

    if (this.data.image) {
      const img = {
        "type": "image",
        "image_url": this.data.image,
        // title: {
        //   type: 'plain_text',
        //   text: this.data.inspect
        // },
        "alt_text": "Haunted hotel image"
      }
      blocks.push(img)
    }

    const desc = {
      "type": "section",
      "block_id": "section567",
      "text": {
        "type": "mrkdwn",
        "text": this.data.inspect || this.data.description || this.data.name
      }
    }
    blocks.push(desc)

    const blob = {
      // text: this.data.inspect,
      attachments: [
        {
          blocks
        }
      ]
    }

    Logger.logObj('inspect=>', blob)
    return blob
  }

  look () {
    // debug(`look name: ${this.data.name} , data =>`, this.data)
    return this.inspect()
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
