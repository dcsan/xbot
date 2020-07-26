import AppConfig from '../lib/AppConfig'
import yaml from 'js-yaml'

// const forceLogging = true   // override even for testing
const forceLogging = false   // override even for testing

const LogLevels = {
  SILLY: 4,
  DEBUG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
}

const logLevel = AppConfig.logLevel

const Logger = {

  nodeEnv() {
    console.log('env', process.env.NODE_ENV)
  },

  log(msg, ...rest) {
    if (forceLogging || process.env.NODE_ENV !== 'test') {
      console.log(msg, ...rest)
    }
  },

  // this will log even when testing
  testLog(msg, ...rest) {
    console.log(msg, ...rest)
  },

  warn(msg, ...rest) {
    if (logLevel < LogLevels.WARN) return
    console.log(msg, ...rest)
  },

  error(msg, obj = false) {
    console.log("ERROR", msg)
    if (obj) { console.log(obj) }
    console.log('typeof', typeof (obj))
    console.log('keys', Object.keys(obj))

    // if (obj) {
    //   Logger.logObj('obj', obj)
    // }
    // throw new Error(msg)
  },

  // error and throw
  fatal(msg, obj) {
    console.log("FATAL", msg)
    if (obj) {
      Logger.logObj('obj', obj)
    }
    throw new Error(msg)
  },

  /**
   * yaml log is stripping out Functions
   */
  logJson(msg, obj, _force = false) {
    console.log(msg, JSON.stringify(obj, null, 2))
  },

  logObj(msg, obj, force = false) {
    // dont noisy log for tests
    if (process.env.NODE_ENV == 'test' && !force) return
    try {
      const json = JSON.stringify(obj, null, 2)
      const blob = yaml.dump(json)
      console.log(`--- ${ msg }\n`, blob)
    } catch (err) {
      console.log('failed to stringify')
      console.log(msg)
    }
  },

  silly(msg, ...rest) {
    if (logLevel >= LogLevels.SILLY) {
      Logger.logObj(msg, rest)
    }
  },

  checkItem(obj, field) {
    const res = obj[field]
    if (!res) {
      console.warn('checkItem: missing field:', field)
      console.log('in obj =>', obj)
    }
  }

}

export default Logger
