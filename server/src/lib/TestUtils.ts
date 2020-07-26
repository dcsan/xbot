import AppConfig from './AppConfig'
import Room from '../mup/models/Room'
import Game from '../mup/models/Game'
import { GameManager } from '../mup/models/GameManager'
import { Pal, MockChannel } from '../mup/pal/Pal'
import { LoadOptions } from '../mup/MupTypes'
const log = console.log

interface TestEnv {
  game: Game
  pal: Pal
}

function getMockPal(): Pal {
  const mockChannel = new MockChannel('testMockSession1234')
  const pal = new Pal(mockChannel)
  return pal
}

async function createTestEnv(): Promise<TestEnv> {
  const pal = getMockPal()
  const opts: LoadOptions = {
    pal,
    storyName: 'office'
  }
  const game: Game = await GameManager.findGame(opts)
  game.reset()
  return { game, pal }
}

// add to process when this is included
process.on('unhandledRejection', reason => {
  console.log('stopped', reason)
  throw reason
})

export { createTestEnv, TestEnv, getMockPal }


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
