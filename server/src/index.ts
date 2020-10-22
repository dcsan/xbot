console.log('compiled')
console.time('startUp')

import AppConfig from './lib/AppConfig'
import { dbConn, DbConfig } from './mup/core/DbConfig'

import SlackRouter from './mup/pal/slack/SlackRouter'
import { DiscordRouter } from './mup/pal/discord/DiscordRouter'


async function main() {
  // Start your app

  // console.time('dbConnect')
  DbConfig.init()
  // console.timeEnd('dbConnect')

  if (AppConfig.read('SLACK_BOT_TOKEN')) {
    await SlackRouter.startUp()
  }

  if (AppConfig.read('DISCORD_BOT_TOKEN')) {
    await DiscordRouter.init()
  }

  // Promise.all([p1, p2]).

  console.log('--- READY! ----')

}

console.time('main')
main()
console.timeEnd('main')

