import AppConfig from './lib/AppConfig'
import { App, MessageEvent, ExpressReceiver } from '@slack/bolt';
import BotRouter from './mup/routes/BotRouter'
import Logger from './lib/Logger'

// This is the main file for the cbgbot bot
// import morgan from 'morgan'

const receiver = new ExpressReceiver({ signingSecret: AppConfig.signingSecret });

console.log('AppConfig', AppConfig)
const app = new App({
  token: AppConfig.token,
  receiver
});

// app.use(morgan('tiny'));
async function eventLogger(req) {
  console.log('logger req.body.type => ', req.body?.type)
  if (req.event) console.log('req.event => ', req.event)
  if (req.action) console.log('req.action => ', req.action)
  await req.next();
}
app.use(eventLogger)

app.message('hello', async ({ message, say }) => {
  console.log('incoming message', message)
  await say(`hold there <@${ message.user }!`);
});

app.message(/.*/, async (slackEvent) => {
  const { event, context, payload } = slackEvent
  // Logger.silly('message =>', {
  //   event,
  //   context,
  //   payload
  // })
  Logger.log('app.message')
  await BotRouter.textEvent(slackEvent)

  // console.log('incoming message', message)
  // await say(`you said ${ message.text }`);
});

// const welcomeChannelId = 'C12345';
// When a user joins the team, send a message in a predefined channel asking them to introduce themselves
// app.event('team_join', async ({ event, context }) => {
//   Logger.logObj('team_join', { token: context.botToken, event })
//   const userName = event.user
//   try {
//     const result = await app.client.chat.postMessage({
//       token: context.botToken,
//       channel: welcomeChannelId,
//       text: `Welcome to the team, <@${ userName }>! 🎉 You can introduce yourself in this channel and play in #Games`
//     });
//     Logger.log('evtResult', result);
//   }
//   catch (error) {
//     Logger.error('sendEvent', error);
//   }
// });

app.action('continue', async (slackEvent) => {
  slackEvent.ack()
  Logger.log('action.continue')
  await BotRouter.actionEvent(slackEvent)
});

app.action(/.*/, async (slackEvent) => {
  slackEvent.ack();
  Logger.logObj('action', slackEvent.action)
  Logger.log('app.action.*')
  await BotRouter.actionEvent(slackEvent)
  // say('you hit an action')
});

app.shortcut(/.*/, async ({ shortcut, ack, say }) => {
  await ack();
  Logger.logObj('shortcut', shortcut)
  say('you hit an shortcut')
});

receiver.router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    NODE_ENV: AppConfig.NODE_ENV,
    CONFIG_ENV: AppConfig.CONFIG_ENV,
  })
})


async function main() {
  // Start your app
  const port = process.env.PORT || 3000
  await app.start(port);
  console.log('running on port', port)

  console.log('⚡️ Bolt app is running!');
}

main()
