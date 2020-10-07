import { MessageEmbed, TextChannel } from 'discord.js'
import { Pal } from '../Pal'
import {
  Message
} from "discord.js"

import AppConfig from '../../../lib/AppConfig'
import Util from '../../../lib/Util'

import { ISlackBlock } from '../slack/SlackTypes'
import { MakeLogger } from '../../../lib/LogLib'

const logger = new MakeLogger('DiscordPal')

class DiscordPal extends Pal {

  lastEvent: Message  // to force typechecking

  constructor(message: Message, sid: string) {
    super(message, sid)
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

  // --------- admin commands ----------
  async clearChannel() {
    const message = this.lastEvent
    if (message.channel.type === 'text') {
      try {
        const count = 99
        const ch = message.channel as TextChannel
        await ch!.bulkDelete(count)
        // message.delete();
      } catch (err) {
        logger.error('failed to delete', err)
      }
    }
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

  async sendImage(block: ISlackBlock) {
    const imgPath = Util.localCdnPath(block.image_url)
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
  async sendContext(section: ISlackBlock) {
    const elem = section.elements![0]
    const text = elem.text
    await this.sendText(text)
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
          "value": "home"
        }
      ]
  }
 */

  // TODO refactor so we can build it natively here,
  // this is parsing the slackbuilder format now
  // just for one button 'continue' block now
  async sendButtons(block: ISlackBlock) {

    // let bodyText = ''
    const fields: any[] = []
    let emojis: string[] = []
    let title: string = ''
    if (block.elements && block.elements.length > 1) {
      // TODO - handle multiple buttons
    }
    let useEmbeds = false
    for (const elem of block.elements!) {
      let text
      if (elem.url) {
        useEmbeds = true
        // :mag:  :earth_americas:
        text = `:mag: [${elem.text.text}](${elem.url}) `
      } else {
        text = ` \`\`\`⬇︎ [${elem.text.text}] \`\`\` `
      }
      title += text
      // fields.push({
      //   // name: text,
      //   value: text
      // })
      // TODO - for longer lists we might want to show emoji next to each choice?
      // bodyText += `${elem.icon} ${elem.text.text} \n`
      emojis.push(elem.icon)
    }
    // bodyText = `\`\`\`${bodyText}\`\`\``.trim()

    let message
    if (useEmbeds) {
      const embed = {
        // title,
        description: title,
        // fields
      }
      logger.logObj('embed', embed)
      message = await this.lastEvent.channel.send({ embed })
    } else {
      message = await this.lastEvent.channel.send(title)
    }
    const emoList = emojis.filter(em => !!em)
    for (const em of emoList) {
      await message.react(em)
    }
    logger.log('sendButtons=>', message.content, emoList)
  }

  async sendBlocks(blocks: ISlackBlock[]) {
    for (const block of blocks) {
      console.log('block', block)
      switch (block.type) {
        case 'image':
          await this.sendImage(block)
          break

        case 'section':
          await this.sendSection(block)
          break

        case 'actions':
          await this.sendButtons(block)
          break

        case 'context':
          await this.sendContext(block)
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

  // TODO - find names for common emoji
  emojiName(emoji): string {
    return emoji
  }


}

export { DiscordPal }

