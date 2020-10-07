import AppConfig from '../../../lib/AppConfig'
import Discord from 'discord.js'
import {
  Message
} from "discord.js";

import BotRouter from '../../routing/BotRouter'
import { DiscoUtils } from './DiscoUtils'
import { MakeLogger } from '../../../lib/LogLib'
import { PalManager } from '../PalManager'
import { Pal, ISlackEvent } from '../base/Pal'

const logger = new MakeLogger('DiscordRouter')

const prefix = ''

const DiscordRouter = {

  init() {
    const enabled = AppConfig.read('DISCORD_ENABLED')
    if (enabled !== 'yes') {
      logger.log('DISCORD_ENABLED', enabled, 'skipping')
      return
    }
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

    client.on('messageReactionAdd', async (reaction, _user) => {
      if (_user.bot) return;

      // When we receive a reaction we check if the reaction is partial or not
      if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
          await reaction.fetch();
        } catch (error) {
          console.error('Something went wrong when fetching the message: ', error);
          // Return as `reaction.message.author` may be undefined/null
          return;
        }
      }

      logger.log('reaction.emoji', reaction.emoji)
      const pal: Pal = PalManager.findDiscoPal(reaction.message)
      const emojiName = reaction.emoji.name
      await BotRouter.actionEvent(pal, emojiName)

      // Now the message has been cached and is fully available
      // console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
      // The reaction is now also fully available and the properties will be reflected accurately:
      // console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    });

  }
}

export { DiscordRouter }
