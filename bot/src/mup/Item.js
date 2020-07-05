const debug = require('debug')('mup:Item')

class Item {
  constructor(data) {
    this.data = data
  }

  inspect() {
    return this.data.inspect
  }

  look() {
    // debug(`look name: ${this.data.name} , data =>`, this.data)
    return this.inspect()
  }

  runActions(actionName, player, room) {
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

  get name() {
    return this.data.name.toLowerCase()
  }

  isNamed(text) {
    // todo - allow synonyms
    return this.name.match(text)
  }
}

module.exports = Item
