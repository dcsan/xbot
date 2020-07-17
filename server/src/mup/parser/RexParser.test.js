const _ = require('lodash')
const RexParser = require('./RexParser.js');

const TestUtils = require('../../lib/TestUtils');
const Logger = require('../../lib/Logger.js');
const context = TestUtils.context


function testRuleSet (rule) {

  rule.tests.forEach(test => {
    // Logger.testLog('test', test)
    let [input, expected] = test
    let result = RexParser.parse(input, rule)
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

// test('RexParser.thingMessages', async () => {

//   // const route = RouteMatchers.ask
//   // Logger.testLog('route', route)

//   RexParser.actionRules.forEach(rule => {
//     testRuleSet(rule)
//   })

// })
