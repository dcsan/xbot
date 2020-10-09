// import fs from 'fs'
// import path from 'path'
import yaml from 'js-yaml'

// const posTagger = require('wink-pos-tagger');
// import AppConfig from '../../lib/AppConfig'
import Util from '../../lib/Util'
import { MakeLogger } from '../../lib/LogLib'
import { BaseBuilder } from '../pal/base/BaseBuilder'
import { Pal } from '../pal/base/Pal'
import Story from './Story'
import Player from './Player'
import { SceneEvent } from '../MupTypes'
import Menu from './Menu'

import { LoadOptions } from '../MupTypes'

const logger = new MakeLogger('Game')
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
    this.player = new Player({}, this.story)
    // this.reset() // async cannot be called here
  }

  // reset all the vars without reloading
  async reset(pal: Pal) {
    logger.log('game.reset')
    await this.story.reset(pal)  // resets rooms
    await this.player.reset()
    // await this.pal.sendText('reset game. now in room:' + this.story.room.name)
    // await this.story.room.enterRoom(pal)
  }

  // reload and show message
  // async restart(pal: Pal) {
  //   await this.reset(pal)
  //   // await this.story.room.enterRoom(pal)
  //   if (pal) {
  //     await pal.sendText('restarted')
  //   }
  // }

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
    await pal.sendText(`game [${this.sid}] echo!`)
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
    const help = BaseBuilder.textBlock(this.helpDoc)
    const msg = BaseBuilder.wrapBlocks([help])
    // await pal.postEphemeral(msg)
    // await pal.postMessage(msg)
    await pal.sendBlocks([msg])
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

  // async hint(pal: Pal) {
  //   // pal.postEphemeral({ text: 'Hint!' });
  //   this.story.runCommand('/hint', pal)
  // }

  async welcome(pal: Pal) {
    pal.sendText(`Welcome!`)  // FIXME - welcome player by name
  }

  // TODO add debug/admin on user check
  async showStatus(evt: SceneEvent) {
    const statusInfo = {
      story: this.story.status(),
      room: this.story.room.status(),
      player: this.player.status(),
    }
    // await pal.sendText('state ```\n' + JSON.stringify(pal.state, null, 2) + '```')
    const blob = yaml.dump(statusInfo)
    await evt.pal.sendText(Util.quoteCode(blob))
  }

  async showThingStatus(evt: SceneEvent) {
    const name = evt.pres.parsed?.groups?.thingName
    const thing = this.story.room.findThing(name)
    if (thing) {
      const blob = yaml.dump(thing.props)
      await evt.pal.sendText(Util.quoteCode(blob))
    } else {
      await evt.pal.sendText('cannot find thing:' + name)
    }
  }

}

export default Game
