import { Logger } from '../../lib/LogLib'
import { SceneEvent } from '../MupTypes'
import SlackBuilder from '../pal/SlackBuilder'

enum HandleCodes {
  processing = 'processing',   // started looking
  errthingNotFound = 'errthingNotFound',
  errVerbNotFound = 'errVerbNotFound',
  errActionNotFound = 'errActionNotFound',
  foundAction = 'foundAction',
  foundCommand = 'foundCommand',
  foundGoto = 'foundGoto',
  foundUse = 'foundUse',  // TODO
  ignoredCannotTake = 'ignoredCannotTake',
  ignored = 'ignored',
  skippedPrefix = 'skippedPrefix', // user input
  unknown = 'unknown',
  okReplied = 'okReplied',
  errMissingPos = 'errMissingPos',
  errThingName = 'errThingName',
  errNoResponse = 'errNoResponse',
  takeThing = 'takeThing'
}

interface ErrorOpts {
  name?: string,
  input?: string
}

const ErrorHandler = {

  hintBlock() {
    // TODO add more and randomize/rotate
    const lines = [
      ':bulb: type `help` to see what you can do!'
    ]
    const hint = SlackBuilder.contextBlock(lines[0])
    return hint
  },

  async sendError(which: HandleCodes, evt: SceneEvent, opts: ErrorOpts) {
    let msg: string
    switch (which) {
      case HandleCodes.errthingNotFound:
        msg = `You can't see a ${opts.name}`
        break
      case HandleCodes.ignoredCannotTake:
        msg = `You can't take the ${opts.name}`
        break
      case HandleCodes.unknown:
        msg = `I don't understand ${opts.input}`
        break

      default:
        msg = `hmm, that didn't work out`
    }
    const blocks: any = []
    blocks.push(SlackBuilder.textBlock(msg))
    blocks.push(ErrorHandler.hintBlock())
    Logger.warn(msg, evt.pres.clean)
    evt.pal.sendBlocks(blocks)
  }

}

export { HandleCodes, ErrorHandler, ErrorOpts }
