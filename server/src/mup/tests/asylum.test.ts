import path from 'path'
import { TestEnv } from '../../lib/TestUtils'
import Util from '../../lib/Util'

describe('asylum story test', () => {

  test('intro sequence', async () => {
    // const { pal, game } = new TestEnv('office')
    const testEnv = new TestEnv()
    const game = await testEnv.loadGame('asylum')
    expect(game.story.doc.title).toMatch(/ESCAPE FROM/i)

  })

  test('cell room basics', async () => {

    const testEnv = new TestEnv()
    const game = await testEnv.loadGame('asylum')
    expect(game.story.doc.title).toMatch(/ESCAPE FROM/i)

    const fp = path.join(__dirname, '../../../cdn/storydata/asylum/tests/asylum.test.yaml')
    const testList = Util.loadYamlFile(fp)
    // console.log('testList', testList)
    for (const roomTest of testList) {
      // console.log('testing room', roomTest.room)
      for (const one of roomTest.tests) {
        await testEnv.checkResponse(one, roomTest.room) // the button
      }
    }
    testEnv.pal.writeLog()

  })

})
