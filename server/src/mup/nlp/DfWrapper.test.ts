import { dfQuery, INlpResult, INlpEntity } from './DfWrapper'

import { MakeLogger } from '../../lib/LogLib'
const logger = new MakeLogger('dftest')

const queries = [
  'open wardrobe',
]

test('simple query', async () => {
  const dfResult: INlpResult = await dfQuery('open wardrobe')
  // logger.logObj('dfresult', dfResult, { force: true })
  expect(dfResult.intentName).toBe('openThing')
  expect(dfResult.entities[0].name).toBe('roomthing')
  expect(dfResult.entities[0].value).toBe('wardrobe')
  expect(dfResult.confidence).toBe(1)
  expect(dfResult.firstEnt).toBe('wardrobe')
})


test('more complex', async () => {
  const dfResult: INlpResult = await dfQuery('look inside the desk')
  logger.logObj('dfresult', dfResult, { force: true })
  expect(dfResult.intentName).toBe('openThing')
  expect(dfResult.entities[0].name).toBe('roomthing')
  expect(dfResult.entities[0].value).toBe('desk')
  expect(dfResult.confidence).toBe(1)
  expect(dfResult.textResponse).toBe('open desk')
})



test('more complex 2', async () => {
  const dfResult: INlpResult = await dfQuery('take the poster off the wall')
  logger.logObj('dfresult', dfResult, { force: true })
  expect(dfResult.intentName).toBe('getThing')
  expect(dfResult.entities[0].name).toBe('roomthing')
  expect(dfResult.entities[0].value).toBe('poster')
  expect(dfResult.entities[1].value).toBe('wall')
  expect(dfResult.confidence).toBe(1)
  expect(dfResult.textResponse).toBe('get poster and wall') // fix me
})
