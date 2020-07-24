import dotEnv from 'dotenv-flow';
dotEnv.config()

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

  verificationToken: process.env.VERIFICATION_TOKEN,
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

  // auth token for a single-team app
  botToken: process.env.BOT_TOKEN,

  // credentials used to set up oauth for multi-team apps
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,

  // BOLT
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET

}

AppConfig.init()

export default AppConfig
