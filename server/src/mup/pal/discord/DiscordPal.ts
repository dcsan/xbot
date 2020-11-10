import { MessageEmbed, Message, TextChannel } from 'discord.js'
import { Pal, IPal, FlexEvent } from '../base/Pal'

import AppConfig from '../../../lib/AppConfig'
import Util from '../../../lib/Util'

import { ISlackBlock } from '../slack/SlackTypes'
import { DiscordBuilder } from './DiscordBuilder'
import { MakeLogger } from '../../../lib/LogLib'
import { EmojiMap } from '../../../lib/EmojiMap'

import { PalMsg } from '../../MupTypes'

const logger = new MakeLogger('DiscordPal')


class DiscordPal extends Pal implements IPal {

  builder = DiscordBuilder

  // created from incoming message
  constructor(message: Message, sid: string) {
    super(message, sid)
    this.builder = DiscordBuilder
    this.lastEvent = message  // to force the type
    logger.log('created discord pal', message.channel.id)
  }

  // for logger
  lastText(): string {
    const lastEvent = this.lastEvent as Message
    return lastEvent.content
  }

  // FIXME - could be an emoji reaction
  lastActionValue(): string {
    const lastEvent = this.lastEvent as Message
    return lastEvent.content
  }

  isAdmin(): boolean {
    const message = this.lastEvent
    // const role = message.guild.roles.cache.find(role => role.name === '<role name>');
    const adminRoles = AppConfig.read('ADMIN_ROLES')
    const userRoles = message?.member?.roles.cache
    if (userRoles?.find(role => adminRoles.includes(role.name))) { return true }
    const msg = 'failed admin check'
    this.sendText(msg)
    logger.warn(msg)
    return false
  }

  async cbLogInput(input: string, notHandled: boolean = false) {
    const palMsg: PalMsg = {
      text: input,
      notHandled,
      sender: 'user',
      platform: 'discord',
      channel: this.lastEvent.channel.id,
    }
    this.cbLog(palMsg)
  }

  // --------- admin commands ----------
  async clearChannel() {
    if (!this.isAdmin()) {
      await this.sendText('you need to be an admin to use that!')
      logger.warn("blocked admin clearChannel")
      return
    }
    const message = this.lastEvent
    if (message.channel.type !== 'text') {
      return logger.warn('cannot clear channel type', message.channel.type)
    }
    let c
    try {
      // FIXME - the error isn't throwing properly it exits the loop instead and doesnt catch
      const count = 99
      const ch = message.channel as TextChannel
      for (c = 0; c < 10; c++) {
        const deleted = await ch!.bulkDelete(count)
        logger.log('clear', c, deleted.size)
        // .catch(console.error) // FIXME - breaks to "done" if this isn't here?
        // .then((result) => console.error('clear result', result))
        if (deleted?.size < 1) {
          logger.log('no more to clear at c =', c)
          break
        }
      }
      // message.delete();
    } catch (err) {
      logger.warn('clear exit at c=', c, err)
    }
    logger.log('clear done at c=', c)
  }

  async showInstallUrl() {
    const discordClientId = AppConfig.read('DISCORD_CLIENT_ID')
    const msg = `https://discord.com/oauth2/authorize?client_id=${discordClientId}&scope=bot&permissions=37215553`
    logger.log('install => ' + msg)
    await this.sendText(msg)
  }

  async sendText(text: string) {
    if (!text) {
      logger.warn('tried to send empty text', text)
    }
    text = this.processTemplate(text)
    this.lastSent = await this.lastEvent.channel.send(text)
    const palMsg: PalMsg = {
      text,
      sender: 'bot',
      platform: 'discord',
      channel: this.lastEvent.channel.id
    }
    this.cbLog(palMsg)
  }

  async sendReaction(emoji: string) {
    const message = this.lastEvent as Message
    const emCode = EmojiMap.find(emoji)
    await message.react(emCode!)
  }

  // blocks [
  //   {
  //     type: 'image',
  //     title: { type: 'plain_text', text: 'lobby', emoji: true },
  //     image_url: 'https://cbg.rik.ai/cdn/storydata/asylum/shots/640/title.jpg?x=26691836',
  //     alt_text: 'default'
  //   },
  //   {
  //     type: 'section',
  //     text: { type: 'mrkdwn', text: "You're in the lobby!" }
  //   }
  // ]

  async safeSend(blob: any) {
    try {
      await this.lastEvent.channel.send(blob)
    } catch (err) {
      logger.error('failed to send', blob)
      // TODO - check for CLIENT_DEBUG_OUTPUT=yes
      const imgPath = blob?.files?.[0].imgPath
      if (imgPath) {
        await this.sendText(`broken image: ${imgPath}`)
      } else {
        await this.sendText('send error! ```json\n' + JSON.stringify(blob) + '```')
      }
      // TODO - handle sending text for other error types
    }
  }

  // FIXME - we should not have to extract formatted images from blocks
  // by using a custom DiscordBuilder in the first place
  async sendImageBlock(block: ISlackBlock) {
    const imgPath = Util.localCdnPath(block.image_url)
    await this.safeSend(
      {
        files: [
          imgPath
        ]
      }
    )
  }

  async sendImage(url: string) {
    const imgPath = Util.localCdnPath(url)
    await this.lastEvent.channel.send(
      // block.alt_text,
      {
        files: [
          imgPath
        ]
      })
  }

