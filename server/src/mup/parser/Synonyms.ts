import Util from '../../lib/Util'
import { MakeLogger } from '../../lib/LogLib'
const logger = new MakeLogger('Synonyms')

interface ISyn {
  base: string
  rex: RegExp
  called?: string
}

let synData: ISyn[] = []

const loadData = () => {
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

}

loadData() // at parse time

// const Synonyms: ISyn[] = [

//   {
//     base: 'take',
//     rex: /\b(t|take|get|wear|grab)\b/
//   },
//   {
//     base: 'goto',
//     rex: /\b(gt|g)\b/
//   },
//   {
//     base: 'examine',
//     rex: /^\b(x|look at|examine|look at the|read|inspect)\b/
//   },

//   // {
//   //   base: 'open',
//   //   rex: /\b(open)\b/
//   // },
//   {
//     base: 'shut',
//     rex: /^\b(shut|close)\b/
//   },
//   // {
//   //   base: 'robe',
//   //   rex: /\b(robe|clothes|gown)\b/
//   // },
//   // {
//   //   base: 'sandals',
//   //   rex: /\b(shoes|sandals)\b/
//   // },
//   // {
//   //   base: 'wardrobe',
//   //   rex: /\b(closet|cupboard|wardrobe|wr)\b/
//   // },
//   {
//     base: 'ask',
//     rex: /^\b(say|tell|scream|speak|shout|ask)\b/
//   },

//   // {
//   //   base: 'use',
//   //   rex: /\b(open|use)\b/
//   // }

// ]


export { synData, ISyn }
