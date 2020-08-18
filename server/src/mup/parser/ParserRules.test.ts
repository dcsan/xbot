import { RexParser, ParserResult } from './RexParser'
import WordUtils from '../../lib/WordUtils'
import { Logger } from '../../lib/LogLib'

test('parser rules', () => {
  const pres: ParserResult | undefined = RexParser.parseCommands('goto cell')
  expect(pres?.rule?.cname).toBe('goto')
  expect(pres?.parsed?.groups.roomName).toBe('cell')
})

test('parser joined cmd', () => {
  const pres: ParserResult | undefined = RexParser.parseCommands('@xyzasdfasf has joined the channel')
  expect(pres?.rule?.cname).toBe('userJoined')
})

describe('regex stuff', () => {

  test('strip punctuation', () => {
    const raw = '/hint some, thing!'
    const out = WordUtils.stripPunctuation(raw)
    expect(out).toBe('/hint some thing')
  })

  test('simple rex', () => {
    const tests = [
      {
        rex: /\/hint (?<text>.*)/i,
        str: '/hint thing',
        groups: { text: 'thing' }
      }
    ]
    tests.map(one => {
      const res = one.rex.exec(one.str)
      // console.log('res', res)
      expect(!!res).toBe(true)
      expect(res?.groups).toEqual(one.groups)
    })
  })
})


describe('slash commands', () => {

  test('basic slash command', () => {
    const pres: ParserResult = RexParser.parseCommands('/hint something')
    // note inside parser pu
    expect(pres.rule?.cname).toBe('hint')
    // console.log('pres', pres)
    // console.log('pres.parsed?.groups', pres.parsed?.groups)
    expect(pres.parsed?.groups.text).toMatch('something')
  })

  test('slash command with words that would be replaced', () => {
    const pres: ParserResult = RexParser.parseCommands('/hint under the bed')
    // note inside parser pu
    expect(pres.rule?.cname).toBe('hint')
    expect(pres.parsed?.groups.text).toMatch('bed')
  })

  test('slash command with words that would be replaced', () => {
    const pres: ParserResult = RexParser.parseCommands('/hint what about checking the bed')
    // note inside parser pu
    expect(pres.rule?.cname).toBe('hint')
    expect(pres.parsed?.groups.text).toMatch('what about checking bed')
  })

  test('slash command sentence', () => {
    const pres: ParserResult = RexParser.parseCommands('/hint maybe something is under the bed')
    // note inside parser pu
    expect(pres.rule?.cname).toBe('hint')

    // FIXME pre-parser
    expect(pres.parsed?.groups.text).toMatch('try maybe something is under the bed')
    // expect(pres.parsed?.groups.text).toMatch('try looking under the bed')
  })

})
