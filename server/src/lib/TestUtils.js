const config = require('./AppConfig')

const TestUtils = {

  context: {
    text: 'not set',
    session: {
      id: 1234
    },

    sendText (text) {
      this.text = text
    }
  }

}

// add to process when this is included
process.on('unhandledRejection', reason => {
  throw reason
})

module.exports = TestUtils
