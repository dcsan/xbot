import { RexParser, ParserResult } from './RexParser';
// import { Logger } from '../../lib/Logger';

const log = console.log

const nounList = ['key', 'chest', 'table lamp', 'door']
const verbList = ['open', 'rub', 'wipe', 'wash']

// base 'get' command
it('parse get command', () => {
  const pres: ParserResult = RexParser.parseCommands('get the floofy')
  expect(pres.pos?.target).toBe('floofy')
  expect(pres.pos?.verb).toBe('take')
})

// noun phrase command
it('should parse verb target into parsed.pos', () => {
  const pres: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
  expect(pres.pos?.target).toBe('chest')
  expect(pres.pos?.verb).toBe('open')
})


it('should parse verb target into parsed.pos', () => {
  const pres: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
  expect(pres.pos?.target).toBe('chest')
  expect(pres.pos?.verb).toBe('open')
})


it('should parse actionBlock setlines', async () => {
  const pres: ParserResult = RexParser.parseSetLine('door.locked = no')
  expect(pres.parsed?.groups).toBeDefined()
  console.log('parsed.groups', pres.parsed?.groups)
  expect(pres.parsed?.groups?.target).toBe('door')
  expect(pres.parsed?.groups?.field).toBe('locked')
  expect(pres.parsed?.groups?.value).toBe('no')
})

it('should reduce vocab', async () => {
  const clean = RexParser.reduceVocab('t gown')
  expect(clean).toBe('take gown')
})

it('should not mess up embedded words', async () => {
  const clean = RexParser.reduceVocab('take closet')
  expect(clean).toBe('take closet')
})

