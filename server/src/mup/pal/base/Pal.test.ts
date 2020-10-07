import { Pal } from './Pal'
import { TestEnv } from '../../../lib/TestUtils'
const mongoose = require('mongoose');

let env = new TestEnv()

beforeAll(async () => {
  await env.init()
})

afterAll(async () => {
  await env.close()
})

it('should export and return single line texts', async () => {
  // const env = new TestEnv()
  await env.pal.sendText('this is line one')
  await env.pal.sendText('and a second line')
  // console.log('logs', env.pal.logger.lines)

  // expect(env.pal.getLogLineText(0)).toMatch(/reset game/i)
  // FIXME - new games reset twice
  // expect(env.pal.getLogLineText(1)).toMatch(/reset game/i)
  expect(env.pal.chatLogger.tail(2)[0]).toBe('this is line one')
  expect(env.pal.chatLogger.tail(2)[1]).toBe('and a second line')

})

it('should log inputs', async () => {
  await env.pal.sendText('testing single text')
  // env.pal.sendText('this is line one')
})