import AppConfig from './AppConfig'
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

// TODO - read from AppConfig? but avoid circular deps
const AppLevel = LogLevels.DEBUG    // default level

class MakeLogger {
  name: string
  level: number

  constructor(name: string, level = LogLevels.DEBUG) {
    this.name = name.padEnd(12, ' ')
    this.level = level
  }

  nodeEnv() {
    console.log('env', process.env.NODE_ENV)
  }

  startLoop(msg = '') {
    console.log(`\n_____________________________ ${msg} ________________________________\n`)
  }

  get where() {
    return chalk.gray(`[${this.name}]  \t`)
  }

  log(msg, ...rest) {
    if (this.level < AppLevel) return
    if (forceLogging || process.env.NODE_ENV !== 'test') {
      console.log(this.where, msg, ...rest)
    }
  }

  break(msg, ...rest) {
    console.log('\n\n-------------\n' + this.where, msg, ...rest)
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
    console.log(this.where, chalk.white.bgRed.bold(' ERROR ', msg))
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
      this.logObj(err, obj, { force: true })
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
  logObj(msg: string, obj?: any, opts = { force: false }) {
    const force = opts.force || false
    // dont noisy log for tests
    if (process.env.NODE_ENV == 'test' && !force) return
    if (this.level < AppLevel) return
    obj = Util.removeEmptyKeys(obj)
    if (!obj) {
      this.warn('logObj with null obj')
      obj = {}
    }
    try {
      // this dumps better
      const json = JSON.stringify(obj, null, 2)
      const blob = Util.yamlDump(obj)
      console.log(this.where, msg, blob)
    } catch (err) {
      console.warn('rawObj', obj)
      console.log('log', this.where, msg)
    }
  }

  // without newline
  logLine(line) {
    // let line = msg
    // if (obj) {
    //   if (typeof obj === 'string') {
    //     line = (msg + ' ' + obj + '\n')
    //   } else {
    //     line = (msg + JSON.stringify(obj, null, 2) + '\n')
    //   }
    // } else {
    //   line = (msg + '\n')
    // }
    process.stdout.write(line)
    // return line
  }

  table(msg, obj) {
    console.log(msg)
    console.table(obj)
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