  // just send as text(s) for now
  async sendSection(section: ISlackBlock) {
    const textPart = section.text
    const text = textPart?.text || 'unknown'
    // TODO - can have emoji
    await this.sendText(text)
  }

  // just send as text(s) for now
  /**
  "type": "context",
  "elements": [
    {
      "type": "mrkdwn",
      "text": ":information_source:  you can check `tasks` for the last instructions or `hint` if you're stuck"
    }
  ]
  */
  async sendFooter(section: ISlackBlock) {
    const elem = section.elements![0]
    const text = elem.text
    await this.sendText(text)
  }

  // FIXME - to send emoji buttons
  // TODO use pal.builder earlier in flow to format for discord as emoji buttons
  async sendButtons(buttons: string[]) {
    const block = this.builder.buttonsBlock(buttons)
    await this.sendBlocks([block])
    await this.chatLogger.logRow({ who: 'bot', text: buttons.join(' | '), type: 'buttons' })
  }

  /**
    {
    "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "BEGIN",
            "emoji": true
          },
          icon, // react emoji
          "value": "home"
        }
      ]
  }
 */

  // TODO refactor so we can build it natively here,
  // this is parsing the slackbuilder format now
  // but that will require a native internal format to transform
  // build and send are separate so we can batch sending a whole block
  async sendButtonsBlock(block: ISlackBlock) {

    // let bodyText = ''
    const fields: any[] = []
    let emojis: string[] = []
    let text: string = ''
    let singleButton = true
    if (block.elements && block.elements.length > 1) {
      // TODO - handle multiple buttons
      singleButton = false
    }
    let useEmbeds = false
    let wrapText = true
    for (const elem of block.elements!) {

      if (elem.url) {
        useEmbeds = true
        wrapText = false // dont wrap emoji below
        // :mag:  :earth_americas:
        text = `:link: [${elem.text.text}](${elem.url}) :mag:`
      } else {
        if (singleButton) {
          // text += ` \`\`\`[ ${elem.text.text} ] \`\`\` `
          text += `⬇︎ ${elem.text.text}`
        } else {
          if (elem.text.text) {
            text += `${elem.text.text}|`
          }
        }
      }
      emojis.push(elem.icon)
    }
    text = text.replace(/\|$/, '')  // remove trailing |
    if (wrapText && text) {
      text = '```fix\n' + text + '```'
    }
    let message
    if (useEmbeds) {
      const embed = {
        description: text,
      }
      logger.logObj('embed', embed)
      message = await this.lastEvent.channel.send({ embed })
    } else {
      if (text) {
        // could be an empty text
        message = await this.lastEvent.channel.send(text)
      }
    }
    message = message || this.lastEvent
    const emoList = emojis.filter(em => !!em)
    logger.log('reactions', emoList)
    for (const em of emoList) {
      await message.react(em)
    }
    logger.log('sendButtons=>', message.content, emoList)
  }

  // TODO - check lastMessaeg is OK to attache emoji to
  async sendEmojiBlock(block) {
    const message = this.lastSent as Message
    for (const em of block.emoji) {
      logger.log('em', em)
      try {
        await message.react(em)
      } catch (err) {
        logger.warn('failed to send emoji', em, err[0])
      }
    }
  }

  // FIXME - based on slack notion of sending list of blocks
  // TODO rebuild this with embeds and a Discord builder
  async sendBlocks(blocks: ISlackBlock[]) {
    for (const block of blocks) {
      console.log('block', block)
      switch (block.type) {
        case 'image':
          await this.sendImageBlock(block)
          break

        case 'emoji':
          await this.sendEmojiBlock(block)
          break

        case 'section':
          await this.sendSection(block)
          break

        case 'actions':
          await this.sendButtonsBlock(block)
          break

        case 'context':
          await this.sendFooter(block)
          break

        default:
          logger.warn('unknown block type', block.type)
          logger.logObj('block', block)
          await this.sendText('unknown block \```json\n' + JSON.stringify(block, null, 2) + '```')
      }

    }
  }

  async showVoiceChannel(pal: Pal) {
    const message: Message = pal.lastEvent as Message
    let text = `https://discord.gg/HZeTnGq \n`
    text += "click here to join the voice chat"
    const m2 = await message.channel.send(text)
    // await m2.react('\:fire:');
    // await m2.react('🎲');
  }

  channelName(): string {
    return this.lastEvent.channel.name
  }

  async sendInvite() {
    const link = AppConfig.read('DISCORD_INVITE')
    const text = `Invite Yo Friends!\n${link}`
    await this.sendText(text)
  }

  // show linked channels for team-1 etc channel names
  async showTeams() {
    const channelNames = AppConfig.read('TEAM_CHANNELS').split('|')
    logger.log('channelNames', channelNames)
    const channelCache = this.lastEvent.member.guild.channels.cache
    const teamIds = channelNames.map(channelName => {
      const channel = channelCache.find(ch => ch.name === channelName)
      if (channel) {
        return channel.toString()
      } else {
        logger.log('cannot find team', channelName)
      }
    }).filter(x => x) // remove nulls

    let text = "This game is more fun with friends! \nIf a friend invited you, join their team channel below, or choose one to start a new game and invite your friends to join you!\n"
    text += teamIds.join('  |  ')
    console.log('teams msg', text)
    await this.sendText(text)
  }

}

export { DiscordPal }

