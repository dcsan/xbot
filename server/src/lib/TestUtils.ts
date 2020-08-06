import AppConfig from './AppConfig'
import Room from '../mup/models/Room'
import Game from '../mup/models/Game'
import { GameManager } from '../mup/models/GameManager'
import { Pal, MockChannel } from '../mup/pal/Pal'
import { LoadOptions } from '../mup/MupTypes'
import { RexParser } from '../mup/routes/RexParser'
import { SceneEvent } from '../mup/MupTypes'
import { Logger } from '../lib/Logger'

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

}



export { TestEnv }


// class chatReceiver {
//   msg: any

//   postMessage(msg) {
//     // log('spy=>chat.postMessage', JSON.stringify(msg, null, 2))
//     this.msg = msg
//   }
// }

// interface SessionId {
//   id?: string
// }

// class DummyContext {
//   event: any
//   sent: any
//   chat: any
//   session: SessionId

//   constructor() {
//     this.reset()
//     this.session = {}
//     this.event = {}
//   }

//   get received() {
//     return {
//       text: this.sent.text,
//       list: this.sent.list,
//       posted: this.chat.msg
//     }
//   }

//   // check full list
//   hasText(text) {
//     return (this.allText.includes(text))
//   }

//   get allText() {
//     return this.sent.list.join('\n')
//   }

//   flatBlocks() {
//     const allBlocks = this.chat.msg.attachments.map(att => {
//       return att.blocks
//     })
//     return allBlocks.flat(3)
//   }

//   reset() {
//     this.sent = {
//       list: [],
//       text: undefined,
//       msg: undefined
//     }
//     this.session = {
//       id: '1234'
//     }
//     this.event = {}
//     this.chat = new chatReceiver()
//   }

//   sendText(text) {
//     this.sent.text = text
//     this.sent.list.push(text)
//   }

//   setInput(text) {
//     this.event = { text }
//   }

// }

// const context = new DummyContext()

// const TestUtils = {
//   context,

//   getBlock(context, idx) {
//     log('context', context)
//     const atts = context.attachments
//     const block = atts[0].blocks[idx]
//     return block
//   }
// }
