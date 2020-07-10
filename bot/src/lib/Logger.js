const yaml = require('js-yaml')

const Logger = {

  log (msg, rest) {
    console.log(msg, rest)
  },

  logObj (msg, obj) {
    const blob = yaml.dump(obj)
    console.log(msg, blob)
  }

}

module.exports = Logger
