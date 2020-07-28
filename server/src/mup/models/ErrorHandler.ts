import Logger from '../../lib/Logger'
import { SceneEvent } from '../MupTypes'

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
  errNoResponse = 'errNoResponse'
}

interface ErrorOpts {
  name?: string,
  input?: string
}

const ErrorHandler = {

  async sendError(which: HandleCodes, evt: SceneEvent, opts: ErrorOpts) {
    let msg
    switch (which) {
      case HandleCodes.errthingNotFound:
        msg = `You can't see a ${ opts.name }`
        break
      case HandleCodes.ignoredCannotTake:
        msg = `You can't take the ${ opts.name }`
        break
      case HandleCodes.unknown:
        msg = `I don't understand ${ opts.input }`
        break

      default:
        msg = `hmm, that didn't work out`
    }
    Logger.warn(msg, evt.pres.clean)
    evt.pal.sendText(msg)
  }

}

export { HandleCodes, ErrorHandler, ErrorOpts }
