// import fs from 'fs'
// import path from 'path'
import yaml from 'js-yaml'

// const posTagger = require('wink-pos-tagger');
import AppConfig from '../../lib/AppConfig'
import Util from '../../lib/Util'
import Logger from '../../lib/Logger'
import SlackBuilder from '../pal/SlackBuilder'
import { Pal } from '../pal/Pal'
import Story from './Story'
import Player from './Player'
import { SceneEvent } from '../MupTypes'
import Menu from './Menu'

import { LoadOptions } from '../MupTypes'
// const tagger = posTagger()

const menu = new Menu()

class Game {

  sid: string   // session id
  menu: Menu
  story: Story
  player: Player
  helpDoc: any    // FIXME
  pal: Pal

  constructor(opts: LoadOptions) {
    this.pal = opts.pal
    this.sid = opts.pal.sessionId
    this.menu = new Menu()
    this.story = new Story(opts, this)
    this.player = new Player()
    this.reset()
  }

  // reset all the vars without reloading
  reset() {
    Logger.log('game.reset')
    this.story.reset()
    this.player.reset()
    this.story.room.reset()
  }

  // reload and show message
  async restart(evt: SceneEvent) {
    this.reset()
    await this.story.currentRoom.enter(evt)
    if (evt.pal) {
      await evt.pal.sendText('restarted')
    }
  }

  /**
   * simple reload of current story without resetting user vars
   * for when you change the YAML
   * @param {*} pal
   */
  reload(evt: SceneEvent) {
    // @ts-ignore
    this.story.load({ evt }) // with null = reload
  }

  async echo(pal: Pal) {
    await pal.sendText(`game [${ this.sid }] echo!`)
  }

  // any items for testing
  async initState() {
    // TODO scores etc.
    // this.player.addItem('combination')
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
