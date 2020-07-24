import AppConfig from './lib/AppConfig'
import { App } from '@slack/bolt';

AppConfig.init()
// This is the main file for the cbgbot bot
import morgan from 'morgan'

const opts = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
}
console.log('opts', opts)

const app = new App(opts);


app.message('hello', async ({ message, say }) => {
  console.log('incoming message', message)
  await say(`hold there <@${ message.user }!`);
});

app.message(/.*/, async ({ message, say }) => {
  console.log('incoming message', message)
  await say(`you said ${ message.text }`);
});

(async () => {
  // Start your app
  const port = process.env.PORT || 3000
  await app.start(port);
  console.log('running on port', port)

  console.log('⚡️ Bolt app is running!');
})();

