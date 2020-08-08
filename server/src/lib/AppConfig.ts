import dotEnv from 'dotenv-flow';
dotEnv.config()

import { SceneEvent } from '../mup/MupTypes'
// console.log('NODE_ENV:\t', process.env.NODE_ENV)
// console.log('CONFIG_APP:\t', process.env.CONFIG_APP)

// initial level
const logLevel = parseInt(process.env.DEBUG_LEVEL || '3')

const AppConfig = {

  init() {
    // this is run after module has been used elsewhere so not good
  },

  toggleDebug(evt: SceneEvent) {
    const level = AppConfig.logLevel ? 0 : 5
    AppConfig.logLevel = level
    evt.pal.sendText(` \`debugLevel: ${level} \` `)
  },

  // TODO - merge props below
  read(key) {
    const check = AppConfig[key] || process.env[key]
    if (check !== undefined) { return check } // allow 'false'
    // else
    const msg = "cannot find env var:" + key
    console.warn('process.env = ', process.env, msg)
    throw (msg)
  },

  checkCoreKeys() {
    const checks = [
      'storyName',
      'NODE_ENV'
    ]
    checks.forEach(key => {
      if (AppConfig.read(key) === undefined) {
        throw new Error('undefined config key' + key)
      }
    })
  },

  NODE_ENV: process.env.NODE_ENV,
  CONFIG_ENV: process.env.CONFIG_ENV,
  CONFIG_APP: process.env.CONFIG_APP,
  logLevel: logLevel,
  storyName: process.env.storyName,

  // verificationToken: process.env.VERIFICATION_TOKEN,
  // clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

  // // credentials used to set up oauth for multi-team apps
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // redirectUri: process.env.REDIRECT_URI,

  // BOLT
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'x',   // has to have a value for TSC

}

AppConfig.init()
AppConfig.checkCoreKeys()

// console.log('env', AppConfig.NODE_ENV)
// console.log('storyName', AppConfig.storyName)

export default AppConfig