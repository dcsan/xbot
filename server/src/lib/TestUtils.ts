import chalk from 'chalk'

import AppConfig from './AppConfig'
// import Room from '../mup/models/Room'
import Game from '../mup/models/Game'
import { GameManager } from '../mup/models/GameManager'
import { Pal, MockChannel } from '../mup/pal/Pal'
import { LoadOptions } from '../mup/MupTypes'
import { RexParser } from '../mup/routes/RexParser'
import { SceneEvent, StoryTest } from '../mup/MupTypes'
import { GameObject } from '../mup/models/GameObject'
import { Logger } from '../lib/Logger'
import BotRouter from '../mup/routes/BotRouter'

const log = console.log

// interface TestEnv {
//   game?: Game | Undefined
//   pal: Pal
// }
// interface SceneOptions {
//   roomName?: string
// }



class TestEnv {
  pal: Pal
  game?: Game

  constructor() {
    this.pal = this.getMockPal()
  }

  async loadGame(storyName = 'office'): Promise<Game> {
    const opts: LoadOptions = {
      pal: this.pal,
      storyName
    }
    const game: Game = await GameManager.findGame(opts)
    // FIXME - not needed for a new game, but no way to tell if its new....
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
      Logger.warn('try to create sceneEvent without a .game')
    }
    const evt: SceneEvent = {
      pal: this.pal,
      game: this.game,
      pres
    }
    return evt
  }

  // check tail of logs in text format
  // tailCount to just check the last response
  // but usually we check last 2 or 3 to include images, buttons etc, in same reply
  async checkResponse(oneTest: StoryTest, roomName = 'room') {
    const { input, output, lines = 2 } = oneTest
    await BotRouter.anyEvent(this.pal, input, 'text')
    // const actual = this.pal.lastOutput()
    const rex = new RegExp(output, 'im')
    const logTail: string[] = this.pal.tailLogs(lines)

    let ok = false

    // @ts-ignore
    if (oneTest.checks) {
      const room = this.game?.story.currentRoom.roomObj
      // test conditionals
      oneTest.checks.map(line => {
        const testOk = room?.checkOneCondition(line)
        if (!testOk) {
          Logger.writeLine(
            chalk.white.bgRed.bold('FAILED '), line
          )
        } else {
          Logger.writeLine(chalk.grey('passed item.check ' + line))
        }
      })
    }

    for (const line of logTail) {
      if (rex.test(line.trim())) {
        ok = true
        break
      }
    }
    if (!ok) {
      const msg = (
        chalk.black.bgYellow.bold('\n\n---- FAILED response:') +
        `\n   room:\t` + roomName +
        `\n  input:\t` + input +
        '\n expect:\t' + rex +
        '\nactuals:\t' + logTail.join(' / ') +
        // '\n actual:\t' + JSON.stringify(logTail, null, 2) +
        '\n\n'
      )
      process.stdout.write(msg)
      return false
    }
    return true
  }

}

export { TestEnv }
