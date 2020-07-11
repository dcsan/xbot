const fs = require('fs')
const path = require('path')

const Logger = require('../lib/Logger')
const SlackAdapter = require('../lib/adapters/SlackAdapter')

class Game {

  constructor() {
    const filepath = path.join(__dirname, '../data/help.txt')
    this.helpDoc = fs.readFileSync(filepath, 'utf8')
  }

  async help (context) {
    const help = SlackAdapter.textBlock(this.helpDoc)
    const msg = SlackAdapter.wrapBlocks([help])
    await context.postEphemeral(msg)
  }

}

module.exports = Game
