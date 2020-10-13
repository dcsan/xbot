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
  admin?: boolean
}

const StaticRules: RuleSpec[] = [

  {
    cname: 'cheat',
    rex: /^cheat$/i,
    event: RouterService.handleCheat,
    type: 'preCommand',
    extra: undefined
  },

  {
    cname: 'help',
    rex: /^(help|\?|❓)$/i,
    event: RouterService.handleHelp,
    type: 'preCommand',
    extra: undefined
  },

  {
    cname: 'goto',
    rex: /^(goto|gt|g) (?<roomName>.*)/i,
    event: RouterService.goto,
    type: 'preCommand'
  },

  {
    cname: 'install',
    rex: /^(install)/i,
    event: RouterService.install,
    type: 'preCommand',
    admin: true
  },

  {
    cname: 'survey',
    rex: /^(survey)/i,
    event: RouterService.showSurvey,
    type: 'preCommand',
    admin: false
  },

  {
    cname: 'clear',
    rex: /^(clear)/i,
    event: RouterService.clear,
    type: 'preCommand',
    admin: true
  },

  {
    cname: 'voice',
    rex: /^voice/i,
    event: RouterService.voice,
    type: 'preCommand',
    admin: true
  },

  // slash preCommands
  // note /slash punctuation is removed before rex comparison
  {
    rex: /\/hint (?<text>.*)/i,
    cname: 'hint',
    type: 'preCommand',
    event: RouterService.showHint
  },

  {
    rex: /^(teams)$/i,
    cname: 'hint',
    type: 'preCommand',
    event: RouterService.showTeams
  },


  {
    cname: 'inventory',
    rex: /^(inventory|item|inv|i|🧰)$/i,
    event: RouterService.showInventory,
    type: 'preCommand'
  },

  {
    cname: 'lookRoom',
    rex: /^(look|l|x|examine|look room|x room|l room|look at room|👀)$/i,
    event: RouterService.lookRoom,
    type: 'preCommand'
  },

  // has to come after `look room`
  {
    cname: 'lookAt',
    rex: /^(?<verb>look at|look|examine|x at|l|x) (?<target>\w+)$/i,
    event: RouterService.lookRoomThing,
    type: 'preCommand'
  },

  // just on its own no 'with' or 'on'
  {
    cname: 'useThingOn',
    rex: /^(?<verb>use|put|place) (?<subject>\w+) (on|onto|in|with|against) (?<target>\w+)$/i,
    event: RouterService.useRoomThingOn,
    type: 'postCommand'
  },

  {
    rex: /^(rs|restart|reset)$/i,
    cname: 'restart',
    event: RouterService.resetGame,
    type: 'preCommand'
  },

  {
    rex: /^(test)$/i,
    cname: 'test',
    event: RouterService.echoTest,
    type: 'preCommand'
  },

  {
    rex: /^(rl|reload)$/i,
    cname: 'reload',
    event: RouterService.reload,
    type: 'preCommand'
  },

  // {
  //   rex: /^dbg$/,
  //   cname: 'debug',
  //   type: 'preCommand',
  //   event: AppConfig.toggleDebug
  // },

  {
    rex: /^st (?<thingName>\w+)$/,
    cname: 'thingStatus',
    type: 'preCommand',
    event: RouterService.showThingStatus
  },

  {
    rex: /^(st|status)$/,
    cname: 'status',
    type: 'preCommand',
    event: RouterService.showStatus
  },

  {
    rex: /^(log)$/,
    cname: 'log',
    type: 'preCommand',
    event: RouterService.showLog
  },

  {
    rex: /^(cacheNames|cn)$/i,
    cname: 'recache',
    type: 'preCommand',
    event: RouterService.cacheNames
  },

  {
    rex: /^(task|tasks|tasklist|t)$/,
    cname: 'log',
    type: 'preCommand',
    event: RouterService.showNotes
  },

  {
    rex: /.* has joined/i,
    cname: 'userJoined',
    type: 'preCommand',
    event: RouterService.userJoined
  },

  {
    rex: /.* has left/i,
    cname: 'userLeft',
    type: 'preCommand',
    event: RouterService.userLeft
  },

  {
    rex: /^(invite|link)$/i,
    cname: 'inviteLink',
    type: 'preCommand',
    event: RouterService.inviteLink
  },

  // dev testing

  // {
  //   rex: /^(img)$/,
  //   cname: 'log',
  //   type: 'preCommand',
  //   event: RouterService.sendImageLink
  // },

  // {
  //   rex: /^(unf)$/,
  //   cname: 'log',
  //   type: 'preCommand',
  //   event: RouterService.sendUnfurl
  // },

  // {
  //   rex: /^(imglink)$/im,
  //   cname: 'log',
  //   type: 'preCommand',
  //   event: RouterService.sendImageLink
  // },

  // ------ postCommands run later


  // captures all wear related tasks
  // have to fire from your inventory too...
  {
    cname: 'takeRoomThing',
    rex: /^(?<verb>get|take|grab|try on|wear|put on|pick up|t) (?<target>\w+)$/i,
    event: RouterService.takeRoomThing,
    type: 'postCommand'
  },

  // just on its own no 'with' or 'on'
  {
    cname: 'useRoomThingAlone',
    rex: /^(?<verb>use) (?<target>\w+)$/i,
    event: RouterService.useRoomThingAlone,
    type: 'postCommand'
  },

]

export {
  StaticRules, OneRule, RuleSpec
}
