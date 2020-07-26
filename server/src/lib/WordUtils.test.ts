import _ from 'lodash'

import Logger from './Logger.js';
import WordUtils from './WordUtils'

const log = console.log

test('basic regex', () => {
  let rex, match
  const text = 'unlock the chest now'
  // direct rex with boundaries
  rex = /(?<item>\block\b|\bchest\b)/gim
  match = rex.exec(text)
  expect(match.groups).toEqual({ item: 'chest' }) // PASS OK
})
