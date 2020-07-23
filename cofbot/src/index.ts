// This is the main file for the cbgbot bot.

// Import Botkit's core features
import { Botkit } from 'botkit'
import { BotkitCMSHelper } from 'botkit-plugin-cms'

// Import a platform-specific adapter for slack.
import { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } from 'botbuilder-adapter-slack'
import { MongoDbStorage } from 'botbuilder-storage-mongodb'

// Load process.env values from .env file
import { config } from 'dotenv'
config()

console.log('using MONGO_URI', process.env.MONGO_URI)
console.log('using NODE_ENV', process.env.NODE_ENV)

let storage = undefined
if (process.env.MONGO_URI) {
  storage = new MongoDbStorage({
    url: process.env.MONGO_URI,
    useUnifiedTopology: true
  })
  // @ts-ignore
  // mongoStorage = storage
}

const adapter = new SlackAdapter({
  // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
  enable_incomplete: true,

  // parameters used to secure webhook endpoint
  verificationToken: process.env.VERIFICATION_TOKEN,
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

  // auth token for a single-team app
  botToken: process.env.BOT_TOKEN,

  // credentials used to set up oauth for multi-team apps
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scopes: ['bot'],
  redirectUri: process.env.REDIRECT_URI,

  // functions required for retrieving team-specific info
  // for use in multi-team apps

  // @ts-ignore
  getTokenForTeam: getTokenForTeam,
  // @ts-ignore
  getBotUserByTeam: getBotUserByTeam,
})

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware())

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware())

const controller = new Botkit({
  webhook_uri: '/api/messages',
  adapter: adapter,
  storage,
})

if (process.env.CMS_URI) {
  controller.usePlugin(
    new BotkitCMSHelper({
      uri: process.env.CMS_URI,
      // @ts-ignore
      token: process.env.CMS_TOKEN,
    })
  )
}

// Once the bot has booted up its internal services
controller.ready(() => {
  // load traditional developer-created local custom feature modules
  controller.loadModules(__dirname + '/features')

  /* catch-all that uses the CMS to trigger dialogs */
  if (controller.plugins.cms) {
    controller.on('message,direct_message', async (bot, message) => {
      let results = false
      results = await controller.plugins.cms.testTrigger(bot, message)

      if (results !== false) {
        // do not continue middleware!
        return false
      }
      return
    })
  }
})

controller.webserver.get('/', (_req, res) => {
  const output = {
    msg: `This app is running Botkit ${ controller.version }.`,
    env: process.env.NODE_ENV
  }
  res.json(output)
})

controller.webserver.get('/install', (_req, res) => {
  // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
  res.redirect(controller.adapter.getInstallLink())
})

controller.webserver.get('/install/auth', async (req, res) => {
  try {
    const results = await controller.adapter.validateOauthCode(req.query.code)

    console.log('FULL OAUTH DETAILS', results)

    // Store token by team in bot state.
    tokenCache[results.team_id] = results.bot.bot_access_token

    // Capture team to bot id
    userCache[results.team_id] = results.bot.bot_user_id

    res.json('Success! Bot installed.')
  } catch (err) {
    console.error('OAUTH ERROR:', err)
    res.status(401)
    res.send(err.message)
  }
})

let tokenCache = {}
let userCache = {}

if (process.env.TOKENS) {
  tokenCache = JSON.parse(process.env.TOKENS)
}

if (process.env.USERS) {
  userCache = JSON.parse(process.env.USERS)
}

async function getTokenForTeam(teamId) {
  if (tokenCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(tokenCache[teamId])
      }, 150)
    })
  } else {
    console.error('Team not found in tokenCache: ', teamId)
  }
}

async function getBotUserByTeam(teamId) {
  if (userCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(userCache[teamId])
      }, 150)
    })
  } else {
    console.error('Team not found in userCache: ', teamId)
  }
}

module.exports = adapter

