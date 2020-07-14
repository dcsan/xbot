const yaml = require('js-yaml')

const Logger = {

  log (msg, ...rest) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(msg, ...rest)
    } else {
      // skip logs
      // console.log('test')
    }
  },

  // this will log even when testing
  testLog (msg, ...rest) {
    console.log(msg, ...rest)
  },

  warn (msg, ...rest) {
    console.log(msg, ...rest)
  },

  error (msg, obj) {
    console.error(msg)
    if (obj) {
      Logger.logObj('obj', obj)
    }
  },

  logObj (msg, obj) {
    if (process.env.NODE_ENV == 'test') return
    const blob = yaml.dump(obj)
    console.log(msg, blob)
  }

}

module.exports = Logger
