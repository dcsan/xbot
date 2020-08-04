// const Dispatcher = require('../Dispatcher')
import { Logger } from '../../lib/Logger'
import WordUtils from '../../lib/WordUtils'
// import RouterService from './RouterService'

import { StaticRules, RuleSpec, OneRule, ReplaceItems } from './ParserRules'
import {
  PosResult,
  ParserResult,
  RegExpResult
} from '../MupTypes'

const log = console.log

const ParserConfig = {
  verbs: 'take|move|get|open|wear|drink|rub|drop|lock|unlock'
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

  reduceVocab(input: string) {
    for (const rep of ReplaceItems) {
      input = input.replace(rep.rex, rep.base)
    }
    return input
  },

  parseCommands(input: string): ParserResult {
    let clean = WordUtils.basicNormalize(input)
    clean = RexParser.reduceVocab(clean)
    Logger.log('clean', clean)
    let pres: ParserResult = {
      input: clean,
      clean,
    }

    // find first match
    let rule: OneRule | undefined = StaticRules.find((oneRule: OneRule) => {
      if (oneRule.rex.test(clean)) return true
      return false
    })

    if (rule) {
      const parsed = rule.rex.exec(clean)
      // log('parsed', clean, parsed)
      if (parsed) {
        parsed.groups = { ...parsed.groups } // null object

        // @ts-ignore   assuming the right fields are found in .groups
        pres.pos = { ...parsed.groups }
        pres.parsed = parsed
        pres.rule = rule
      }
    } else {
      // TODO - global counter for missed rules?
      // so we can show a hint?
      Logger.log('no rule matched for input', clean)  // could be a room action instead
    }
    // Logger.log('pres', pres)
    return pres
  },

  // object.field = value
  parseSetLine(input: string): ParserResult {
    // console.log('setItem', input)
    const rex = /(?<target>\w*)\.(?<field>\w*) = (?<value>\w*)/
    const parsed = rex.exec(input)
    let pres: ParserResult = {
      clean: input,
      parsed: {
        groups: { ...parsed?.groups }
      },
      // @ts-ignore
      pos: { ...parsed?.groups }
    }
    return pres
  },

  // give a nounList of objects in game to help with parsing
  parseNounVerbs(input: string, nounList: string[], verbList?: string[]): ParserResult {
    let clean = WordUtils.basicNormalize(input)
    clean = RexParser.reduceVocab(clean)
    const nouns = nounList.join('|')
    const verbs = verbList ? verbList.join('|') : ParserConfig.verbs
    const strExp = `(?<verb>${verbs}) (?<target>${nouns})`
    // verb noun1 on|with|at noun2 | use handle on sink
    // put soap on bed | verb subject on object
    // use soap on faucet | faucet: use soap
    // wash face
    // wash face with soap
    // const strExp = `(?<verb>${ verbs }) (?<noun1>${ nouns })`
    const rex = new RegExp(strExp, 'im')
    // console.log(strExp, 'rex')
    const parsed = rex.exec(clean)
    let pres: ParserResult = {
      clean, input, parsed
    }

    if (parsed?.groups) {
      parsed.groups = { ...parsed.groups }

      // @ts-ignore
      pres.pos = { ...parsed.groups }

      // try just the verb, eg removing the item
      // so 'wear robe' becomes robe => `wear`
      const verb = parsed.groups?.verb
      pres.combos = [
        clean,
        verb
        // `${ pos.verb } ${ subject }`
      ]
    }
    return pres
  }


}

export { RexParser, ParserResult }
