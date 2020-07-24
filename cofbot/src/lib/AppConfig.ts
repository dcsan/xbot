import dotEnv from 'dotenv-flow';

const AppConfig = {

  init() {
    dotEnv.config()
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
}


export default AppConfig
