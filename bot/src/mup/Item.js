const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Item {
  constructor(doc) {
    this.doc = doc
    this.state = this.doc.state || 'default'
  }

  examine () {
    const stateInfo = this.doc.states.filter(s => s.name === this.state).pop()
    Logger.logObj('stateInfo', {state: this.state, stateInfo})

    let blocks = []

    if (!stateInfo) {
      blocks.push(SlackAdapter.textBlock(this.description))
    } else {
      blocks.push(SlackAdapter.textBlock(stateInfo.examine))

      if (stateInfo.image) {
        const img = {
          "type": "image",
          "image_url": stateInfo.image,
          // title: {
          //   type: 'plain_text',
          //   text: this.doc.examine
          // },
          "alt_text": this.description
        }
        blocks.push(img)
      }
    }

    const blob = SlackAdapter.wrapBlocks(blocks)

    // const desc = {
    //   "type": "section",
    //   "block_id": "section567",
    //   "text": {
    //     "type": "mrkdwn",
    //     "text": this.description
    //   }
    // }
    // blocks.push(desc)

    // const blob = {
    //   // text: this.doc.examine,
    //   attachments: [
    //     {
    //       blocks
    //     }
    //   ]
    // }

    Logger.logObj('examine=>', blob)
    return blob
  }

  get description () {
    return this.doc.examine || this.doc.description || this.doc.name
  }

  look () {
    // debug(`look name: ${this.doc.name} , doc =>`, this.doc)
    return this.examine()
  }

  runActions (actionName, player, room) {
    // debug('runActions', actionName, 'on', this.name, 'in', room.name)
    const actionResults = this.doc.actions.map((actionData) => {
      let rex = new RegExp(actionData.match)
      // debug('check', actionName, actionData)
      if (actionName.match(rex)) {
        const needs = actionData.needs
        if (!needs || player.hasItem(needs)) {
          // success!
          const passData = actionData.pass
          debug('action passed', passData)
          if (passData.gets) {
            player.addItemByName(actionData.pass.gets)
          }
          if (passData.setStates) {
            passData.setStates.map(pair => {
              const [item, newState] = pair
              Logger.log('would set', {item, newState})
            })
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
    return this.doc.name.toLowerCase()
  }

  isNamed (text) {
    // todo - allow synonyms
    return this.name.match(text)
  }
}

module.exports = Item
