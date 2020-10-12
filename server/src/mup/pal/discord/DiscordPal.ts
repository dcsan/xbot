import { MessageEmbed, Message, TextChannel } from 'discord.js'
import { Pal, IPal, FlexEvent } from '../base/Pal'

import AppConfig from '../../../lib/AppConfig'
import Util from '../../../lib/Util'

import { ISlackBlock } from '../slack/SlackTypes'
import { DiscordBuilder } from './DiscordBuilder'
import { BaseBuilder } from '../base/BaseBuilder'
import { MakeLogger } from '../../../lib/LogLib'

const logger = new MakeLogger('DiscordPal')

class DiscordPal extends Pal implements IPal {

  builder = DiscordBuilder

  constructor(message: Message, sid: string) {
    super(message, sid)
    this.builder = DiscordBuilder
    this.lastEvent = message  // to force the type
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
    logger.warn('failed admin check')
    return false
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
        // .catch(console.error) // FIXME - breaks to "done" if this isn't here?
        // .then((result) => console.error('clear result', result))
        if (deleted?.size < 1) {
          logger.log('finish clear at c =', c)
          break
        }
        logger.log('clear', c)
      }
      // message.delete();
    } catch (err) {
      logger.warn('exit to delete at c=', c, err)
    }
    logger.log('clear done!')
  }

  async showInstallUrl() {
    const DiscordClientId = AppConfig.read('DISCORD_CLIENT_ID')
    const msg = `https://discord.com/oauth2/authorize?client_id=${DiscordClientId}&scope=bot`
    logger.log('install => ' + msg)
    await this.sendText(msg)
  }

  async sendText(text: string) {
    if (!text) {
      logger.warn('tried to send empty text', text)
    }
    text = this.processTemplate(text)
    await this.lastEvent.channel.send(text)
    // const block = SlackBuilder.textBlock(text)
    // await this.sendBlocks([block])
    // await this.wrapSay({ text, type: 'text', who: 'bot' })
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

  // FIXME - we should not have to extract formatted images from blocks
  // by using a custom DiscordBuilder in the first place
  async sendImageBlock(block: ISlackBlock) {
    const imgPath = Util.localCdnPath(block.image_url)
    await this.lastEvent.channel.send(
      // block.alt_text,
      {
        files: [
          imgPath
        ]
      })
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
  // use pal.builder earlier in flow to format for discord as emoji buttons
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
          text += `${elem.text.text}|`
        }
      }
      emojis.push(elem.icon)
    }
    if (wrapText) {
      text = '```' + text + '```'
    }
    let message
    if (useEmbeds) {
      const embed = {
        description: text,
      }
      logger.logObj('embed', embed)
      message = await this.lastEvent.channel.send({ embed })
    } else {
      message = await this.lastEvent.channel.send(text)
    }
    const emoList = emojis.filter(em => !!em)
    logger.log('reactions', emoList)
    for (const em of emoList) {
      await message.react(em)
    }
    logger.log('sendButtons=>', message.content, emoList)
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

}

export { DiscordPal }
