import { DbConfig } from '../core/DbConfig'
import { ChatLogger, ChatRowModel } from './ChatLogger'
const log = console.log
import _ from 'lodash'

beforeAll(async () => {
  log('beforeAll')
  await DbConfig.init()
  log('DONE.beforeAll')
})

afterAll(async () => {
  log('afterAll')
  await DbConfig.close()
  log('DONE.afterAll')
})

it('read and write one row to the DB', async () => {
  // log('do test')
  // await ChatRowModel.deleteMany({})
  const logger = new ChatLogger()
  const text = 'something' + _.random(0, 1000)
  await logger.logInput({ text })
  const row = await ChatRowModel.findOne().sort({ createdAt: -1 })
  expect(row.text).toBe(text)
})
