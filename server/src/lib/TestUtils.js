const AppConfig = require('./AppConfig')
AppConfig.init()


class chatReceiver {
  postMessage (msg) {
    this.msg = msg
  }
}

class DummyContext {


  constructor() {
    this.reset()
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

}

const context = new DummyContext()

const TestUtils = {
  context
}

// add to process when this is included
process.on('unhandledRejection', reason => {
  throw reason
})

module.exports = TestUtils
