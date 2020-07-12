const debug = require('debug')('mup:Item')
const Logger = require('../lib/Logger')

const SlackAdapter = require('../lib/adapters/SlackAdapter')
const GameObject = require('./GameObject')

class Item extends GameObject {

  constructor(doc, room) {
    super(doc)
    this.room = room
    this.state = this.doc.state || 'default'
  }

  async examine (context, player) {
    const stateInfo = this.doc.states.filter(s => s.name === this.state).pop()
    Logger.logObj('stateInfo', { state: this.state, stateInfo })
    Logger.log('item.examine', this.name)
    await SlackAdapter.sendItemCard(stateInfo, this, context)
  }

  get description () {
    return this.doc.text || this.doc.description || this.doc.name
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

  async itemActions (actionName, player, context) {
    debug('itemActions', actionName, 'on', this.name)
    let foundAction = false
    this.doc.actions.forEach(async (actionData) => {
      let rex = new RegExp(actionData.match)
      // debug('check', actionName, actionData)
      if (actionName.match(rex)) {
        foundAction = true
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
          SlackAdapter.sendItemCard(actionData.pass, this, context)
        } else {
          debug('action fail', actionName, actionData)
          SlackAdapter.sendItemCard(actionData.fail, this, context)
        }
      }
    })
    Logger.log('foundAction', foundAction)
    return foundAction
  }

  setState (newState) {
    this.state = newState
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
