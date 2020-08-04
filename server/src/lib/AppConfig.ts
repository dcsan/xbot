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
    // console.log('NODE_ENV:', process.env.NODE_ENV)
    // console.log('STORYNAME:', process.env.STORYNAME)
  },

  toggleDebug(evt: SceneEvent) {
    const level = AppConfig.logLevel ? 0 : 5
    AppConfig.logLevel = level
    evt.pal.sendText(` \`debugLevel: ${level} \` `)
  },

  // TODO - merge props below
  read(key) {
    const check = process.env[key]
    if (check) { return check }
    // else
    const msg = "cannot find env var:" + key
    console.log('env', process.env)
    throw (msg)
  },

  NODE_ENV: process.env.NODE_ENV,
  CONFIG_ENV: process.env.CONFIG_ENV,
  CONFIG_APP: process.env.CONFIG_APP,
  logLevel: logLevel,

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

console.log('env', AppConfig.NODE_ENV)
console.log('STORYNAME', process.env.STORYNAME)

AppConfig.init()

export default AppConfig
