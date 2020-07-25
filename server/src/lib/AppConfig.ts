import dotEnv from 'dotenv-flow';
dotEnv.config()

console.log('NODE_ENV', process.env.NODE_ENV)
console.log('CONFIG_APP', process.env.CONFIG_APP)

const AppConfig = {

  init() {
    // this is run after module has been used elsewhere so not good
    // console.log('NODE_ENV:', process.env.NODE_ENV)
    // console.log('STORYNAME:', process.env.STORYNAME)
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

  // verificationToken: process.env.VERIFICATION_TOKEN,
  // clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

  // // credentials used to set up oauth for multi-team apps
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // redirectUri: process.env.REDIRECT_URI,

  // BOLT
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'x'

}

AppConfig.init()

export default AppConfig
