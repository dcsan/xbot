const dotEnv = require('dotenv-flow');

const AppConfig = {
  init () {
    dotEnv.config()
    // console.log('NODE_ENV:', process.env.NODE_ENV)
    // console.log('STORYNAME:', process.env.STORYNAME)
  },

  read (key) {
    const check = process.env[key]
    if (check) { return check }
    // else
    const msg = "cannot find env var:" + key
    console.log('env', process.env)
    throw(msg)
  }

}

module.exports = AppConfig
