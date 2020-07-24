import _ from 'lodash'
import { RexParser } from './RexParser.js';
import Game from '../models/Game.js';

import TestUtils from '../../lib/TestUtils';
import Logger from '../../lib/Logger.js';

const log = console.log


const context = TestUtils.context
const game = new Game(1234)

beforeEach(async () => {
  context.reset()
  await game.init({ storyName: 'office' })
})

function testRuleSet(rule) {

  rule.tests.forEach(test => {
    // Logger.testLog('test', test)
    let [input, expected] = test
    let result = RexParser.parseRegexRules(input, rule)
    const blob = JSON.stringify(result)
    try {
      expect(result).toEqual(expected)
    } catch (err) {
      Logger.testLog('failed:', {
        rule: rule,
        name: rule.name,
        input,
        expected,
        actual: result,
        groups: result.groups
        // 'result.groups': result?.groups
      })
      throw (err)
    }

  })

}

test('RexParser.actorRules', async () => {
  RexParser.ruleSet.forEach(rule => {
    testRuleSet(rule)
  })
})

test('basicInputParser', async () => {

  let input, parsed

  input = "unlock the chest with the red key"
  parsed = RexParser.basicInputParser(input, game.story.room)
  expect(parsed.actionName).toBe('unlock')
  expect(parsed.itemName).toBe('chest')
  expect(parsed.modifier).toBe('red key')
  expect(parsed.foundItem.cname).toBe('chest')


  input = "ask sid to open the chest"
  parsed = RexParser.basicInputParser(input, game.story.room)
  expect(parsed.actionName).toBe('ask')
  expect(parsed.itemName).toBe('sid')
  expect(parsed.modifier).toBe('open chest')
  expect(parsed.foundItem.cname).toBe('sid')


  input = "talk to sid"
  parsed = RexParser.basicInputParser(input, game.story.room)
  expect(parsed.actionName).toBe('talk')
  expect(parsed.itemName).toBe('sid')
  expect(parsed.modifier).toBe('')
  expect(parsed.foundItem.cname).toBe('sid')

})

test('complex parser', async () => {
  let input, parsed

  input = 'examine the note'

})
