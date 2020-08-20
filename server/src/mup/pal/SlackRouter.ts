import AppConfig from '../../lib/AppConfig'
import path from 'path'
import { App, MessageEvent, ExpressReceiver, Middleware } from '@slack/bolt';
import BotRouter from '../../mup/routing/BotRouter'
import { MakeLogger } from '../../lib/LogLib'
import { PalManager } from './PalManager'
import { Pal, ISlackEvent } from './Pal'
const express = require('express')

const logger = new MakeLogger('SlackRouter')

const SlackRouter = {

  init(): App {

    const receiver = new ExpressReceiver({ signingSecret: AppConfig.signingSecret });

    const app = new App({
      token: AppConfig.token,
      receiver
    });

    const onCommands = async (slackEvent: ISlackEvent) => {
      slackEvent.ack!();
      logger.startLoop(`command: ${slackEvent.command!.command} [${slackEvent.command!.text}]`)
      const pal: Pal = PalManager.findPal(slackEvent)
      logger.logObj('command', slackEvent.command)
      await BotRouter.command(pal, slackEvent)
    }

    // app.use(morgan('tiny'));
    // custom middleware to log events
    async function eventLogger(req) {
      if (req.body.command) {
        // logger.log('req', req)
        // logger.log('req.payload', req.payload)
        // logger.log('req.command', req.command)
        logger.log('COMMAND => ', req.body?.command)
      } else if (req.body.event) {
        logger.log('EVENT => ', req.body.event)
      } else if (req.body.message) {
        logger.log('MESSAGE => ', req.body.event)
      } else if (req.body.action) {
        logger.log('ACTION => ', req.body.action)
      } else {
        // default
        logger.log('unknown type')
        logger.log('req.body', req.body)
        logger.log('req.payload', req.payload)
      }
      await req.next();
    }
    app.use(eventLogger)

    // doesnt work
    // app.use('/cdn', express.static('/cdn'))
    receiver.router.get('/cdn/*', (req, res) => {
      logger.log('cdn GET', req.path)
      const fp = path.join(__dirname, '../../../', req.path)
      res.contentType('image/jpeg');
      res.sendFile(fp);
    })


    // testing
    app.message(/helloSlack/i, async ({ message, say }) => {
      logger.log('incoming message', message)
      await say(`hola there <@${message.user}!`);
    });

    app.message(/.*/, async (slackEvent) => {
      logger.startLoop('message')
      const pal: Pal = PalManager.findPal(slackEvent)
      logger.log('app.message')
      await BotRouter.textEvent(pal)
    });

    app.action(/.*/, async (slackEvent) => {
      logger.startLoop('action')
      slackEvent.ack();
      logger.log(slackEvent)
      const pal: Pal = PalManager.findPal(slackEvent)
      logger.logObj('action', slackEvent.action)
      await BotRouter.actionEvent(pal)
      // say('you hit an action')
    });

    // we have to route the comamnds separately to get the `ack` event to call
    // Argument of type 'SlackCommandMiddlewareArgs & AllMiddlewareArgs' is not assignable to parameter of type 'ISlackEvent'.
    app.command('/hint', async (slackEvent) => {
      // @ts-ignore
      await onCommands(slackEvent)
    });

    app.command('/say', async (slackEvent) => {
      // @ts-ignore
      await onCommands(slackEvent)
    });


    // const welcomeChannelId = 'C12345';
    // When a user joins the team, send a message in a predefined channel asking them to introduce themselves
    // app.event('team_join', async ({ event, context }) => {
    //   logger.logObj('team_join', { token: context.botToken, event })
    //   const userName = event.user
    //   try {
    //     const result = await app.client.chat.postMessage({
    //       token: context.botToken,
    //       channel: welcomeChannelId,
    //       text: `Welcome to the team, <@${ userName }>! 🎉 You can introduce yourself in this channel and play in #Games`
    //     });
    //     logger.log('evtResult', result);
    //   }
    //   catch (error) {
    //     logger.error('sendEvent', error);
    //   }
    // });

    app.action('continue', async (slackEvent) => {
      slackEvent.ack()
      const pal: Pal = PalManager.findPal(slackEvent)
      logger.log('action.continue')
      await BotRouter.actionEvent(pal)
    });

    app.shortcut(/.*/, async (slackEvent) => {
      // { shortcut, ack, say }
      await slackEvent.ack();
      const pal: Pal = PalManager.findPal(slackEvent)
      logger.logObj('shortcut', slackEvent.shortcut)
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
