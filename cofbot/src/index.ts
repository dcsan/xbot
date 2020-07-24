import AppConfig from './lib/AppConfig'
import { App, MessageEvent } from '@slack/bolt';
import BotRouter from './mup/routes/BotRouter'

AppConfig.init()
// This is the main file for the cbgbot bot
import morgan from 'morgan'

console.log('ApPConfig', AppConfig)
const app = new App(AppConfig);


app.message('hello', async ({ message, say }) => {
  console.log('incoming message', message)
  await say(`hold there <@${ message.user }!`);
});

app.message(/.*/, async (slackEvent) => {
  await BotRouter.textEvent(slackEvent)

  // console.log('incoming message', message)
  // await say(`you said ${ message.text }`);
});

async function main() {
  // Start your app
  const port = process.env.PORT || 3000
  await app.start(port);
  console.log('running on port', port)

  console.log('⚡️ Bolt app is running!');
}

main()
