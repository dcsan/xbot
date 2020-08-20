import path from 'path'
import { MakeLogger } from '../../lib/LogLib'
import { TestEnv } from '../../lib/TestUtils'
import Util from '../../lib/Util'

const logger = new MakeLogger('asylum.test')

let env = new TestEnv()

beforeEach(async () => {
  await env.init()
  await env.resetChatLogs()
})

afterAll(async () => {
  await env.close()
})

describe('asylum story test', () => {

  test('intro sequence', async () => {
    // const { pal, game } = new TestEnv('office')
    const game = await env.loadGame('asylum')
    expect(game.story.doc.title).toMatch(/ESCAPE FROM/i)
  })

  test('cell room basics', async () => {

    const game = await env.loadGame('asylum')

    const fp = path.join(__dirname, '../../../cdn/storydata/asylum/tests/asylum.test.yaml')
    const testList = Util.loadYamlFile(fp)
    // console.log('testList', testList)
    for (const roomTest of testList) {
      // console.log('testing room', roomTest.room)
      // await game.story.gotoRoom(roomTest.room)
      let c = 0
      for (const one of roomTest.tests) {
        c++
        await env.checkResponse(one, roomTest.room) // the button
      }
    }

  })

})
