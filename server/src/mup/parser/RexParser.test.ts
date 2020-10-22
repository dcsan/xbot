import { RexParser, ParserResult } from './RexParser';
import { SynManager } from './Synonyms';
// import { MakeLogger } from '../../lib/LogLib';

// const log = console.log

// these are replaced by synData?
// const nounList = ['key', 'chest', 'lamp', 'door']
// const verbList = ['open', 'rub', 'wipe', 'wash', 'use']


// base 'get' command
it('parse get command', () => {
  const input = SynManager.simplify('take the floofy')
  expect(input).toBe('get floofy')
  const pres: ParserResult = RexParser.parseCommands(input)
  expect(pres.pos?.target).toBe('floofy')
  expect(pres.pos?.verb).toBe('get')
})

// // noun phrase command
// xit('should parse common "use" verbs into parsed.verb as "use" ', () => {
//   const pres: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
//   expect(pres.pos?.verb).toBe('use')
//   expect(pres.pos?.target).toBe('chest')

// verb noun1 on|with|at noun2 | use handle on sink
// put soap on bed | verb subject on object
// use soap on faucet | faucet: use soap
// wash face
// wash face with soap
// const strExp = `(?<verb>${ verbs }) (?<noun1>${ nouns })`

// })


// xit('should parse uncommon verbs target into parsed.verb', () => {
//   const pres: ParserResult = RexParser.parseNounVerbs('rub the lamp', nounList)
//   expect(pres.pos?.verb).toBe('rub')
//   expect(pres.pos?.target).toBe('lamp')
// })


it('should parse actionBlock setlines', async () => {
  const pres: ParserResult = RexParser.parseSetLine('door.locked = no')
  expect(pres.parsed?.groups).toBeDefined()
  // console.log('parsed.groups', pres.parsed?.groups)
  expect(pres.parsed?.groups?.target).toBe('door')
  expect(pres.parsed?.groups?.field).toBe('locked')
  expect(pres.parsed?.groups?.value).toBe('no')
})

it('should expand parser phrases', async () => {
  const called = 'red|blue|other color'
  let rexstr = called.split('|').join('\\b|\\b')
  rexstr = `\\b${rexstr}\\b`
  const rex = new RegExp(rexstr)

  const pass = [
    'red', 'blue', 'other color'
  ]

  pass.forEach(word => {
    // console.log('word:', word, 'rexstr:', rexstr, ' rex:', rex)
    expect(rex.test(word)).toBe(true)
  })

  const fails = [
    're', 'other', 'color'
  ]

  fails.forEach(word => {
    // console.log('word:', word, 'rexstr:', rexstr, ' rex:', rex)
    expect(rex.test(word)).toBe(false)
  })

})
