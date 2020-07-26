// const Dispatcher = require('../Dispatcher')
import Logger from '../../lib/Logger'
import WordUtils from '../../lib/WordUtils'
// import RouterService from './RouterService'

import { StaticRules, OneRule } from './ParserRules'

const log = console.log

interface RegExpResult {
  groups?: any
}

interface ParserResult {
  parsed?: RegExpResult | null,
  rule?: OneRule    // matched rule
  input?: string
  clean: string
}

const RexParser = {

  // ruleSet: [
  //   {
  //     name: 'sayToActor',
  //     rex: /^(s|say) (?<message>.*) to (?<actor>\w+)$/i,
  //     target: 'actor',
  //     event: 'replyWithDefault',
  //     verb: 'say',
  //     tests: [
  //       ['say welcome to Sid', {
  //         groups: {
  //           message: 'welcome',
  //           actor: 'sid'
  //         },
  //         verb: 'say',
  //         ruleName: 'sayToActor',
  //         event: 'replyWithDefault',
  //         target: 'actor',
  //       }],
  //       ['say How are you? to Sid', {
  //         groups: {
  //           message: 'how are you?',
  //           actor: 'sid'
  //         },
  //         verb: 'say',
  //         ruleName: 'sayToActor',
  //         event: 'replyWithDefault',
  //         target: 'actor',
  //       }]
  //     ],
  //   },

  //   {
  //     name: 'sayToAnyone',
  //     rex: /^(s|say) (?<message>.*)$/i,
  //     target: 'firstActor',
  //     event: 'replyWithDefault',
  //     verb: 'say',
  //     tests: [
  //       ['say welcome', {
  //         groups: {
  //           message: 'welcome',
  //         },
  //         verb: 'say',
  //         ruleName: 'sayToAnyone',
  //         event: 'replyWithDefault',
  //         target: 'firstActor',
  //       }],
  //       ['say How are you?', {
  //         groups: {
  //           message: 'how are you?',
  //         },
  //         verb: 'say',
  //         ruleName: 'sayToAnyone',
  //         event: 'replyWithDefault',
  //         target: 'firstActor',
  //       }]
  //     ],
  //   },


  //   // about a THING
  //   {
  //     name: 'askActorAboutThing',
  //     rex: /^(ask) (?<actor>\w+) (about) (?<thing>.*)$/i,
  //     target: 'actor',
  //     event: 'askAboutThing',
  //     verb: 'about',
  //     tests: [
  //       ["ask Sid about password", {
  //         groups: {
  //           thing: 'password',
  //           actor: 'sid'
  //         },
  //         verb: 'about',
  //         target: 'actor',
  //         event: 'askAboutThing',
  //         ruleName: 'askActorAboutThing'
  //       }],
  //       ["ask Sid about password", {
  //         groups: {
  //           thing: 'password',
  //           actor: 'sid'
  //         },
  //         verb: 'about',
  //         target: 'actor',
  //         event: 'askAboutThing',
  //         ruleName: 'askActorAboutThing'
  //       }],
  //     ],
  //   },

  //   // about a THING
  //   {
  //     name: 'askFirstActorAboutThing',
  //     rex: /^(a|ask) (about) (?<thing>.*)$/i,
  //     target: 'firstActor',
  //     event: 'askAboutThing',
  //     verb: 'about',
  //     tests: [
  //       ["ask about doorbell", {
  //         groups: {
  //           thing: 'doorbell',
  //         },
  //         verb: 'about',
  //         target: 'firstActor',
  //         event: 'askAboutThing',
  //         ruleName: 'askFirstActorAboutThing'
  //       }],
  //       ["ask about more games", {
  //         groups: {
  //           thing: 'more games',
  //         },
  //         verb: 'about',
  //         target: 'firstActor',
  //         event: 'askAboutThing',
  //         ruleName: 'askFirstActorAboutThing'
  //       }],
  //     ],
  //   },

  //   // fall through ask about anything
  //   {
  //     name: 'plainAsk',
  //     rex: /^(ask|tell|hey) (?<actor>\w+) (?<message>.*)$/i,
  //     target: 'actor',
  //     event: 'replyWithDefault',
  //     verb: 'ask',
  //     tests: [
  //       ["ask Sid how are you doing", {
  //         groups: {
  //           message: 'how are you doing',
  //           actor: 'sid'
  //         },
  //         verb: 'ask',
  //         event: 'replyWithDefault',
  //         target: 'actor',
  //         ruleName: 'plainAsk'
  //       }],
  //       ["ask Sid what is your name", {
  //         groups: {
  //           message: 'what is your name',
  //           actor: 'sid'
  //         },
  //         ruleName: 'plainAsk',
  //         verb: 'ask',
  //         event: 'replyWithDefault',
  //         target: 'actor',
  //       }],
  //     ],
  //   },

  // {
  //   name: 'giveActorThing',
  //   rex: /^(give) (?<actor>\w+) (?<thing>.*)$/i,
  //   target: 'actor',
  //   event: 'giveThing',
  //   verb: 'give',
  //   tests: [
  //     ["give Sid the money", {
  //       groups: {
  //         actor: 'sid',
  //         thing: 'money',
  //       },
  //       ruleName: 'giveActorThing',
  //       verb: 'give',
  //       event: 'giveThing',
  //       target: 'actor'
  //     }],
  //     ["give Sid a kiss", {
  //       groups: {
  //         actor: 'sid',
  //         thing: 'kiss',
  //       },
  //       ruleName: 'giveActorThing',
  //       verb: 'give',
  //       event: 'giveThing',
  //       target: 'actor'
  //     }],

  //   ],
  // },

  // {
  //   name: 'giveThingActor',
  //   rex: /^(give) (?<thing>\w+) (to) (?<actor>\w+)$/i,
  //   verb: 'give',
  //   target: 'actor',
  //   event: 'giveThing',
  //   tests: [
  //     ["give the bottle to Sid", {
  //       groups: {
  //         actor: 'sid',
  //         thing: 'bottle',
  //       },
  //       ruleName: 'giveThingActor',
  //       verb: 'give',
  //       event: 'giveThing',
  //       target: 'actor'
  //     }],
  //   ],
  // },

  // // can be any item or actor
  // {
  //   name: 'examineItem',
  //   rex: /^(x|examine|look at|look|l|l at) (?<item>\w+)$/i,
  //   verb: 'examine',
  //   target: 'findThing',
  //   event: 'examine',
  //   tests: [
  //     ["x Sid", {
  //       groups: {
  //         item: 'sid'
  //       },
  //       ruleName: 'examineItem',
  //       verb: 'examine',
  //       event: 'examine',
  //       target: 'findThing'
  //     }],
  //     ["x note", {
  //       groups: {
  //         item: 'note'
  //       },
  //       ruleName: 'examineItem',
  //       verb: 'examine',
  //       event: 'examine',
  //       target: 'findThing'
  //     }],
  //     ["look at desk", {
  //       groups: {
  //         item: 'desk'
  //       },
  //       ruleName: 'examineItem',
  //       verb: 'examine',
  //       event: 'examine',
  //       target: 'findThing'
  //     }],

  //   ],
  // },

  // {
  //   name: 'useThing',
  //   target: 'thing',
  //   event: 'useThing',
  //   ruleName: 'useThing',
  //   verb: 'use',
  //   rexParts: [
  //     '^(?<action>take|use|try|open|put|place|close)',
  //     '(?<thing1>.*)',
  //     '(?<how>on|out of|with|in|into|on|onto|against|inside)',
  //     '(?<thing2>.*)$'
  //   ],
  //   // rex: /^(?<action>take|use|try|open|put|place|close) (?<thing1>.*) (?<how>on|out of|with|in|into|on|onto|against|inside) (?<thing2>.*)$/i,
  //   // rex: /^(?<action>put|place|open) (?<thing1>\w+) (?<how>with|on) (?<thing2>.*)$/,
  //   tests: [
  //     ["open the lock with the key", {
  //       groups: {
  //         action: 'open',
  //         thing1: 'lock',
  //         how: 'with',
  //         thing2: 'key',
  //       },
  //       ruleName: 'useThing',
  //       verb: 'use',
  //       event: 'useThing',
  //       target: 'thing'
  //     }],

  //     ['put the key in the door', {
  //       groups: {
  //         action: 'put',
  //         thing1: 'key',
  //         how: 'in',
  //         thing2: 'door',
  //       },
  //       ruleName: 'useThing',
  //       verb: 'use',
  //       event: 'useThing',
  //       target: 'thing'
  //     }],

  //     ['place the card inside your laptop', {
  //       groups: {
  //         action: 'place',
  //         thing1: 'card',
  //         how: 'inside',
  //         thing2: 'your laptop',
  //       },
  //       ruleName: 'useThing',
  //       verb: 'use',
  //       target: 'thing',
  //       event: 'useThing',
  //     }]
  //   ],
  // },

  // ],

  // parseOne(input, rule) {
  //   input = WordUtils.cheapNormalize(input)
  //   // TODO remove punctuation
  //   let rex = rule.rex
  //   if (!rex) {
  //     // build it
  //     const rexString = rule.rexParts.join(' ')
  //     rex = new RegExp(rexString, 'gim')
  //   }
  //   const match = rex.exec(input)
  //   if (!match) return false
  //   // else

  //   const result = {
  //     ruleName: rule.name,
  //     target: rule.target,
  //     event: rule.event,
  //     verb: rule.verb,
  //     groups: { ...match.groups } // remove null object for test comparison
  //   }
  //   return result
  // },

  // parseRegexRules(input) {
  //   let parsed
  //   RexParser.ruleSet.find(rule => {
  //     const check = RexParser.parseOne(input, rule)
  //     parsed = parsed || check
  //     return check   // exit if found
  //   })
  //   return parsed
  // },


  // /**
  //  * simple parser like this:
  //  * `action` `item` `modifier`
  //  *  open lock with key
  //  *  unlock chest with door
  //  *  lock chest with lock
  //  * @param {*} input
  //  * @param {*} actions
  //  * @param {*} items
  //  * @returns
  //  */
  // basicInputParser(input, room) {
  //   let clean = WordUtils.cheapNormalize(input)
  //   clean = WordUtils.removeStopWords(clean)
  //   const [actionName, itemName, ...modWords] = clean.split(' ')
  //   let foundItem

  //   const modifier = WordUtils.removeStopWords(modWords)
  //   // FIXME parser shouldnt know about 'room'
  //   if (itemName) {
  //     foundItem = room.findThing(itemName)
  //   }
  //   const result = { actionName, itemName, modifier, foundItem }
  //   Logger.logObj('basicParser', { input, result })
  //   return result
  // }

  parseCommands(input: string): ParserResult {
    let clean = WordUtils.cheapNormalize(input)
    clean = WordUtils.removeStopWords(clean)
    let parserResult: ParserResult = {
      input,
      clean,
    }

    let rule: OneRule | undefined = StaticRules.find((oneRule: OneRule) => {
      if (oneRule.rex.test(input)) return true
      return false
    })

    if (rule) {
      const parsed = rule.rex.exec(input)
      // console.log('input', input)
      // console.log('rule', rule)
      // console.log('rule.rex', rule.rex)
      // console.log('parsed', parsed)
      if (parsed) parsed.groups = { ...parsed.groups } // null object
      parserResult.parsed = parsed
      parserResult.rule = rule
      // console.log('parserResult', parserResult)
      Logger.logObj('parser found:', {
        cname: rule.cname,
        groups: parsed?.groups
      })
    }
    return parserResult
  },

  // object.field = value
  parseSetLine(input: string): ParserResult {
    // console.log('setItem', input)
    const rex = /(?<thing>\w*)\.(?<field>\w*) = (?<value>\w*)/
    const parsed = rex.exec(input)
    let result = {
      clean: input,
      parsed: { ...parsed }
    }
    // console.log('result', result)
    return result
  }


}

export { RexParser, ParserResult }
