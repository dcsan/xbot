import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// const posTagger = require('wink-pos-tagger');
import AppConfig from '../../lib/AppConfig'
import Util from '../../lib/Util'
import Logger from '../../lib/Logger'
import SlackAdapter from '../../lib/adapters/SlackAdapter'

import Story from './Story'
import Player from './Player'

import Menu from './Menu'
const menu = new Menu()

// const tagger = posTagger()

class Game {

  sid: string   // session id
  menu: Menu
  story: Story
  player: Player
  helpDoc: any    // FIXME

  constructor(sid, _storyName = null) {
    this.sid = sid
    this.menu = new Menu()
    this.story = new Story(this)
    this.player = new Player()

  }

  // not done in constructor as it is async
  async init(opts) {
    // create objects used below

    await this.story.load(opts)

    this.loadHelp(opts.storyName)
    this.reset()
    if (opts?.context) {
      opts.context.sendText("reset game! ")
    }
  }

  reset() {
    this.story.reset()
    this.player.reset()
    this.story.room.reset()
  }

  // TODO can merge with init?
  async restart(context) {
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
  reload(context) {
    // @ts-ignore
    this.story.load({ storyName: this.story.name, context })
  }

  loadHelp(_storyName) {
    const filepath = path.join(__dirname, '../../data/help.txt')
    this.helpDoc = fs.readFileSync(filepath, 'utf8')
  }

  async echo(context) {
    await context.sendText(`game [${ this.sid }] echo!`)
  }

  // any items for testing
  async initState() {
    this.player.addItem('combination')
  }

  async help(context) {
    await menu.help(context)
  }

  async moreHelp(context) {
    const help = SlackAdapter.textBlock(this.helpDoc)
    const msg = SlackAdapter.wrapBlocks([help])
    // await context.postEphemeral(msg)
    await context.chat.postMessage(msg)
  }

  async SayTest(context) {
    await context.sendText('Testing OK!')
  }

  // async look(context) {
  //   await this.story.look(context)
  // }

  async delay(context) {
    await context.postMessage("wait...")
    await Util.sleep(5000)
    await context.postMessage("... done")
  }

  async things(context) {
    const msg = this.story.things(context)
    await context.sendText(msg)
  }

  async inventory(context) {
    await this.player.inventory(context)
  }

  async hint(context) {
    // context.postEphemeral({ text: 'Hint!' });
    this.story.runCommand('/hint', context)
  }

  async welcome(context) {
    Logger.logObj('context', context)
    Logger.logObj('rawRvent', context.event.rawEvent)
    Logger.logObj('authed_users', context.authed_users)
    const userId = context.event?.message?.user
    Logger.logObj('userId', userId)
    context.sendText(`Welcome! ${ userId }`)
  }

  // TODO add debug/admin on user check
  async status(context) {
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

export default Game
