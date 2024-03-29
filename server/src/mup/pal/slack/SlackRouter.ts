import AppConfig from '../../../lib/AppConfig'
// import path from 'path'
import morgan from 'morgan'
import * as _ from 'lodash'
const express = require('express')

import {
  App, ExpressReceiver,
  SlackCommandMiddlewareArgs,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  // AllMiddlewareArgs,
  // AllMiddlewareArgs,
  MessageEvent,
  Middleware
} from '@slack/bolt';
import BotRouter from '../../routing/BotRouter'
import { MakeLogger } from '../../../lib/LogLib'
import { PalManager } from '../PalManager'
import { ISlackEvent } from '../base/Pal'
import { SlackPal } from './SlackPal'

const logger = new MakeLogger('SlackRouter')

const SlackRouter = {

  async startUp() {
    // console.log('SlackRouter startup')
    // console.time('SlackRouter.init')
    const enabled = AppConfig.read('SLACK_ENABLED')
    if (enabled !== 'yes') {
      logger.log('SLACK_ENABLED', enabled, 'skipping')
      return
    }
    const slackApp = SlackRouter.init()
    // console.timeEnd('SlackRouter.init')
    const port = process.env.SLACKPORT || 33120
    console.time('slackApp.init')
    await slackApp.start(port)
    console.timeEnd('slackApp.init')
    console.log('start slackapp on port: ', port)
  },

  init(): App {

    const receiver = new ExpressReceiver({ signingSecret: AppConfig.signingSecret });

    const app = new App({
      token: AppConfig.token,
      receiver
    });

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
    receiver.app.use(morgan('tiny'));
    receiver.app.use('/cdn', express.static('cdn'))

    // receiver.router.get('/cdn/*', (req, res) => {
    //   logger.log('cdn GET', req.path)
    //   const fp = path.join(__dirname, '../../../', req.path)
    //   res.contentType('image/jpeg');
    //   res.sendFile(fp);
    // })

    // testing
    app.message(/helloSlack/i, async ({ message, say }) => {
      logger.log('incoming message', message)
      await say(`hola there <@${message.user}!`);
    });

    app.message(/.*/, async (args: SlackEventMiddlewareArgs<'message'>) => {
      logger.startLoop('message')
      const slackEvent: ISlackEvent = _.pick(args, [
        'say',
        'message',
        'store',
        'sessionId',
        'action',
        'payload',
        'user',
        'body.channel',  // team, channel
        'body.team'  // team, channel
      ])

      const pal: SlackPal = PalManager.findSlackPal(slackEvent, args.event.channel)
      logger.log('app.message')
      await BotRouter.textEvent(pal)
    });

    // slack typings are incomprehensible so 'any'
    // app.action(/.*/, async (args: SlackActionMiddlewareArgs<'action'>) => {
    // (parameter) args: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs

    app.action(/.*/, async (args: SlackActionMiddlewareArgs<SlackAction>) => {
      args.ack();
      logger.startLoop('action')
      // switch (args.action.type) {
      //   case 'block_actions':
      // }

      logger.logObj('action args.action', args.action)
      const pal: SlackPal = PalManager.findSlackPal(args)
      logger.logObj('action', args.action)
      await BotRouter.actionEvent(pal)
      // say('you hit an action')
    });

    const onCommands = async (slackEvent: ISlackEvent) => {
      slackEvent.ack!();
      logger.startLoop(`command: ${slackEvent.command!.command} [${slackEvent.command!.text}]`)
      const pal: SlackPal = PalManager.findSlackPal(slackEvent)
      logger.logObj('command', slackEvent.command)
      await BotRouter.command(pal, slackEvent)
    }

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

    app.action('continue', async (slackEvent) => {
      slackEvent.ack()
      const pal: SlackPal = PalManager.findSlackPal(slackEvent)
      logger.log('action.continue')
      await BotRouter.actionEvent(pal)
    });

    app.shortcut(/.*/, async (slackEvent) => {
      // { shortcut, ack, say }
      await slackEvent.ack();
      const pal: SlackPal = PalManager.findSlackPal(slackEvent)
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

// startup()

export default SlackRouter
