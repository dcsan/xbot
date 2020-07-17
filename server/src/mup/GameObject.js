const SlackAdapter = require('../lib/adapters/SlackAdapter')
const Logger = require('../lib/Logger')

class GameObject {

  constructor(doc, room) {
    this.doc = doc
    this.room = room
    this.state = this.doc.state || 'default'
  }

  async examine (context, player) {
    const stateInfo = this.doc.states.filter(s => s.name === this.state).pop()
    Logger.logObj('stateInfo', { state: this.state, stateInfo })
    Logger.log('item.examine', this.cname)
    await SlackAdapter.sendItemCard(stateInfo, this, context)
  }

  // for searching and comparison DB keys
  get cname () {
    return this.doc.name.toLowerCase()
  }

  // not lowercase
  get formalName () {
    let s = this.doc.name
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  setState (newState) {
    this.state = newState
  }

  isNamed (text) {
    // todo - allow synonyms
    return this.cname.match(text)
  }

  /**
   * special actions defined on the doc
   *
   * @param {*} actionName
   * @param {*} player
   * @param {*} context
   * @returns
   * @memberof GameObject
   */
  async itemActions (actionName, player, context) {
    Logger.log('itemActions', actionName, 'on', this.name)
    let foundAction = false
    this.doc.actions?.forEach(async (actionData) => {
      let rex = new RegExp(actionData.match)
      // Logger.log('check', actionName, actionData)
      if (actionName.match(rex)) {
        foundAction = true
        const needs = actionData.needs
        if (!needs || player.hasItem(needs)) {
          // success!
          const passData = actionData.pass
          Logger.log('action passed', passData)
          if (passData.gets) {
            player.addItemByName(actionData.pass.gets)
          }
          if (passData.updates) {
            await this.runUpdates(passData.updates, context)
          }
          SlackAdapter.sendItemCard(actionData.pass, this, context)
        } else {
          Logger.log('action fail', actionName, actionData)
          SlackAdapter.sendItemCard(actionData.fail, this, context)
        }
      }
    })
    Logger.log('foundAction', foundAction)
    return foundAction
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

}

module.exports = GameObject
