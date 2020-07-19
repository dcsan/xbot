const fs = require('fs')
const path = require('path')

// const posTagger = require('wink-pos-tagger');
const AppConfig = require('../lib/AppConfig')
const Util = require('../lib/Util')
const Logger = require('../lib/Logger')
const SlackAdapter = require('../lib/adapters/SlackAdapter')

const { Story } = require('./Story')
const { Player } = require('./Player')

const Menu = require('./Menu')
const menu = new Menu()

// const tagger = posTagger()


class Game {

  constructor(sid) {
    this.sid = sid
    this.menu = new Menu()
    this.story = new Story(this)
    this.player = new Player()
    this.init()
    // Logger.log('new game', { player: this.player })
  }

  init (context) {
    this.loadStory({storyName: null, context: null}) // needs params
    this.loadHelp()

    this.story.reset()
    this.player.reset()

    Logger.logObj('game.init', {
      storyName: this.storyName,
      sid: this.sid,
      player: this.player,
    })
    Logger.log('room', { room: this.story.room.name })
    if (context) {
      context.sendText("reset game! " + this.storyName )
    }
  }

  // TODO can merge with init?
  async restart (context) {
    this.init()
    await this.story.restart(context)
    await this.help(context)
  }

  /**
   * specify a story to reload
   * for testing other material
   * @param {*} param0
   */
  loadStory ({ storyName, context }) {
    if (storyName) {
      // load an explicit story from params
      this.storyName = storyName
    } else {
      // reload default config
      storyName = AppConfig.read('STORYNAME')
      this.storyName = storyName
    }
    this.story.load({ storyName, context })
    if (context) {
      context.sendText('loaded!' + storyName)
    }
  }

  /**
   * simple reload of current story without resetting user vars
   * for when you change the YAML
   * @param {*} context
   */
  reload (context) {
    this.story.load({storyName: this.storyName, context})
  }

  loadHelp (storyName) {
    const filepath = path.join(__dirname, '../data/help.txt')
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

  // async actions (
  //   context,
  //   {
  //     match: {
  //       groups: { action, item },
  //     },
  //   }
  // ) {
  //   Logger.logObj('actions: ', item)
  //   // await context.sendText(`trying ${action} on ${item} ...`)
  //   await this.story.room.runActions(action, item, this.player, context)
  // }

  async handleSlack (context) {
    // Logger.logObj('slack.any', context)
    // if (context.chat)
    Logger.logObj('rawEvent', context.event.rawEvent)
    Logger.logObj('event.type', context.event.type)
    Logger.logObj('event.subtype', context.event.subtype)
    Logger.logObj('event.action', context.event.action)
    Logger.logObj('event.command', context.event.command)

    if (context.event.action) {
      Logger.logObj('.action:', context.event.action.value)
      context.sendText(`event.action: ${context.event.action.value}`)
    } else if (context.event.command) {
      const commandText = context.event.command
      Logger.logObj('commandText:', commandText)
      this.story.runCommand(commandText, context)
      // context.chat.postMessage(result)
      // context.sendText(`other event ${context.event.type}`)
    } else {
      Logger.logObj('unknown slack event:', context.event)
    }
  }

  async welcome (context) {
    Logger.logObj('context', context)
    Logger.logObj('rawRvent', context.event.rawEvent)
    Logger.logObj('authed_users', context.authed_users)
    const userId = context.event?.message?.user
    Logger.logObj('userId', userId)
    context.sendText(`Welcome! ${userId}`)
  }

  async status (context) {
    await this.story.status(context)
    await this.player.inventory(context)
    await this.story.room.status(context)
    await context.sendText('state ```\n' + JSON.stringify(context.state, null, 2) + '```')
  }

  // async fallback (context) {
  //   const text = context.event.text
  //   Logger.log('fallback', text)
  //   const pos = tagger.tagSentence(text)
  //   Logger.log('pos', pos)
  // }

}

module.exports = Game
