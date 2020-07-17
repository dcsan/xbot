const Dispatcher = require('../Dispatcher')
const Logger = require('../../lib/Logger')

const RexParser = {

  ruleSet: [
    {
      name: 'sayTo',
      rex: /^(s|say) (?<message>.*) to (?<actor>\w+)$/i,
      target: 'actor',
      event: 'replyWithDefault',
      tests: [
        ['say welcome to Sid', {
          groups: {
            message: 'welcome',
            actor: 'sid'
          },
          event: 'replyWithDefault',
          target: 'actor',
        }],
        ['say How are you? to Sid', {
          groups: {
            message: 'how are you?',
            actor: 'sid'
          },
          event: 'replyWithDefault',
          target: 'actor',
        }]
      ],
    },

    // about a THING
    {
      name: 'askAbout',
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
        }],
        ["ask Sid about password", {
          groups: {
            thing: 'password',
            actor: 'sid'
          },
          verb: 'about',
          target: 'actor',
          event: 'askAboutThing',
        }],
      ],
    },

    // fall through ask about anything
    {
      name: 'plainAsk',
      rex: /^(ask|tell) (?<actor>\w+) (?<message>.*)$/i,
      target: 'actor',
      event: 'replyWithDefault',
      tests: [
        ["ask Sid how are you doing", {
          groups: {
            message: 'how are you doing',
            actor: 'sid'
          },
          event: 'replyWithDefault',
          target: 'actor'
        }],
        ["ask Sid what is your name", {
          groups: {
            message: 'what is your name',
            actor: 'sid'
          },
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
      tests: [
        ["give Sid the money", {
          groups: {
            actor: 'sid',
            thing: 'money',
          },
          event: 'giveThing',
          target: 'actor'
        }],
        ["give Sid a kiss", {
          groups: {
            actor: 'sid',
            thing: 'kiss',
          },
          event: 'giveThing',
          target: 'actor'
        }],

      ],
    },

    {
      name: 'giveThingActor',
      rex: /^(give) (?<thing>\w+) (the|to) (?<actor>\w+)$/i,
      tests: [
        ["give the bottle to Sid", {
          groups: {
            actor: 'sid',
            thing: 'bottle',
          },
          event: 'giveThing',
          target: 'actor'
        }],
      ],
      target: 'actor',
      event: 'giveThing',
    },

    {
      name: 'useThing',
      target: 'thing',
      event: 'useThing',
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
