import { TestEnv } from './TestUtils'
import * as _ from 'lodash'
import Util from './Util'

it('should create a test env', async () => {
  const testEnv = new TestEnv()
  const game = await testEnv.loadGame('office')
  expect(game.story.storyName).toBe('office')
})

it('should merge objects', () => {
  const one = {
    rooms: [
      {
        name: 'office'
      }
    ]
  }

  const two = {
    rooms: [
      {
        name: 'cell'
      }
    ]
  }

  const doc = {
    rooms: []
  }

  // console.log('one.rooms', one)
  const three = {
    // @ts-ignore
    rooms: doc.rooms.concat(one.rooms, two.rooms)
  }

  const merged = _.merge(one, two)
  const all = {
    rooms: [...one.rooms, ...two.rooms]
  }

  // console.log('one', one)
  // console.log('two', two)
  // console.log('merged', merged)
  // console.log('all', all)
  expect(all.rooms.length).toBe(2)
  expect(three.rooms.length).toBe(2)

})

it('should ingore commands start with punctuation', async () => {
  const tests = [
    '.something',
    '-start',
    ' huh',
    '"stuff',
    'one sentence with over five words',
    "'apostro",
    '"look',
    `\\look`
  ]
  tests.forEach(test => {
    expect(Util.shouldIgnore(test)).toBe(true)
  })

  const checks = [
    'something else',
    'look'
  ]
  checks.forEach(test => {
    expect(Util.shouldIgnore(test)).toBe(false)
  })

})
