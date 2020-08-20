import chalk from 'chalk'
const mongoose = require('mongoose');

// import AppConfig from './AppConfig'
// import Room from '../mup/models/Room'
import Game from '../mup/models/Game'
import { GameManager } from '../mup/models/GameManager'
import { Pal, MockChannel } from '../mup/pal/Pal'
import { LoadOptions } from '../mup/MupTypes'
import { RexParser } from '../mup/parser/RexParser'
import { SceneEvent, StoryTest } from '../mup/MupTypes'
// import { GameObject } from '../mup/models/GameObject'
import { MakeLogger } from './LogLib'
import BotRouter from '../mup/routing/BotRouter'
import { DbConfig } from '../mup/core/DbConfig'
const logger = new MakeLogger('testUtils')

import { ChatRowModel } from '../mup/pal/ChatLogger'

// show output during tests for "PASS" not juts fail
// const logAll = true
const logAll = false

class TestEnv {
  pal: Pal
  game!: Game   // force to assume we've always done an async loadGame
  ready: boolean
  dbConn: any

  constructor() {
    this.pal = this.getMockPal()
    this.ready = false
    this.dbConn = {}
  }

  async init() {
    if (this.ready) return
    this.dbConn = await DbConfig.init()
    this.ready = true
  }

  async close() {
    await DbConfig.close()
  }

  async initStory(story: string = 'office', room: string = 'lobby') {
    await this.init()
    const game = await this.loadGame(story)
    await game.story.gotoRoom(room)
  }

  async resetChatLogs() {
    if (!this.ready) {
      console.warn('was not ready  @resetChatLogs')
      await this.init()
    }
    await ChatRowModel.deleteMany({}) // all
  }

  async removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections)
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName]
      await collection.deleteMany()
    }
  }

  async loadGame(storyName = 'office'): Promise<Game> {
    if (!this.ready) {
      // console.log('was not ready @loadGame')
      await this.init()
    }
    const opts: LoadOptions = {
      pal: this.pal,
      storyName
    }
    const game: Game = await GameManager.findGame(opts)
    // FIXME - not needed for a new game, but no way to tell if its new....
    // so it gets fired twice on new games and tests
    await game.reset()
    this.game = game
    return game
  }

  getMockPal(): Pal {
    const mockChannel = new MockChannel('testMockSession1234')
    const pal = new Pal(mockChannel)
    return pal
  }

  makeSceneEvent(input: string): SceneEvent {
    const pres = RexParser.parseCommands(input)
    if (!this.game) {
      logger.warn('try to create sceneEvent without a .game')
    }
    const evt: SceneEvent = {
      pal: this.pal,
      game: this.game!,
      pres
    }
    return evt
  }

  // goes through the full botRouter
  async getReply(input: string) {
    const evt = this.makeSceneEvent(input)
    const output = await BotRouter.anyEvent(evt.pal, input)
    // return output
    return this.pal.chatLogger.tailText(3)
  }

  // check tail of logs in text format
  // tailCount to just check the last response
  // but usually we check last 2 or 3 to include images, buttons etc, in same reply
  async checkResponse(oneTest: StoryTest, roomName = 'room') {
    const { input, output, lines = 4 } = oneTest
    // logger.logLine(`\n----- ${input}`)
    await BotRouter.anyEvent(this.pal, input, 'text')
    // const actual = this.pal.lastOutput()
    const rex = new RegExp(output, 'im')
    const logTail: string[] = this.pal.chatLogger.tail(lines)

    // search for any line to match
    let foundLine = false
    for (const line of logTail) {
      if (rex.test(line.trim())) {
        foundLine = true
        break
      }
    }
    if (!foundLine) {
      const errorMsg = (
        chalk.white.bgRed.bold('\n\n---- FAILED response:') +
        `\n   room:\t` + roomName +
        `\n  input:\t` + input +
        '\n expect:\t' + rex +
        '\nactuals:\t' + logTail.join(' / ') +
        // '\n actual:\t' + JSON.stringify(logTail, null, 2) +
        '\n\n'
      )
      logger.logLine(errorMsg)
    } else {
      if (logAll) {
        const msg = '--- OK: ' + input
        const line = msg.padEnd(20, ' ')
        logger.logLine(chalk.grey(line, ' => ' + output))
      }
    }

    // @ts-ignore
    if (oneTest.checks) {
      const room = this.game?.story.room.roomObj
      // test conditionals
      for (const line of oneTest.checks) {
        const testOk = room?.checkOneCondition(line)
        if (!testOk) {
          logger.logLine(
            chalk.white.bgRed.bold('FAIL'),
            `@ ${input} => ${line}`
          )
        } else {
          if (logAll) logger.logLine(chalk.grey('passed item.check ' + line))
        }
      }
    }

    return foundLine
  }

}

export { TestEnv }
