import { RouterService } from './RouterService'

interface OneRule {
  rex: RegExp
  event: any
  type: string
  cname: string
  extra?: string | undefined
}

const StaticRules: OneRule[] = [
  {
    cname: 'cheat',
    rex: /^cheat$/i,
    event: RouterService.handleCheat,
    type: 'command',
    extra: undefined
  },

  {
    cname: 'goto',
    rex: /^(goto|gt) (?<roomName>.*)/i,
    event: RouterService.goto,
    type: 'command'
  },

  {
    cname: 'lookRoom',
    rex: /^(look|l)$/i,
    event: RouterService.lookRoom,
    type: 'command'
  },

  {
    cname: 'lookThing',
    rex: /^(look|look at|x|examine|x at) (?<thing>\w+)$/i,
    event: RouterService.lookThing,
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

export { StaticRules, OneRule }
