import AppConfig from '../../lib/AppConfig'

import { App, MessageEvent, ExpressReceiver, Middleware } from '@slack/bolt';
import BotRouter from '../../mup/routes/BotRouter'
import { Logger } from '../../lib/Logger'
import { Pal } from './Pal'
// This is the main file for the cbgbot bot
// import morgan from 'morgan'

const SlackRouter = {

  init(): App {
    const receiver = new ExpressReceiver({ signingSecret: AppConfig.signingSecret });

    console.log('AppConfig', AppConfig)
    const app = new App({
      token: AppConfig.token,
      receiver
    });

    // app.use(morgan('tiny'));
    async function eventLogger(req) {
      console.log('logger req.body.type => ', req.body?.type)
      if (req.event) console.log('req.event => ', req.event.type)
      if (req.action) console.log('req.action => ', req.action.type)
      await req.next();
    }
    app.use(eventLogger)

    // testing
    app.message(/helloSlack/i, async ({ message, say }) => {
      console.log('incoming message', message)
      await say(`hola there <@${ message.user }!`);
    });

    app.message(/.*/, async (slackEvent) => {
      const pal: Pal = new Pal(slackEvent)
      Logger.log('app.message')
      await BotRouter.textEvent(pal)
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
      const pal: Pal = new Pal(slackEvent)
      Logger.log('action.continue')
      await BotRouter.actionEvent(pal)
    });

    app.action(/.*/, async (slackEvent) => {
      slackEvent.ack();
      const pal: Pal = new Pal(slackEvent)
      Logger.logObj('action', slackEvent.action)
      await BotRouter.actionEvent(pal)
      // say('you hit an action')
    });

    app.shortcut(/.*/, async (slackEvent) => {
      // { shortcut, ack, say }
      await slackEvent.ack();
      const pal: Pal = new Pal(slackEvent)
      Logger.logObj('shortcut', slackEvent.shortcut)
      slackEvent.say('shortcut not done yet!')
    });

    receiver.router.get('/health', (_req, res) => {
      res.json({
        ok: true,
        NODE_ENV: AppConfig.NODE_ENV,
        CONFIG_ENV: AppConfig.CONFIG_ENV,
      })
    })
    return app

  }

}

export default SlackRouter
