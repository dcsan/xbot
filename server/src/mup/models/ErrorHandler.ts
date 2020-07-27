import { SceneEvent } from '../MupTypes'

const ErrorCodes = {
  thingNotFound: 'thingNotFound'
}

const ErrorHandler = {

  async sendError(which: string, evt: SceneEvent, opts) {
    switch (which) {
      case ErrorCodes.thingNotFound:
        evt.pal.sendText(`you cant see a ${ opts.name }`)
        break
      default:
        evt.pal.sendText(`hmm, that didn't work out`)
    }
  }

}

export { ErrorCodes, ErrorHandler }
