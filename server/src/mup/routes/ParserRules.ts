import { RouterService } from './RouterService'
import AppConfig from '../../lib/AppConfig'

import Player from '../models/Player'

import { OneRule } from '../MupTypes'

interface ReplacePair {
  rex: RegExp
  base: string
}

const ReplaceItems = [
  {
    base: 'take',
    rex: /\b(t|take|get|wear|grab)\b/
  },
  {
    base: 'goto',
    rex: /\b(gt|g)\b/
  },
  {
    base: 'examine',
    rex: /\b(x|look at|examine|look at the)\b/
  },

  // {
  //   base: 'open',
  //   rex: /\b(open)\b/
  // },
  {
    base: 'shut',
    rex: /\b(shut|close)\b/
  },
  // {
  //   base: 'robe',
  //   rex: /\b(robe|clothes|gown)\b/
  // },
  // {
  //   base: 'sandals',
  //   rex: /\b(shoes|sandals)\b/
  // },
  // {
  //   base: 'wardrobe',
  //   rex: /\b(closet|cupboard|wardrobe|wr)\b/
  // },
  {
    base: 'say',
    rex: /\b(say|tell|scream|speak|shout|ask)\b/
  },

  // {
  //   base: 'use',
  //   rex: /\b(open|use)\b/
  // }

]

interface RuleSpec {
  cname: string
  rex: RegExp
  event: any,
  type: string
  extra?: any
}

const StaticRules: RuleSpec[] = [
  {
    cname: 'cheat',
    rex: /^cheat$/i,
    event: RouterService.handleCheat,
    type: 'command',
    extra: undefined
  },

  {
    cname: 'help',
    rex: /^(help|halp)$/i,
    event: RouterService.handleHelp,
    type: 'command',
    extra: undefined
  },

  {
    cname: 'goto',
    rex: /^(goto|gt|g) (?<roomName>.*)/i,
    event: RouterService.goto,
    type: 'command'
  },

  {
    cname: 'inventory',
    rex: /^(inventory|items|inv|i)$/i,
    event: RouterService.showInventory,
    type: 'command'
  },

  {
    cname: 'lookRoom',
    rex: /^(look|l|x|look room|x room|look around)$/i,
    event: RouterService.lookRoom,
    type: 'command'
  },

  {
    cname: 'lookRoomThing',
    rex: /^(?<verb>look at|look|examine|x at|l|x) (?<target>\w+)$/i,
    event: RouterService.lookRoomThing,
    type: 'command'
  },

  // captures all wear related tasks
  // have to fire from your inventory too...
  {
    cname: 'takeRoomThing',
    rex: /^(?<verb>get|take|grab|try on|wear|put on|pick up|t) (?<target>\w+)$/i,
    event: RouterService.takeRoomThing,
    type: 'command'
  },

  // just on its own no 'with' or 'on'
  {
    cname: 'useRoomThingAlone',
    rex: /^(?<verb>use) (?<target>\w+)$/i,
    event: RouterService.useRoomThingAlone,
    type: 'command'
  },

  // just on its own no 'with' or 'on'
  {
    cname: 'useThingOn',
    rex: /^(?<verb>use|put|place) (?<subject>\w+) (on|onto|in|with|against) (?<target>\w+)$/i,
    event: RouterService.useRoomThingOn,
    type: 'command'
  },

  {
    rex: /^(rs|start|restart)$/i,
    cname: 'restart',
    event: RouterService.startGame,
    type: 'command'
  },

  {
    rex: /^(test)$/i,
    cname: 'test',
    event: RouterService.echoTest,
    type: 'command'
  },

  {
    rex: /^(rl|reload)$/i,
    cname: 'reload',
    event: RouterService.reload,
    type: 'command'
  },

  {
    rex: /^dbg$/,
    cname: 'debug',
    type: 'command',
    event: AppConfig.toggleDebug
  },

  {
    rex: /^(st|status)$/,
    cname: 'status',
    type: 'command',
    event: RouterService.showStatus
  },

  {
    rex: /^(log)$/,
    cname: 'log',
    type: 'command',
    event: RouterService.showLog
  },

  {
    rex: /^(cacheNames|cn)$/i,
    cname: 'recache',
    type: 'command',
    event: RouterService.cacheNames
  },


  // {
  //   cname: 'examine',
  //   rex: /^(x|examine|look)$/i,
  //   event: RouterService.lookRoom,
  //   type: 'command'
  //   // eventName: 'startGame'
  // },

  // {
  //   cname: 'examine',
  //   rex: /^(x|examine|look|look at) (?<thing>\w+)$/i,
  //   event: RouterService.lookThing,
  //   type: 'command'
  //   // eventName: 'startGame'
  // },

]

export {
  StaticRules, OneRule, ReplaceItems,
  ReplacePair, RuleSpec
}
