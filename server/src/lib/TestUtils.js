const AppConfig = require('./AppConfig')
AppConfig.init()

const TestUtils = {

  context: {

    sent: {},

    session: {
      id: 1234
    },

    sendText (text) {
      this.sent.text = text
    },

    // between tests
    reset () {
      this.sent = { }
    }

  }

}

// add to process when this is included
process.on('unhandledRejection', reason => {
  throw reason
})

module.exports = TestUtils
