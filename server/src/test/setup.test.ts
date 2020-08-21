import { DbConfig } from '../mup/core/DbConfig'

// this is used to wrap all the other tests and close the DbConn after the whole suite has run

let dbConn

beforeAll(async () => {
  // log('beforeAll')
  dbConn = await DbConfig.init()
  // log('DONE.beforeAll')
})

afterAll(async () => {
  // log('afterAll')
  await DbConfig.close()
  // log('DONE.afterAll')
})


it('should setup and tear down tests', () => {
  expect(true).toBe(true)
})

