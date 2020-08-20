console.log('compiled')
console.time('startUp')

import { dbConn, DbConfig } from './mup/core/DbConfig'

console.time('import')
import SlackRouter from './mup/pal/SlackRouter'
console.timeEnd('import')

import Util from './lib/Util'

async function main() {
  // Start your app

  console.time('dbConnect')
  DbConfig.init()
  console.timeEnd('dbConnect')

  console.time('SlackRouter.init')
  const slackApp = SlackRouter.init()
  console.timeEnd('SlackRouter.init')
  const port = process.env.PORT || 3000
  console.time('slackApp.start')
  await slackApp.start(port);
  console.timeEnd('slackApp.start')
  console.log('⚡️ Bolt running on port', port)
}

console.time('main')
main()
console.timeEnd('main')
