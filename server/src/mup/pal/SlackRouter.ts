import AppConfig from '../../lib/AppConfig'

import { App, MessageEvent, ExpressReceiver, Middleware } from '@slack/bolt';
import BotRouter from '../../mup/routes/BotRouter'
import { Logger } from '../../lib/LogLib'
import { PalManager } from './PalManager'
import { Pal } from './Pal'

const SlackRouter = {

  init(): App {

    const receiver = new ExpressReceiver({ signingSecret: AppConfig.signingSecret });

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

    app.message(/.*/, async (slackEvent) => {
      Logger.startLoop()
      const pal: Pal = PalManager.findPal(slackEvent)
      Logger.log('app.message')
      await BotRouter.textEvent(pal)
    });

    app.action(/.*/, async (slackEvent) => {
      Logger.startLoop()
      slackEvent.ack();
      const pal: Pal = PalManager.findPal(slackEvent)
      Logger.logObj('action', slackEvent.action)
      await BotRouter.actionEvent(pal)
      // say('you hit an action')
    });

    // testing
    app.message(/helloSlack/i, async ({ message, say }) => {
      console.log('incoming message', message)
      await say(`hola there <@${message.user}!`);
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
      const pal: Pal = PalManager.findPal(slackEvent)
      Logger.log('action.continue')
      await BotRouter.actionEvent(pal)
    });

    app.shortcut(/.*/, async (slackEvent) => {
      // { shortcut, ack, say }
      await slackEvent.ack();
      const pal: Pal = PalManager.findPal(slackEvent)
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
