const SlackAdapter = require('../lib/adapters/SlackAdapter')
const Logger = require('../lib/Logger')

const log = console.log

class GameObject {

  constructor(doc, room) {
    this.doc = doc
    this.room = room
    this.reset()
  }

  reset () {
    // FIXme - check if that state exists
    if (!this.doc.states) {
      Logger.warn('no states for object:', this.cname)
    }
    this.state = this.doc.state || this.doc.states[0].name || 'default'
  }

  // FIXME - dont use both
  get name () {
    return this.formalName
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

  get player () {
    // not sure about this reaching back up the tree...
    return this.room.story.game.player
  }

  get stateInfo () {
    const info = this.doc.states.filter(s => s.name === this.state).pop() ||
      this.doc.states[0]
    return info
  }

  get description () {
    return this.short
  }

  get short () {
    const info = this.stateInfo
    return info.short || info.long || this.doc.description || this.formalName
  }

  setState (newState) {
    this.state = newState
  }

  isNamed (text) {
    // todo - allow synonyms
    return this.cname.match(text)
  }

  // add 'the' or 'an' based on item article
  get articleName () {
    return `a ${this.formalName}`
  }

  async examine (parsed, context, player) {
    const stateInfo = this.stateInfo
    // Logger.logObj('stateInfo', { state: this.state, stateInfo })
    // Logger.log('item.examine', this.cname)
    await SlackAdapter.sendItemCard(stateInfo, this, context)
  }

  // /**
  //  * special actions defined on the doc
  //  *
  //  * @param {*} actionName
  //  * @param {*} player
  //  * @param {*} context
  //  * @returns
  //  * @memberof GameObject
  //  */
  // async runActions (parsed, context, player) {
  //   Logger.log('runActions', parsed, 'on', this.cname)
  //   let foundAction = false
  //   this.doc.actions?.forEach(async (actionData) => {
  //     let rex = new RegExp(actionData.match)
  //     // Logger.log('check', actionName, actionData)
  //     if (actionName.match(rex)) {
  //       foundAction = true
  //       const needs = actionData.needs
  //       if (!needs || player.hasItem(needs)) {
  //         // success!
  //         const passData = actionData.pass
  //         Logger.log('action passed', passData)
  //         if (passData.gets) {
  //           player.addItemByName(actionData.pass.gets)
  //         }
  //         if (passData.updates) {
  //           await this.runUpdates(passData.updates, context)
  //         }
  //         SlackAdapter.sendItemCard(actionData.pass, this, context)
  //       } else {
  //         Logger.log('action fail', actionName, actionData)
  //         SlackAdapter.sendItemCard(actionData.fail, this, context)
  //       }
  //     }
  //   })
  //   Logger.log('foundAction', foundAction)
  //   return foundAction
  // }

  /**
   * returns true|false if an action was found/matched
   * NOT if it passed/failed (fail is still run/replied to)
   *
   * @param {*} { actionName, itemName, modifier }
   * @param {*} context
   * @returns
   * @memberof GameObject
   */
  async tryAction ({ actionName, itemName, modifier }, context) {
    for (const actionData of this.doc.actions) {
    // this.doc.actions?.forEach(async (actionData) => {
      const fullAction = `${actionName} ${modifier}`
      let rex = new RegExp(actionData.match)
      // Logger.log('check', actionName, actionData)
      if (fullAction.match(rex)) {
        Logger.log('action match', actionName)
        this.runAction(actionData, context)
        return true
      }
    }
    return false
  }

  async runAction (actionData, context) {
    const player = this.player

    if (actionData.reply) await context.sendText(actionData.reply)

    const needs = actionData.needs
    if (!needs || player.hasItem(needs)) {
      // success!
      const passData = actionData.pass
      Logger.log('action passed', passData)
      if (passData.gets) player.addItemByName(actionData.pass.gets)
      if (passData.setStates) await this.updateStates(passData.setStates, context)
      SlackAdapter.sendItemCard(actionData.pass, this, context)

    } else {
      // fail
      Logger.log('action fail', actionData.name, actionData)
      SlackAdapter.sendItemCard(actionData.fail, this, context)
    }

  }

  updateStates (updates, context) {
    updates.map(pair => {
      const [newState, itemName] = pair.split(' ')
      let targetItem
      if (itemName) {
        targetItem = this.room.findItem(itemName)
      } else {
        // defaults to this if no 2nd arg for itemName
        targetItem = this
      }
      if (!targetItem) {
        Logger.error('cannot find targetItem for updateStates', itemName)
      }
      // targetItem,
      // log('updateStates', {newState })
      targetItem.setState(newState)
    })
  }

}

module.exports = GameObject
