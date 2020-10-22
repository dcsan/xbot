const mongoose = require('mongoose');
import { Document, Model, model, Types, Schema, Query } from "mongoose"

import { MakeLogger } from '../../lib/LogLib'
const _ = require('lodash')
const logger = new MakeLogger('ChatLogger')

// import { IMessage } from './MockChannel'
import { ISlackSection } from './slack/SlackTypes'

const ChatLogSchema = Schema({
  who: String,
  text: String,
  type: String,
  blob: Object,
  count: Number,
  minute: Number,
  hour: Number,
  raw: Object,
  chatSession: Number
}, {
  timestamps: true
})

const ChatRowModel = mongoose.model('ChatLog', ChatLogSchema)

const logAll = false
// const logAll = true

interface IChatRow extends Document {
  who: string
  text: string
  type: string
  blob?: any
  count?: number
  minute?: number
  hour?: number
  raw?: any
  sid?: string
}

class ChatLogger {
  rows: IChatRow[] = []
  sid: string

  constructor(sid?: string) {
    this.rows = []
    this.sid = sid || 'sid-' + _.random(0, 10000)
  }

  async logRow(item: IChatRow) {
    if (logAll) logger.log('logRow BG >> ', item.text)
    // just keep count in here
    const minDiv = 1000 * 60
    const minute = Math.floor(Date.now() / minDiv)
    item.count = this.rows.length
    item.minute = minute
    item.hour = Math.floor(minute / 60)
    item.sid = this.sid
    const oneLog = new ChatRowModel(item)
    await oneLog.save()
    // logger.logLine('logRow OK << ', item.text)
    this.rows.push(oneLog)
  }

  // called for incoming events from user
  async logInput(blob) {
    blob.who = blob.who || 'user'
    await this.logRow(blob)
  }

  // have to use old style for each because of async iterators
  async logBlocks(blob: ISlackSection) {
    // logger.logLine('logBlocks', blob)
    try {
      for (const att of blob.attachments) {
        for (const block of att.blocks) {
          let text = ''
          switch (block.type) {
            case 'image':
              text = block.title.text
              break

            case 'section':
              text = block.text.text
              break

            case 'actions':
              for (const elem of block.elements) {
                // buttons have one extra level compared to context
                text += `[${elem.text?.text}]`   // wrap buttons with [ ]
              }
              break

            case 'context':
              for (const elem of block.elements) {
                text += elem.text   // plain text
              }
              break

            default:
              text = 'unknown block type: ' + block.type
              logger.warn(text, block)
              break

          }
          await this.logRow({ who: 'bot', text, type: block.type, raw: block })
        }
      }
    } catch (err) {
      logger.error('logging err', err)
      await this.logRow({ who: 'bot', text: JSON.stringify(blob), blob, type: 'blob' })
    }
  }

  // get lines in text format
  // async getLines() {
  //   const lines: string[] = []
  //   this.rows.forEach((row: IChatRow) => {
  //     let line = [
  //       row.who,
  //       row.text
  //     ].join('\t|')
  //     lines.push(line)
  //   })
  //   const text = lines.join('\n')
  //   logger.log('log', text)
  // }

  // just the text from logs for testing
  tail(lineCount): string[] {
    const len = this.rows.length
    let lines
    if (lineCount === -1) {
      lines = this.rows
    } else {
      lines = this.rows.slice(len - lineCount, len)
    }
    return lines.map(line => line.text)
  }

  tailText(lineCount): string {
    return this.tail(lineCount).join('\n')
  }

}

export { ChatLogger, IChatRow, ChatRowModel }
