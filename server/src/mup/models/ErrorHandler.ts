import { SceneEvent } from '../MupTypes'
import Logger from '../../lib/Logger'

const ErrorCodes = {
  thingNotFound: 'thingNotFound',
  cannotTake: 'cannotTake'
}

interface ErrorOpts {
  name: string
}

const ErrorHandler = {

  async sendError(which: string, evt: SceneEvent, opts: ErrorOpts) {
    let msg
    switch (which) {
      case ErrorCodes.thingNotFound:
        msg = `You can't see a ${ opts.name }`
        break
      case ErrorCodes.cannotTake:
        msg = `You can't take the ${ opts.name }`
        break

      default:
        msg = `hmm, that didn't work out`
    }
    Logger.warn(msg)
    evt.pal.sendText(msg)
  }

}

export { ErrorCodes, ErrorHandler, ErrorOpts }
