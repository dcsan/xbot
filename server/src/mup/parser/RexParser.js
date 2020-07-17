const Dispatcher = require('../Dispatcher')
const Logger = require('../../lib/Logger')

const RexParser = {

  ruleSet: [
    {
      name: 'sayToActor',
      rex: /^(s|say) (?<message>.*) to (?<actor>\w+)$/i,
      target: 'actor',
      event: 'replyWithDefault',
      verb: 'say',
      tests: [
        ['say welcome to Sid', {
          groups: {
            message: 'welcome',
            actor: 'sid'
          },
          verb: 'say',
          ruleName: 'sayToActor',
          event: 'replyWithDefault',
          target: 'actor',
        }],
        ['say How are you? to Sid', {
          groups: {
            message: 'how are you?',
            actor: 'sid'
          },
          verb: 'say',
          ruleName: 'sayToActor',
          event: 'replyWithDefault',
          target: 'actor',
        }]
      ],
    },

    {
      name: 'sayToAnyone',
      rex: /^(s|say) (?<message>.*)$/i,
      target: 'firstActor',
      event: 'replyWithDefault',
      verb: 'say',
      tests: [
        ['say welcome', {
          groups: {
            message: 'welcome',
          },
          verb: 'say',
          ruleName: 'sayToAnyone',
          event: 'replyWithDefault',
          target: 'firstActor',
        }],
        ['say How are you?', {
          groups: {
            message: 'how are you?',
          },
          verb: 'say',
          ruleName: 'sayToAnyone',
          event: 'replyWithDefault',
          target: 'firstActor',
        }]
      ],
    },


    // about a THING
    {
      name: 'askActorAboutThing',
      rex: /^(ask) (?<actor>\w+) (about) (?<thing>.*)$/i,
      target: 'actor',
      event: 'askAboutThing',
      verb: 'about',
      tests: [
        ["ask Sid about password", {
          groups: {
            thing: 'password',
            actor: 'sid'
          },
          verb: 'about',
          target: 'actor',
          event: 'askAboutThing',
          ruleName: 'askActorAboutThing'
        }],
        ["ask Sid about password", {
          groups: {
            thing: 'password',
            actor: 'sid'
          },
          verb: 'about',
          target: 'actor',
          event: 'askAboutThing',
          ruleName: 'askActorAboutThing'
        }],
      ],
    },

    // about a THING
    {
      name: 'askFirstActorAboutThing',
      rex: /^(a|ask) (about) (?<thing>.*)$/i,
      target: 'firstActor',
      event: 'askAboutThing',
      verb: 'about',
      tests: [
        ["ask about doorbell", {
          groups: {
            thing: 'doorbell',
          },
          verb: 'about',
          target: 'firstActor',
          event: 'askAboutThing',
          ruleName: 'askFirstActorAboutThing'
        }],
        ["ask about more games", {
          groups: {
            thing: 'more games',
          },
          verb: 'about',
          target: 'firstActor',
          event: 'askAboutThing',
          ruleName: 'askFirstActorAboutThing'
        }],
      ],
    },

    // fall through ask about anything
    {
      name: 'plainAsk',
      rex: /^(ask|tell) (?<actor>\w+) (?<message>.*)$/i,
      target: 'actor',
      event: 'replyWithDefault',
      verb: 'ask',
      tests: [
        ["ask Sid how are you doing", {
          groups: {
            message: 'how are you doing',
            actor: 'sid'
          },
          verb: 'ask',
          event: 'replyWithDefault',
          target: 'actor',
          ruleName: 'plainAsk'
        }],
        ["ask Sid what is your name", {
          groups: {
            message: 'what is your name',
            actor: 'sid'
          },
          ruleName: 'plainAsk',
          verb: 'ask',
          event: 'replyWithDefault',
          target: 'actor',
        }],
      ],
    },

    {
      name: 'giveActorThing',
      rex: /^(give) (?<actor>\w+) (?<thing>.*)$/i,
      target: 'actor',
      event: 'giveThing',
      verb: 'give',
      tests: [
        ["give Sid the money", {
          groups: {
            actor: 'sid',
            thing: 'money',
          },
          ruleName: 'giveActorThing',
          verb: 'give',
          event: 'giveThing',
          target: 'actor'
        }],
        ["give Sid a kiss", {
          groups: {
            actor: 'sid',
            thing: 'kiss',
          },
          ruleName: 'giveActorThing',
          verb: 'give',
          event: 'giveThing',
          target: 'actor'
        }],

      ],
    },

    {
      name: 'giveThingActor',
      rex: /^(give) (?<thing>\w+) (the|to) (?<actor>\w+)$/i,
      verb: 'give',
      target: 'actor',
      event: 'giveThing',
      tests: [
        ["give the bottle to Sid", {
          groups: {
            actor: 'sid',
            thing: 'bottle',
          },
          ruleName: 'giveThingActor',
          verb: 'give',
          event: 'giveThing',
          target: 'actor'
        }],
      ],
    },

    {
      name: 'examineActor',
      rex: /^(x|examine) (?<actor>\w+)$/i,
      verb: 'examine',
      target: 'firstActor',
      event: 'examine',
      tests: [
        ["x Sid", {
          groups: {
            actor: 'sid'
          },
          ruleName: 'examineActor',
          verb: 'examine',
          event: 'examine',
          target: 'firstActor'
        }],
      ],
    },

    {
      name: 'useThing',
      target: 'thing',
      event: 'useThing',
      ruleName: 'useThing',
      verb: 'use',
      rexParts: [
        '^(?<action>take|use|try|open|put|place|close)',
        '(?<thing1>.*)',
        '(?<how>on|out of|with|in|into|on|onto|against|inside)',
        '(?<thing2>.*)$'
      ],
      // rex: /^(?<action>take|use|try|open|put|place|close) (?<thing1>.*) (?<how>on|out of|with|in|into|on|onto|against|inside) (?<thing2>.*)$/i,
      // rex: /^(?<action>put|place|open) (?<thing1>\w+) (?<how>with|on) (?<thing2>.*)$/,
      tests: [
        ["open the lock with the key", {
          groups: {
            action: 'open',
            thing1: 'lock',
            how: 'with',
            thing2: 'key',
          },
          ruleName: 'useThing',
          verb: 'use',
          event: 'useThing',
          target: 'thing'
        }],

        ['put the key in the door', {
          groups: {
            action: 'put',
            thing1: 'key',
            how: 'in',
            thing2: 'door',
          },
          ruleName: 'useThing',
          verb: 'use',
          event: 'useThing',
          target: 'thing'
        }],

        ['place the card inside your laptop', {
          groups: {
            action: 'place',
            thing1: 'card',
            how: 'inside',
            thing2: 'your laptop',
          },
          ruleName: 'useThing',
          verb: 'use',
          target: 'thing',
          event: 'useThing',
        }]
      ],
    }

  ],

  parse (input, rule) {
    input = input.replace(/the |a |an |that /gim, '')  // these just get in the way
    input = input.toLowerCase()
    // TODO remove punctuation
    let rex = rule.rex
    if (!rex) {
      // build it
      const rexString = rule.rexParts.join(' ')
      rex = new RegExp(rexString, 'gim')
    }
    const match = rex.exec(input)
    if (!match) return false
    // else

    const result = {
      ruleName: rule.name,
      target: rule.target,
      event: rule.event,
      verb: rule.verb,
      groups: {...match.groups} // remove null object for test comparison
    }
    return result
  },

  parseRules (input, context) {
    let reply
    RexParser.ruleSet.some(rule => {
      rule.tests.some(test => {
        reply = RexParser.parse(input, rule)
        if (reply) {
          return true   // inner some
        }
      })
      if (reply) return true  // to break the some continue outer loop
    })
    return reply
  }

}

module.exports = RexParser
