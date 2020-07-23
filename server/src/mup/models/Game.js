const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

// const posTagger = require('wink-pos-tagger');
const AppConfig = require('../../lib/AppConfig')
const Util = require('../../lib/Util')
const Logger = require('../../lib/Logger')
const SlackAdapter = require('../../lib/adapters/SlackAdapter')

const { Story } = require('./Story')
const { Player } = require('./Player')

const Menu = require('./Menu')
const menu = new Menu()

// const tagger = posTagger()



class Game {

  constructor(sid, storyName = null) {
    this.sid = sid
  }

  // not done in constructor as it is async
  async init (opts) {
    // create objects used below
    this.menu = new Menu()
    this.story = new Story(this)
    this.player = new Player()

    await this.story.load(opts)

    this.loadHelp()
    this.reset()
    if (opts?.context) {
      opts.context.sendText("reset game! ")
    }
  }

  reset (context) {
    this.story.reset(context)
    this.player.reset()
    this.story.room.reset()
  }

  // TODO can merge with init?
  async restart (context) {
    this.init({ context })
    await this.story.restart(context)
    if (context) {
      await context.sendText('restarted')
    }
  }

  /**
   * simple reload of current story without resetting user vars
   * for when you change the YAML
   * @param {*} context
   */
  reload (context) {
    // @ts-ignore
    this.story.load({storyName: this.story.name, context})
  }

  loadHelp (storyName) {
    const filepath = path.join(__dirname, '../../data/help.txt')
    this.helpDoc = fs.readFileSync(filepath, 'utf8')
  }

  async echo (context) {
    await context.sendText(`game [${this.sid}] echo!`)
  }

  // any items for testing
  async initState () {
    this.player.addItem('combination')
  }

  async help (context) {
    await menu.help(context)
  }

  async moreHelp (context) {
    const help = SlackAdapter.textBlock(this.helpDoc)
    const msg = SlackAdapter.wrapBlocks([help])
    // await context.postEphemeral(msg)
    await context.chat.postMessage(msg)
  }

  async SayTest (context) {
    await context.sendText('Testing OK!')
  }

  async look (context) {
    await this.story.look(context)
  }

  async delay (context) {
    await context.postMessage("wait...")
    await Util.sleep(5000)
    await context.postMessage("... done")
  }

  async things (context) {
    const msg = this.story.things(context)
    await context.sendText(msg)
  }

  async inventory (context) {
    await this.player.inventory(context)
  }

  async hint (context) {
    // context.postEphemeral({ text: 'Hint!' });
    this.story.runCommand('/hint', context)
  }

  async welcome (context) {
    Logger.logObj('context', context)
    Logger.logObj('rawRvent', context.event.rawEvent)
    Logger.logObj('authed_users', context.authed_users)
    const userId = context.event?.message?.user
    Logger.logObj('userId', userId)
    context.sendText(`Welcome! ${userId}`)
  }

  // TODO add debug/admin on user check
  async status (context) {
    const statusInfo = {
      story: await this.story.status(),
      room: await this.story.room.status(),
      inventory: await this.player.status(),
    }
    // await context.sendText('state ```\n' + JSON.stringify(context.state, null, 2) + '```')
    const blob = yaml.dump(statusInfo)
    await context.sendText(Util.quoteCode(blob))
  }

}

module.exports = Game
