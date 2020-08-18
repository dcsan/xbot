import { RouterService } from '../routing/RouterService'
import AppConfig from '../../lib/AppConfig'

// import Player from '../models/Player'
// import { synData, ISyn } from './Synonyms'
import { OneRule } from '../MupTypes'


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
    rex: /(help|halp)/i,
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

  // slash commands
  // note /slash punctuation is removed before rex comparison
  {
    rex: /\/hint (?<text>.*)/i,
    cname: 'hint',
    type: 'command',
    event: RouterService.showHint
  },

  {
    cname: 'inventory',
    rex: /^(inventory|items|inv|i)$/i,
    event: RouterService.showInventory,
    type: 'command'
  },

  {
    cname: 'lookRoom',
    rex: /^(look|l|x|look room|x room|look around|look at room)$/i,
    event: RouterService.lookRoom,
    type: 'command'
  },

  // has to come after `look room`
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
    rex: /^(rs|start|restart|reset)$/i,
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

  {
    rex: /^(notes|notebook|nb|hint)$/,
    cname: 'log',
    type: 'command',
    event: RouterService.showNotes
  },

  {
    rex: /.* has joined/i,
    cname: 'userJoined',
    type: 'command',
    event: RouterService.userJoined
  },

  {
    rex: /.* has left/i,
    cname: 'userLeft',
    type: 'command',
    event: RouterService.userLeft
  },

]

export {
  StaticRules, OneRule, RuleSpec
}
