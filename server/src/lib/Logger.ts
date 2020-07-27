import AppConfig from '../lib/AppConfig'
import yaml from 'js-yaml'
import Util from './Util'
// const forceLogging = true   // override even for testing
const forceLogging = false   // override even for testing

const LogLevels = {
  SILLY: 4,
  DEBUG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
}

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
    if (AppConfig.logLevel < LogLevels.WARN) return
    console.log("-------- WARNING", msg, ...rest)
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

  assertEqual(actual, expected, msg): boolean {
    if (actual != expected) {
      const err = 'assert fail: ' + msg
      Logger.warn(err)
      throw new Error(err)
    }
    return true
  },

  assertDefined(elem, msg): boolean {
    if (elem === undefined) {
      Logger.warn('undefined', msg)
    }
    return true
  },

  assertTrue(check, msg, obj = {}): boolean {
    if (check !== true) {
      Logger.warn('not truthy', msg)
      if (obj) console.log('obj', obj)
    }
    return true
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
    obj = Util.removeEmptyKeys(obj)
    try {
      // this dumps better
      const json = JSON.stringify(obj, null, 2)
      const blob = yaml.dump(json)
      console.log(`--- ${ msg }\n`, blob)
    } catch (err) {
      console.log('failed to stringify')
      console.log(msg)
    }
  },

  silly(msg, ...rest) {
    if (AppConfig.logLevel >= LogLevels.SILLY) {
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
