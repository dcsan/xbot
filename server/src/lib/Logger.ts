import AppConfig from '../lib/AppConfig'
import yaml from 'js-yaml'
import Util from './Util'
import chalk from 'chalk'
// const forceLogging = true   // override even for testing
const forceLogging = false   // override even for testing

enum LogLevels {
  FATAL = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  SILLY = 5,
}

class MakeLogger {
  name: string

  constructor(name: string) {
    this.name = name.padEnd(12, ' ')
  }

  nodeEnv() {
    console.log('env', process.env.NODE_ENV)
  }

  startLoop() {
    console.log('\n_____________________________________________________________\n')
  }

  get where() {
    return chalk.gray(`[${this.name}] -->\t`)
  }

  log(msg, ...rest) {
    if (forceLogging || process.env.NODE_ENV !== 'test') {
      console.log(this.where, msg, ...rest)
    }
  }

  // this will log even when testing
  testLog(msg, ...rest) {
    // process.stdout.write('---> ', msg, ...rest, '\n')
    console.log('---> ', msg, ...rest, '\n')
  }

  warn(msg, obj = {}, force = false) {
    if (AppConfig.logLevel < LogLevels.WARN || force) return
    this.log(
      chalk.black.bgYellow.bold(' WARNING ' + msg),
      obj, force)
  }

  error(msg, obj = {}) {
    console.log("------- ERROR ---------", msg)
    if (!Util.isEmptyObject(obj)) { console.log(obj) }
    // console.log('typeof', typeof (obj))
    // console.log('keys', Object.keys(obj))

    // if (obj) {
    //   this.logObj('obj', obj)
    // }
    // throw new Error(msg)
  }

  assertEqual(actual, expected, msg: string, obj: any = {}): boolean {
    if (actual != expected) {
      const err = 'FAIL assertEqual: ' + msg
      this.error(err, obj)
      console.log('actual', actual)
      throw new Error(err)
    }
    return true
  }

  assertDefined(elem, msg, obj?): boolean {
    if (elem === undefined) {
      this.warn('undefined', msg, obj)
    }
    return true
  }

  trace(err) {
    console.trace(err)
  }

  assertTrue(check, msg: string, obj: any = {}): boolean {
    if (!check) {
      const err = `FAIL ASSERT.true ` + msg
      this.logObj(err, obj, true)
      this.trace(err)
    }
    return true
  }

  // error and throw
  fatal(msg, obj) {
    console.log("FATAL", msg)
    if (obj) {
      this.logObj('obj', obj)
    }
    throw new Error(msg)
  }

  /**
   * yaml log is stripping out Functions
   */
  logJson(msg, obj, _force = false) {
    console.log(msg, JSON.stringify(obj, null, 2))
  }

  // force to ALWAYS run even in test mode
  logObj(msg: string, obj?: any, force: boolean = false) {
    // dont noisy log for tests
    if (process.env.NODE_ENV == 'test' && !force) return
    obj = Util.removeEmptyKeys(obj)
    try {
      // this dumps better
      const json = JSON.stringify(obj, null, 2)
      const blob = yaml.dump(json)
      console.log(`--- ${msg}`, blob)
    } catch (err) {
      console.log('failed to stringify')
      console.log(msg)
    }
  }

  // use to avoid jest noisy logging on console.log
  writeLine(msg, obj = {}) {
    if (obj) {
      process.stdout.write(msg + JSON.stringify(obj, null, 2) + '\n')
    } else {
      process.stdout.write(msg + '\n')
    }
  }

  silly(msg, ...rest) {
    if (AppConfig.logLevel >= LogLevels.SILLY) {
      this.logObj(msg, rest)
    }
  }

  checkItem(obj, field) {
    const res = obj[field]
    if (!res) {
      this.warn(`checkItem: missing field: [ ${field} ] in obj`, obj, true)
    }
  }

}

const Logger = new MakeLogger('-')

export { Logger, LogLevels, MakeLogger }
