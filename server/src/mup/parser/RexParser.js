const Dispatcher = require('../Dispatcher')
const Logger = require('../../lib/Logger')

const RexParser = {

  actorRules: [
    {
      name: 'sayTo',
      rex: /^(s|say) (?<message>.*) to (?<actor>\w+)$/i,
      event: Dispatcher.ask,
      tests: [
        ['say welcome to Sid', {
          message: 'welcome'
        }],
        ['say How are you? to Sid', {
          message: 'How are you?'
        }]
      ]
    },

    {
      name: 'askAbout',
      rex: /^(ask|tell) (?<actor>.*) (?:to|about the|about) (?<message>.*)$/i,
      tests: [
        ["ask Sid about password", {
          message: 'password'
        }],
        ["tell Sid to turn off the light", {
          actor: 'Sid',
          message: 'turn off light'
        }],
        ["ask Sid about the password", {
          actor: 'Sid',
          message: 'password'
        }],
        ["tell Sid to shut up!", {
          actor: 'Sid',
          message: 'shut up!'
        }],
      ],
      event: Dispatcher.ask,
    },

    {
      name: 'giveActorThing',
      rex: /^(give) (?<actor>\w+) (?<thing>.*)$/i,
      tests: [
        ["give Sid the money", {
          actor: 'Sid',
          thing: 'money'
        }],
        ["give Sid a kiss", {
          actor: 'Sid',
          thing: 'kiss'
        }],

      ],
      event: Dispatcher.give,
    },

    {
      name: 'giveThingActor',
      rex: /^(give) (?<thing>\w+) (the|to) (?<actor>\w+)$/i,
      tests: [
        ["give the money to Sid", {
          thing: 'money',
          actor: 'Sid'
        }],
      ],
      event: Dispatcher.ask,
    }

  ],

  actionRules: [
    {
      name: 'useThing',
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
          action: 'open',
          thing1: 'lock',
          how: 'with',
          thing2: 'key'
        }],

        ['put the key in the door', {
          action: 'put',
          thing1: 'key',
          how: 'in',
          thing2: 'door'
        }],

        ['place the card inside your laptop', {
          action: 'place',
          thing1: 'card',
          how: 'inside',
          thing2: 'your laptop'
        }]

      ],
      event: Dispatcher.ask,
    }

  ],

  parse (input, rule) {
    input = input.replace(/the |a |an |that /gim, '')  // these just get in the way
    let rex = rule.rex
    if (!rex) {
      // build it
      const rexString = rule.rexParts.join(' ')
      rex = new RegExp(rexString, 'gim')
    }
    const result = rex.exec(input)
    return result
  }

}

module.exports = RexParser
