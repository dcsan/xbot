const AppConfig = require('./AppConfig')
AppConfig.init()

const log = console.log

class chatReceiver {
  postMessage (msg) {
    // log('spy=>chat.postMessage', JSON.stringify(msg, null, 2))
    this.msg = msg
  }
}

class DummyContext {

  constructor() {
    this.reset()
    this.event = {}
  }

  get received () {
    return {
      text: this.sent.text,
      posted: this.chat.msg
    }
  }

  flatBlocks () {
    const allBlocks = this.chat.msg.attachments.map(att => {
      return att.blocks
    })
    return allBlocks.flat(3)
  }

  reset () {
    this.sent = {
      text: undefined,
      msg: undefined
    }
    this.session = {
      id: 1234
    }
    this.event = undefined
    this.chat = new chatReceiver()
  }

  sendText (text) {
    this.sent.text = text
  }

  setInput (text) {
    this.event = { text }
  }

}

const context = new DummyContext()

const TestUtils = {
  context,

  getBlock (context, idx) {
    log('context', context)
    const atts = context.attachments
    const block = atts[0].blocks[idx]
    return block
  }
}

// add to process when this is included
process.on('unhandledRejection', reason => {
  console.log('stopped', reason)
  throw reason
})

module.exports = TestUtils
