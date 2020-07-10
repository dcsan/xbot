const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Item {
  constructor(doc, room) {
    this.doc = doc
    this.room = room
    this.state = this.doc.state || 'default'
  }

  examine () {
    const stateInfo = this.doc.states.filter(s => s.name === this.state).pop()
    Logger.logObj('stateInfo', { state: this.state, stateInfo })

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

  runUpdates (updates, context) {
    updates.map(pair => {
      const [newState, itemName] = pair.split(' ')
      let targetItem
      if (itemName) {
        targetItem = this.room.findItemByName(itemName)
      } else {
        // defaults to this if no 2nd arg for itemName
        targetItem = this
      }
      Logger.logObj('updateStates', { targetItem, newState })
      targetItem.setState(newState)
    })
  }

  setState (newState) {
    this.state = newState
  }

  async runActions (actionName, player, context) {
    // debug('runActions', actionName, 'on', this.name, 'in', room.name)
    this.doc.actions.forEach(async (actionData) => {
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
          if (passData.updates) {
            await this.runUpdates(passData.updates, context)
          }
          SlackAdapter.sendText(actionData.pass?.text, context)
        } else {
          debug('action fail', actionName, actionData)
          SlackAdapter.sendText(actionData.fail?.text, context)
        }
      }
    })
    // debug('actionResults', actionResults)

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
