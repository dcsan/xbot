import { RexParser, ParserResult } from './RexParser';
import { Logger } from '../../lib/Logger';

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
  expect(pres.parsed?.groups?.target).toBe('door')
  expect(pres.parsed?.groups?.field).toBe('locked')
  expect(pres.parsed?.groups?.value).toBe('no')
})

it('should reduce vocab', async () => {
  const clean = RexParser.reduceVocab('t gown')
  expect(clean).toBe('take robe')
})

it('should not mess up embedded words', async () => {
  const clean = RexParser.reduceVocab('take closet')
  expect(clean).toBe('take wardrobe')
})


// it('should parse verb target into parsed.pos', () => {

//   const nounList = ['key', 'chest', 'table lamp', 'door']
//   const result: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
//   expect(result.pos?.target).toBe('chest')
//   expect(result.pos?.verb).toBe('open')

// })


// function testRuleSet(rule) {

//   rule.tests.forEach(test => {
//     // Logger.testLog('test', test)
//     let [input, expected] = test
//     let result = RexParser.parseRegexRules(input, rule)
//     const blob = JSON.stringify(result)
//     try {
//       expect(result).toEqual(expected)
//     } catch (err) {
//       Logger.testLog('failed:', {
//         rule: rule,
//         name: rule.name,
//         input,
//         expected,
//         actual: result,
//         groups: result.groups
//         // 'result.groups': result?.groups
//       })
//       throw (err)
//     }

//   })

// }

// test('RexParser.actorRules', async () => {
//   RexParser.ruleSet.forEach(rule => {
//     testRuleSet(rule)
//   })
// })

// test('basicInputParser', async () => {

//   let input, parsed

//   input = "unlock the chest with the red key"
//   parsed = RexParser.basicInputParser(input, game.story.room)
//   expect(parsed.actionName).toBe('unlock')
//   expect(parsed.itemName).toBe('chest')
//   expect(parsed.modifier).toBe('red key')
//   expect(parsed.foundItem.cname).toBe('chest')


//   input = "ask sid to open the chest"
//   parsed = RexParser.basicInputParser(input, game.story.room)
//   expect(parsed.actionName).toBe('ask')
//   expect(parsed.itemName).toBe('sid')
//   expect(parsed.modifier).toBe('open chest')
//   expect(parsed.foundItem.cname).toBe('sid')


//   input = "talk to sid"
//   parsed = RexParser.basicInputParser(input, game.story.room)
//   expect(parsed.actionName).toBe('talk')
//   expect(parsed.itemName).toBe('sid')
//   expect(parsed.modifier).toBe('')
//   expect(parsed.foundItem.cname).toBe('sid')

// })

// test('complex parser', async () => {
//   let input, parsed

//   input = 'examine the note'

// })

