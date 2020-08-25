import { dfQuery, INlpResult, INlpEntity } from './dflow'

import { MakeLogger } from '../../lib/LogLib'
const logger = new MakeLogger('dftest')

const queries = [
  'open wardrobe',
]

test('index', async () => {
  const dfResult: INlpResult = await dfQuery('open wardrobe')
  logger.logObj('dfresult', dfResult, { force: true })
  expect(dfResult.intentName).toBe('openThing')
  expect(dfResult.entities[0].name).toBe('roomthing')
  expect(dfResult.entities[0].value).toBe('wardrobe')
  expect(dfResult.confidence).toBe(1)
  expect(dfResult.firstEnt).toBe('wardrobe')
})
