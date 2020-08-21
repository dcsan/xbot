import Util from '../../lib/Util'
import { MakeLogger } from '../../lib/LogLib'
const logger = new MakeLogger('Synonyms')

interface ISyn {
  base: string
  rex: RegExp
  syns?: string[]
  called?: string
}

let synData: ISyn[] = []

const SynManager = {
  init() {
    const relPath = 'storydata/shared/synData.yaml'
    const data = Util.loadYamlFileFromCdn(relPath)
    synData = data
    // wrap words into a single line for faster regex replacement
    // premature optimization?
    for (let elem of data) {
      let rexStr = elem.syns.join('\\b|\\b')
      rexStr = `\\b${rexStr}\\b`  // join just adds between items, still have to bookend it manually
      const rex = new RegExp(rexStr, 'gi')
      // console.log('rexStr', rexStr)
      // console.log('rex', rex)
      elem.rex = rex
    }
    return synData
  },

  find(base: string): string[] | undefined {
    const one = synData.find(elem => elem.base === base)
    return one?.syns
  },

  all() {
    return synData
  },

  // all basic in-game verbs
  // TODO - move to yaml file
  verbList() {
    return [
      'use',
      'move',
      'wear',
      'drink',
      'rub',
      'drop',
      'lock',
      'unlock',
      'look at',
      'look',
      'open'
    ]
  },

  // to be used to form complex regex
  verbsStr(): string {
    return SynManager.verbList().join('|')
  }


}

SynManager.init()

export { SynManager, ISyn }
