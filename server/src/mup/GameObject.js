const SlackAdapter = require('../lib/adapters/SlackAdapter')
const Logger = require('../lib/Logger')

class GameObject {

  constructor(doc, room) {
    this.doc = doc
    this.room = room
    this.state = this.doc.state || 'default'
  }

  async examine (parsed, context, player) {
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

  get articleName () {
    return `a ${this.formalName}`
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
  async runActions (parsed, context, player) {
    Logger.log('runActions', parsed, 'on', this.cname)
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
        targetItem = this.room.findItem(itemName)
      } else {
        // defaults to this if no 2nd arg for itemName
        targetItem = this
      }
      // targetItem,
      Logger.logObj('updateStates', {newState })
      targetItem.setState(newState)
    })
  }

}

module.exports = GameObject
