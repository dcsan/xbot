import Game from 'mup/models/Game'
import { Pal } from '../mup/pal/Pal'

interface LoadOptions {
  storyName?: string
  pal: Pal
}

import {
  ParserResult
} from 'mup/routes/RexParser'

// the fail/pass block branches of a full ActionData
interface ActionBranch {
  reply?: string
  imageUrl?: string
  gets?: string
  setHint?: string
  setProps?: string[]
  goto?: string
}

interface ActionIf {
  all: string[]
  any: string[]
}

interface ActionData {
  match: string
  reply?: string
  goto?: string

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
  handled: boolean
  doc?: ActionData
  history?: string[]
  klass?: string
}

interface SceneEvent {
  pal: Pal,
  result: ParserResult  // parsed, rule
  game: Game
}


export {
  LoadOptions,
  ActionBranch,
  ActionData,
  ActionResult,
  ActionIf,
  SceneEvent,
  Game
}
