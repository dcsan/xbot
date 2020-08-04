import Game from 'mup/models/Game'
import { Pal } from '../mup/pal/Pal'

import { HandleCodes } from './models/ErrorHandler'

interface LoadOptions {
  storyName?: string
  pal: Pal
}

export interface StateBlock {
  name: string
  imageUrl: string
  short: string
  long: string
  buttons: string[]
}

interface ActionData {
  match: string
  reply?: string
  goto?: string
  always?: ActionBranch
  if: ActionIf
  then: ActionBranch
  else: ActionBranch
}

// the fail/pass block branches of a full ActionData
interface ActionBranch {
  reply?: string
  buttons?: string[]
  imageUrl?: string
  setHint?: string
  setProps?: string[]
  goto?: string
  take?: string[]   // item names
  drop?: string[]   // names
  before?: string[] // actions to call
  after?: string[]
  invoke?: string // javascript function
}

interface ActionIf {
  all: string[]
  any: string[]
}

interface ActionResult {
  handled: HandleCodes
  err?: boolean
  doc?: ActionData
  history?: string[]
  klass?: string
}

export interface ParserResult {
  parsed?: RegExpResult | null,
  pos?: PosResult
  rule?: OneRule    // matched rule
  input?: string
  clean: string
  combos?: string[]   // combinations to try baesd on clean/rebuilt inputs
}

interface SceneEvent {
  pal: Pal,
  pres: ParserResult  // parsed, rule
  game: Game
}

export interface OneRule {
  rex: RegExp
  event: any
  type: string
  cname: string
  extra?: string | undefined
}

// actually RegExpExecArray
export interface RegExpResult {
  groups?: any
}

export interface PosResult {
  verb: string
  target: string
  subject?: string
  adj?: string
}


// minimum verb and target `open window`
// open(verb) window(target) with hammer(subject)

export {
  LoadOptions,
  ActionBranch,
  ActionData,
  ActionResult,
  ActionIf,
  SceneEvent,
  Game
}
