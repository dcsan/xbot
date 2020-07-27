
import SlackRouter from './mup/pal/SlackRouter'

async function main() {
  // Start your app
  const slackApp = SlackRouter.init()
  const port = process.env.PORT || 3000
  await slackApp.start(port);
  console.log('⚡️ Bolt running on port', port)
}

main()
