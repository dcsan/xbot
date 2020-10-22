import { GameObject } from '../models/GameObject'
import Room from '../models/Room'

import Util from '../../lib/Util'
import { MakeLogger } from '../../lib/LogLib'
import WordUtils from '../../lib/WordUtils'
const logger = new MakeLogger('Synonyms')

interface ISyn {
  base: string
  rex: RegExp
  rooms?: string[]
  called: string
  type: string     // noun|verb
}

let fixedActionAliases: ISyn[] = []
let storyItemAliases: ISyn[] = []

const SynManager = {

  init() {
    SynManager.makeActionSyns()
  },

  // find(base: string): string[] | undefined {
  //   const one = fixedActionAliases.find(elem => elem.base === base)
  //   return one?.syns
  // },

  makeActionSyns() {
    const relPath = 'storydata/shared/synData.yaml'
    const verbs = Util.loadYamlFileFromCdn(relPath)
    fixedActionAliases = []
    // wrap words into a single line for faster regex replacement
    // premature optimization?
    for (let elem of verbs) {
      let rexStr = elem.alias.join('\\b|\\b')
      rexStr = `\\b${rexStr}\\b`  // join just adds between items, still have to bookend it manually
      const rex = new RegExp(rexStr, 'i')
      const syn: ISyn = {
        base: elem.base,
        type: 'verb',
        rex,
        called: elem.alias.join('|')
      }
      fixedActionAliases.push(syn)
    }
    return fixedActionAliases
  },

  all(_room?: string): ISyn[] {
    if (!fixedActionAliases.length) {
      SynManager.init()
    }
    if (!storyItemAliases.length) {
      logger.warn('tried to replace syns before story cacheNames')
    }
    // todo filter on room
    return ([...fixedActionAliases, ...storyItemAliases])
  },

  // build a list of items on loading game
  // TODO - use per room filters
  // but then we have to also use the right cache for each game
  cacheNames(roomList: Room[]) {
    storyItemAliases = []
    roomList.forEach((room: Room) => {
      logger.logObj(`build synCache room [${room.name}]`)
      room.allThings.forEach((item: GameObject) => {
        // logger.log('synItem', item.doc.name, item.doc.called)
        if (item.doc.called) {
          // TODO check double entry
          storyItemAliases.forEach((c: ISyn) => {
            if (c.base === item.doc.name) {
              logger.warn('dupe item', [item.doc.called, c.called])
            }
          })
          const rex = SynManager.makeRexFromLine(item.doc.called)
          const pair: ISyn = {
            base: item.doc.name,
            type: 'noun',
            called: item.doc.called,  // original match string
            rooms: [room.name],  // todo - add to item if its in another room
            rex
          }
          storyItemAliases.push(pair)
        }
      })
    })
    // TODO - add to basic items/verbs
    // console.log('created synPairsCache', synPairsCache)
  },

  makeRexFromLine(line) {
    let rexstr = line.split('|').join('\\b|\\b')
    rexstr = `\\b${rexstr}\\b`
    // console.log('rexstr', rexstr)
    return new RegExp(rexstr, 'ig')
  },

  // fixed command syns eg wear -> take
  replaceSyns(input: string, _room?: string) {
    let clean = input + '' // clone it
    // TODO - pass in room and filter
    const synList = SynManager.all(_room)
    for (const syn of synList) {
      clean = clean.replace(syn.rex, syn.base)
    }
    if (input !== clean) {
      logger.log(`synReplaced:\t [${input}] => [${clean}]`)
    } else {
      logger.log(`NO synReplaced ${input} => ${clean}`)
      // logger.log(`synList`, synList)
    }
    return clean
  },

  simplify(input, _room?: string) {
    input = WordUtils.basicNormalize(input)
    input = SynManager.replaceSyns(input, _room)
    return input
  }

}


export { SynManager, ISyn }
