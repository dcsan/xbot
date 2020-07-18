const _ = require('lodash')

const TestUtils = require('./TestUtils');
const Logger = require('./Logger.js');
const context = TestUtils.context
const WordUtils = require('./WordUtils')

const log = console.log

// test('can find words in sentences', () => {

//   const items = ['lock', 'key', 'blue', 'chest']
//   const text = 'unlock the chest'
//   const result = WordUtils.findWords(text, items)

//   const expected = {
//     item: 'chest',
//     action: 'unlock'
//   }
//   console.log('result', result)
//   expect(result).toBe(expected)
// })

test('basic regex', () => {
  let rex, match
  const text = 'unlock the chest now'
  // direct rex with boundaries
  rex = /(?<item>\block\b|\bchest\b)/gim
  match = rex.exec(text)
  expect(match.groups).toEqual({item: 'chest'}) // PASS OK
})

// test('rex from string', () => {
//   let rex, match
//   const text = 'unlock the chest now'
//   // direct rex with boundaries
//   const rexStr = '(?<item>\block\b|\bchest\b)'
//   rex = new RegExp(rexStr)
//   match = rex.exec(text)
//   expect(match.groups).toEqual({item: 'chest'}) // FAIL
// })

// test('build rex with word boundaries', () => {
//   const text = 'unlock the chest now'
//   const items = ['lock', 'key', 'blue', 'chest']
//   const list = items.join(`\b|\b`)
//   const str = `(?<item>\b${list}\b)`
//   // log({list, str})
//   const rex = new RegExp(str)
//   const match = rex.exec(text)
//   expect(match.groups).toEqual({item: 'lock'}) // FAIL
// })
