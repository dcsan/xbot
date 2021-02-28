// require this first to setup env
// this should not require anything to avoid circular deps

import dotEnv from 'dotenv-flow';
dotEnv.config()

// import { SceneEvent } from '../mup/MupTypes'
// console.log('NODE_ENV:\t', process.env.NODE_ENV)
// console.log('CONFIG_APP:\t', process.env.CONFIG_APP)

// initial level
const logLevel = parseInt(process.env.DEBUG_LEVEL || '3')

const AppConfig = {

  init() {
    // this is run after module has been used elsewhere so not good
    console.log('using NODE_ENV: ', process.env.NODE_ENV)
  },

  // async toggleDebug(evt: SceneEvent) {
  //   const level = AppConfig.logLevel ? 0 : 5
  //   AppConfig.logLevel = level
  //   await evt.pal.sendText(` \`debugLevel: ${level} \` `)
  // },

  // TODO - merge props below
  read(key) {
    const check = AppConfig[key] || process.env[key]
    if (check !== undefined) { return check } // allow 'false'
    // else
    const msg = "cannot find env var: " + key
    console.error(msg)
    // console.error('process.env = ', process.env, msg)
    return undefined
    // throw (msg)
  },

  readNum(key) {
    let num = AppConfig.read(key)
    num = parseInt(num, 10);
    return num
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

  showVal(k) {
    const val = AppConfig.read(k)
    console.log(`${k} => ${val}`)
  },

  info() {
    AppConfig.showVal('DISCORD_ENABLED')
    AppConfig.showVal('SLACK_ENABLED')
    AppConfig.showVal('NODE_ENV')
    AppConfig.showVal('storyName')
    AppConfig.showVal('PORT')
    AppConfig.showVal('ADMIN_ROLES')
    AppConfig.showVal('MUTED_CHANNELS')
    // console.log(':', typeof AppConfig.read('SLACK_ENABLED'))
    // console.log('AppConfig', AppConfig)
    // console.log('NODE_ENV:', AppConfig.NODE_ENV)
    // console.log('storyName', AppConfig.storyName)

  },

  NODE_ENV: process.env.NODE_ENV,
  CONFIG_ENV: process.env.CONFIG_ENV,
  CONFIG_APP: process.env.CONFIG_APP,
  logLevel: logLevel,
  storyName: process.env.storyName,
  mongoUri: process.env.MONGO_URI,
  webDomain: process.env.STATIC_SERVER || "https://cbg.rik.ai",

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
AppConfig.info()

export default AppConfig
