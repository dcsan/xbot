import AppConfig from '../../../lib/AppConfig'
import Discord from 'discord.js'
import {
  Message
} from "discord.js";

import BotRouter from '../../routing/BotRouter'
import { DiscoUtils } from './DiscoUtils'
import { MakeLogger } from '../../../lib/LogLib'
import { PalManager } from '../PalManager'
import { Pal, ISlackEvent } from '../Pal'

const logger = new MakeLogger('Pal')

const prefix = ''

const DiscordRouter = {

  init() {
    const client = new Discord.Client();
    client.login(AppConfig.read('DISCORD_BOT_TOKEN'));
    client.once('ready', () => {
      console.log('DJS Ready!');
      console.log(DiscoUtils.installUrl())
    });

    client.on('message', async (message: Message) => {
      if (message.author.bot) return;
      if (prefix && !message.content.startsWith(prefix)) return

      const pal: Pal = PalManager.findDiscoPal(message)
      await BotRouter.textEvent(pal)
    });

  }
}

export { DiscordRouter }
