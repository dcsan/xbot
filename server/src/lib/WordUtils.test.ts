import _ from 'lodash'

import { Logger } from './Logger.js';
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



test('how much stopwords', () => {
  const checks = [
    ['get the soap', 'get soap'],
    ['soap take an egg', 'soap take egg'],
    ['a bug is on the window', 'bug on window']
  ]
  checks.forEach(check => {
    const [input, exp] = check
    const clean = WordUtils.basicNormalize(input)
    expect(clean).toEqual(exp)
  })
})
