const mongoose = require('mongoose');
import path from 'path'
import { TestEnv } from '../../lib/TestUtils'
import Util from '../../lib/Util'

let env = new TestEnv()

beforeAll(async () => {
  await env.init()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('asylum story test', () => {

  test('intro sequence', async () => {
    // const { pal, game } = new TestEnv('office')
    const game = await env.loadGame('asylum')
    expect(game.story.doc.title).toMatch(/ESCAPE FROM/i)

  })

  xtest('cell room basics', async () => {

    const game = await env.loadGame('asylum')
    expect(game.story.doc.title).toMatch(/ESCAPE FROM/i)

    const fp = path.join(__dirname, '../../../cdn/storydata/asylum/tests/asylum.test.yaml')
    const testList = Util.loadYamlFile(fp)
    // console.log('testList', testList)
    for (const roomTest of testList) {
      // console.log('testing room', roomTest.room)
      for (const one of roomTest.tests) {
        await env.checkResponse(one, roomTest.room) // the button
      }
    }

  })

})
