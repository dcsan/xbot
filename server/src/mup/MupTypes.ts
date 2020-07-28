import Game from 'mup/models/Game'
import { Pal } from '../mup/pal/Pal'

import { HandleCodes } from './models/ErrorHandler'

interface LoadOptions {
  storyName?: string
  pal: Pal
}

// the fail/pass block branches of a full ActionData
interface ActionBranch {
  reply?: string
  imageUrl?: string
  gets?: string
  setHint?: string
  setProps?: string[]
  goto?: string
  passed?: boolean   // runtime result
}

interface ActionIf {
  all: string[]
  any: string[]
}

interface ActionData {
  match: string
  reply?: string
  goto?: string
  // setProps?: string[]  // at the top level as well?

  always?: ActionBranch
  if: ActionIf
  then: ActionBranch
  else: ActionBranch
  // sets: string[]
  // needs: string
  // if?: string[] | string
  // then: ActionBranch
  // else: ActionBranch

  // pass?: ActionBranch
  // fail?: ActionBranch
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
