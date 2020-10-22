import AppConfig from '../../../lib/AppConfig'
import Discord from 'discord.js'
import {
  Message,
  User,
  GuildMember,
  TextChannel
} from "discord.js";

import _ from 'lodash'

import BotRouter from '../../routing/BotRouter'
import { DiscoUtils } from './DiscoUtils'
import { MakeLogger } from '../../../lib/LogLib'
import { PalManager } from '../PalManager'
import { Pal, ISlackEvent } from '../base/Pal'

const logger = new MakeLogger('DiscordRouter')

const prefix = ''

const DiscordRouter = {

  init() {
    return new Promise((resolve, _reject) => {

      logger.logLine('discord setup >>')
      const enabled = AppConfig.read('DISCORD_ENABLED')
      if (enabled !== 'yes') {
        logger.log('DISCORD_ENABLED', enabled, 'skipping')
        return
      }

      const client = new Discord.Client();
      client.login(AppConfig.read('DISCORD_BOT_TOKEN'));
      client.once('ready', () => {
        logger.log('<< OK')
        // console.log('DJS Ready!');
        // logger.log('install: ', DiscoUtils.installUrl())
        resolve('done')
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

      // Create an event listener for new guild members
      client.on('guildMemberAdd', async (member) => {
        const lobbyChannel = AppConfig.read('LOBBY_CHANNEL')
        logger.log('member added', member.user?.username, member)
        const channelCache = member.guild.channels.cache
        // Send the message to a designated channel on a server:
        const channel = channelCache.find(ch => {
          return (ch.type === 'text' && ch.name === lobbyChannel)
        }) as TextChannel

        // Do nothing if the channel wasn't found on this server
        if (!channel) {
          logger.warn('cannot find lobby channel:', { lobbyChannel })
          return
        }
        // @ts-ignore
        const intro = _.sample([
          `Welcome ${member}!`,
          `${member} just joined!`,
          `Hey ${member}!`,
          `Good to see you ${member}!`,
          `Thanks for joining ${member}!`,
          `${member} just landed`,
        ])

        const msg = await channel.send(intro + `\n⬇︎ Hit the 🚀 to get started!`);
        logger.log('msg', msg)
        await msg.react('🚀')
      });
    })

  }
}

export { DiscordRouter }
