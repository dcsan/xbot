import { DbConfig } from '../mup/core/DbConfig'

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
