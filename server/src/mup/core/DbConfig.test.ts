// const log = console.log

import { DbConfig } from './DbConfig'

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


// testing for these driver properties, a bit dodgy...
// _readyState: 1,
// _closeCalled: false,
// _hasOpened: true,

it('should open db conn in beforeAll', async () => {
  expect(dbConn._readyState).toBe(1)
  expect(dbConn._closeCalled).toBe(false)
  expect(dbConn._hasOpened).toBe(true)

})

it('should close without hanging', async () => {
  await DbConfig.close()
  expect(dbConn._readyState).toBe(0)
  expect(dbConn._closeCalled).toBe(true)
  expect(dbConn._hasOpened).toBe(true)
})
