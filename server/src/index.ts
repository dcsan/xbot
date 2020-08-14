console.log('compiled')
console.time('startUp')

console.time('import')
import SlackRouter from './mup/pal/SlackRouter'
console.timeEnd('import')

async function main() {
  // Start your app
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
