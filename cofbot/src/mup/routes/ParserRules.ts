import { RouterService } from './RouterService'

interface OneRule {
  rex: RegExp
  event: any
  type: string
  cname: string
}

const StaticRules: OneRule[] = [
  {
    cname: 'cheat',
    rex: /^cheat$/gim,
    event: RouterService.handleCheat,
    type: 'command'
  },

  {
    cname: 'goto',
    rex: /^(goto|gt) (?<roomName>\w+)$/gim,
    event: RouterService.goto,
    type: 'command'
  },

  {
    cname: 'lookRoom',
    rex: /^(look|l)$/gim,
    event: RouterService.lookRoom,
    type: 'command'
  },

  {
    cname: 'lookThing',
    rex: /^(look|look at|x|examine|x at) (?<thing>\w+)$/gim,
    event: RouterService.lookThing,
    type: 'command'
  },

  {
    rex: /^(start|restart)$/,
    cname: 'restart',
    event: RouterService.startGame,
    type: 'command'
    // eventName: 'startGame'
  },

  {
    cname: 'restart',
    rex: /^(x|examine|look)$/,
    event: RouterService.lookRoom,
    type: 'command'
    // eventName: 'startGame'
  },

  {
    cname: 'examine',
    rex: /^(x|examine|look|look at) (?<thing>\w+)$/,
    event: RouterService.lookThing,
    type: 'command'
    // eventName: 'startGame'
  },

]

export { StaticRules, OneRule }
