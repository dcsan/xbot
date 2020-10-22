import { Pal } from '../base/Pal'

import { ISlackBlock } from '../slack/SlackTypes'

class MockPal extends Pal {

  channelName(): string {
    return 'mockChannel'
  }

  async sendText(text) {
    // just for testing - no channel to send to
    await this.chatLogger.logInput({ text, type: 'input', who: 'user' })
  }

  // just send as text(s) for now
  async sendSection(section: ISlackBlock) {
    const textPart = section.text
    const text = textPart?.text || 'unknown'
    // TODO - can have emoji
    await this.sendText(text)
  }

  async sendImageBlock(block: ISlackBlock) {
    const imgPath = (block.image_url!)
    await this.sendImage(imgPath)
  }

  async sendImage(url: string) {
    const imgPath = (url)
    await this.sendText('image: ' + imgPath)
    // await this.lastEvent.channel.send(
    //   // block.alt_text,
    //   {
    //     files: [
    //       imgPath
    //     ]
    //   })
  }

  async sendReaction(emoji) {
    this.chatLogger.logInput('emoji: ' + emoji)
  }

  isAdmin() {
    return false
  }

  async sendBlocks(blocks: ISlackBlock[]) {
    for (const block of blocks) {
      console.log('block', block)
      switch (block.type) {

        case 'text':
          await this.sendText(block.text)
          break

        case 'image':
          await this.sendImageBlock(block)
          break

        case 'section':
          await this.sendSection(block)
          break

        // case 'actions':
        //   await this.sendButtonsBlock(block)
        //   break

        // case 'context':
        //   await this.sendFooter(block)
        //   break

        default:
          // logger.warn('unknown block type', block.type)
          // logger.logObj('block', block)
          const text = `${block.type} ${block.text}`
          await this.sendText(text)
      }

    }
  }
}

export { MockPal }
