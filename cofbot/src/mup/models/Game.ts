import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// const posTagger = require('wink-pos-tagger');
import AppConfig from '../../lib/AppConfig'
import Util from '../../lib/Util'
import Logger from '../../lib/Logger'
import SlackBuilder from '../../lib/adapters/SlackBuilder'
import { Pal } from '../pal/Pal'
import Story from './Story'
import Player from './Player'
import { SceneEvent } from '../routes/RouterService'
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
  // FIXME
  async init(opts) {
    // create objects used below
    await this.story.load(opts)
    Logger.log('init game')
    this.loadHelp(opts?.storyName)
    this.reset()
  }

  reset() {
    this.story.reset()
    this.player.reset()
    this.story.room.reset()
  }

  // TODO can merge with init?
  async restart(evt: SceneEvent) {
    this.reset()
    await this.story.restart(evt.pal)
    if (evt.pal) {
      await evt.pal.sendText('restarted')
      await this.story.room.describeThing(evt)
    }
  }

  /**
   * simple reload of current story without resetting user vars
   * for when you change the YAML
   * @param {*} pal
   */
  reload(pal: Pal) {
    // @ts-ignore
    this.story.load({ storyName: this.story.name, pal })
  }

  loadHelp(_storyName) {
    const filepath = path.join(__dirname, '../../data/help.txt')
    this.helpDoc = fs.readFileSync(filepath, 'utf8')
  }

  async echo(pal: Pal) {
    await pal.sendText(`game [${ this.sid }] echo!`)
  }

  // any items for testing
  async initState() {
    this.player.addItem('combination')
  }

  async help(pal: Pal) {
    await menu.help(pal)
  }

  async moreHelp(pal: Pal) {
    const help = SlackBuilder.textBlock(this.helpDoc)
    const msg = SlackBuilder.wrapBlocks([help])
    // await pal.postEphemeral(msg)
    await pal.postMessage(msg)
  }

  async SayTest(pal: Pal) {
    await pal.sendText('Testing OK!')
  }

  // async look(pal: Pal) {
  //   await this.story.look(pal)
  // }

  async delay(pal: Pal) {
    await pal.postMessage("wait...")
    await Util.sleep(5000)
    await pal.postMessage("... done")
  }

  // async things(pal: Pal) {
  //   const msg = this.story.things(pal)
  //   await pal.sendText(msg)
  // }

  async inventory(pal: Pal) {
    await this.player.inventory(pal)
  }

  async hint(pal: Pal) {
    // pal.postEphemeral({ text: 'Hint!' });
    this.story.runCommand('/hint', pal)
  }

  async welcome(pal: Pal) {
    pal.sendText(`Welcome!`)  // FIXME - welcome player by name
  }

  // TODO add debug/admin on user check
  async status(pal: Pal) {
    const statusInfo = {
      story: await this.story.status(),
      room: await this.story.room.status(),
      inventory: await this.player.status(),
    }
    // await pal.sendText('state ```\n' + JSON.stringify(pal.state, null, 2) + '```')
    const blob = yaml.dump(statusInfo)
    await pal.sendText(Util.quoteCode(blob))
  }

}

export default Game
