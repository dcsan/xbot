import { RexParser, ParserResult } from './RexParser';
import Logger from '../../lib/Logger';

const log = console.log

const nounList = ['key', 'chest', 'table lamp', 'door']
const verbList = ['open', 'rub', 'wipe', 'wash']

// base 'get' command
it('parse get command', () => {
  const result: ParserResult = RexParser.parseCommands('get the floofy')
  expect(result.pos?.target).toBe('floofy')
  expect(result.pos?.verb).toBe('get')
})

// noun phrase command
it('should parse verb target into parsed.pos', () => {
  const result: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
  expect(result.pos?.target).toBe('chest')
  expect(result.pos?.verb).toBe('open')
})


it('should parse verb target into parsed.pos', () => {
  const result: ParserResult = RexParser.parseNounVerbs('open the chest', nounList)
  expect(result.pos?.target).toBe('chest')
  expect(result.pos?.verb).toBe('open')
})


it('should parse actionBlock setlines', async () => {
  const res: ParserResult = RexParser.parseSetLine('door.locked = no')
  expect(res.parsed?.groups).toBeDefined()
  expect(res.parsed?.groups?.thing).toBe('door')
  expect(res.parsed?.groups?.field).toBe('locked')
  expect(res.parsed?.groups?.value).toBe('no')
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

