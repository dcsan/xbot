const RexParser = require('./RexParser.js');

const TestUtils = require('../../lib/TestUtils');
const Logger = require('../../lib/Logger.js');
const context = TestUtils.context

// //@ts-ignore
// test('RexParser.actorMessages', async () => {

//   // const route = RouteMatchers.ask
//   // Logger.testLog('route', route)

//   RexParser.actorRules.forEach(route => {

//     route.tests.forEach(test => {
//       // Logger.testLog('test', test)
//       const [input, output] = test
//       const result = route.rex.exec(input)
//       if (!result || !result.groups) {
//         Logger.testLog('failed to find groups in route', route.name)
//         Logger.testLog('input:', input)
//         Logger.testLog('expect:', output)
//         Logger.testLog('result:', result)
//       }
//       expect(result.groups.actor).toBe('Sid')
//       expect(result.groups.message).toBe(output)
//     })

//   })

// })

test('RexParser.actorRules', async () => {

  // const route = RouteMatchers.ask
  // Logger.testLog('route', route)

  RexParser.actorRules.forEach(rule => {

    rule.tests.forEach(test => {
      // Logger.testLog('test', test)
      let [input, expected] = test
      let result = RexParser.parse(input, rule)

      try {
        Object.keys(expected).forEach( key => {
          expect(result.groups[key]).toBe(expected[key])
        })
      } catch (err) {
        Logger.testLog('failed:', {
          rule: rule,
          name: rule.name,
          input,
          expected,
          'result.groups': result?.groups
        })
        throw(err)
      }

    })

  })

})



test('RexParser.thingMessages', async () => {

  // const route = RouteMatchers.ask
  // Logger.testLog('route', route)

  RexParser.actionRules.forEach(rule => {

    rule.tests.forEach(test => {
      // Logger.testLog('test', test)
      let [input, expected] = test
      let result = RexParser.parse(input, rule)

      if (!result || !result.groups) {
        Logger.testLog('failed:', {
          rule: rule,
          name: rule.name,
          input,
          expected,
          'result.groups': result?.groups
        })
      }
      // let it fail
      expect(result.groups.action).toBe(expected.action)
      expect(result.groups.thing1).toBe(expected.thing1)
      expect(result.groups.thing1).toBe(expected.thing1)

    })

  })

})
