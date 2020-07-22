const yaml = require('js-yaml')

// const forceLogging = true   // override even for testing
const forceLogging = false   // override even for testing

const Logger = {

  nodeEnv () {
    console.log('env', process.env.NODE_ENV)
  },

  log (msg, ...rest) {
    if (forceLogging || process.env.NODE_ENV !== 'test') {
      console.log(msg, ...rest)
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
    console.log("ERROR", msg)
    console.log(obj)
    console.log('typeof', typeof (obj))
    console.log('keys', Object.keys(obj))

    // if (obj) {
    //   Logger.logObj('obj', obj)
    // }
    // throw new Error(msg)
  },

  // error and throw
  fatal (msg, obj) {
    console.log("FATAL", msg)
    if (obj) {
      Logger.logObj('obj', obj)
    }
    throw new Error(msg)
  },

  /**
   * yaml log is stripping out Functions
   */
  logJson (msg, obj, force = false) {
    console.log(msg, JSON.stringify(obj))
  },

  logObj (msg, obj, force=false) {
    // dont noisy log for tests
    if (process.env.NODE_ENV == 'test' && !force) return
    const json = JSON.stringify(obj, null, 2)
    // console.log('json', json)
    const blob = yaml.dump(json)
    //   , {
    //     styles: {
    //       '!!null': 'canonical' // dump null as ~
    //     },
    //     'sortKeys': true        // sort object keys
    //   }
    // )
    console.log(`--- ${msg}\n`, blob)

  },

  checkItem (obj, field) {
    const res = obj[field]
    if (!res) {
      console.warn('checkItem: missing field:', field)
      console.log('in obj =>', obj)
    }
  }

}

module.exports = Logger
