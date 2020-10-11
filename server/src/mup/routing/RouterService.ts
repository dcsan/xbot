import AppConfig from '../../lib/AppConfig'

import yaml from 'js-yaml'
import Game from '../models/Game'
import { GameManager } from '../models/GameManager'



import { MakeLogger } from '../../lib/LogLib'
import Util from '../../lib/Util'
import { Pal } from '../pal/base/Pal'
import { RexParser, ParserResult } from '../parser/RexParser'

import { SceneEvent } from '../MupTypes'

const logger = new MakeLogger('Router.svc')

const RouterService = {

  // found: {route, parsed}
  goto: async (evt: SceneEvent) => {
    if (!evt.pal.isAdmin()) {
      return
    }
    const roomName = evt.pres.parsed?.groups.roomName
    logger.logObj('goto', roomName)
    await evt.game?.story.gotoRoom(roomName, evt)
  },

  install: async (evt: SceneEvent) => {
    await evt.pal.showInstallUrl()
  },

  lookRoom: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoom(evt)
  },

  lookRoomThing: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoomThing(evt)
  },

  takeRoomThing: async (evt: SceneEvent) => {
    return await evt.game?.story.room.takeItemCommand(evt)
  },

  useRoomThingAlone: async (evt: SceneEvent) => {
    return await evt.game?.story.room.useRoomThingAlone(evt)
  },

  useRoomThingOn: async (evt: SceneEvent) => {
    return await evt.game?.story.room.useRoomThingOn(evt)
  },

  echoTest: async (evt: SceneEvent) => {
    await evt.pal.sendText('echo test back!')
  },

  getActionMatchesList(actions) {
    let lines = actions?.map(thing => {
      return { [thing.cname]: this.getActionMatchesThing(thing) }
    })
    return lines
  },

  getActionMatchesThing(thing) {
    const line = thing.doc?.actions?.map(action => action.match)
    return line || ''
  },

  handleCheat: async (evt: SceneEvent) => {
    const game = await GameManager.findGame({ pal: evt.pal })
    const info = {
      room: game.story.room.name,
      roomActions: RouterService.getActionMatchesThing(game.story.room),
      // itemEvents: RouterService.getActionMatchesList(game.story.currentRoom.items),
      actors: RouterService.getActionMatchesList(game.story.room.actors)
    }
    logger.logObj('cheatInfo', info)
    const blob = yaml.dump(info)
    await evt.pal.sendText(Util.quoteCode(blob))
    return info
  },

  handleHelp: async (evt: SceneEvent) => {
    const help = evt.game?.story.doc.help.basic
    await evt.pal.sendText(help)
  },

  // admin commands

  reload: async (evt: SceneEvent) => {
    await evt.game?.reload(evt)
    await evt.pal.sendText('reloaded')
  },

  clear: async (evt: SceneEvent) => {
    await evt.pal.clearChannel()
    // return await evt.game?.story.room.enterRoom(evt.pal)
  },
  voice: async (evt: SceneEvent) => {
    await evt.pal.showVoiceChannel(evt.pal)
  },

  resetGame: async (evt: SceneEvent) => {
    if (!evt.pal.isAdmin()) {
      return
    }
    await evt.game?.reset(evt.pal)
    return await evt.game?.story.room.enterRoom(evt.pal)
  },

  showStatus: async (evt: SceneEvent) => {
    if (!evt.pal.isAdmin()) {
      return
    }
    await evt.game?.showStatus(evt)
  },

  showThingStatus: async (evt: SceneEvent) => {
    await evt.game?.showThingStatus(evt)
  },

  showLog: async (evt: SceneEvent) => {
    await evt.pal.sendText('-- sent log')
    await evt.pal.showLog()
  },

  // for quicker parsing
  cacheNames: async (evt: SceneEvent) => {
    const itemList = evt.game?.story.room.roomItems!
    await RexParser.cacheNames(itemList, evt.game.story.room.name)
    await evt.pal.sendText('rebuilt cache')
  },

  showInventory: async (evt: SceneEvent) => {
    return await evt.game?.player.showInventory(evt)
  },

  showNotes: async (evt: SceneEvent) => {
    return await evt.game.story.room.showNotes(evt)
  },

  showHint: async (evt: SceneEvent) => {
    return await evt.game.story.room.showHint(evt)
  },

  showSurvey: async (evt: SceneEvent) => {
    const link = AppConfig.read('SURVEY_LINK')
    const text = `Please help us improve the gameplay with this little survey!\n${link}`
    return await evt.pal.sendText(text)
  },

  userJoined: async (evt: SceneEvent) => {
    return await evt.pal.sendText('Welcome new person!')
  },

  userLeft: async (evt: SceneEvent) => {
    return await evt.pal.sendText('Goodbye!')
  },

  inviteLink: async (evt: SceneEvent) => {
    return await evt.pal.sendInvite()
  },

  // sendImageFooter: async (evt: SceneEvent) => {
  //   await evt.pal.sendImage('https://cbg.rik.ai/cdn/storydata/asylum/items/album.jpg')
  //   await evt.pal.sendText(':mag: <https://cbg.rik.ai/items/album|examine>')
  // },

  // sendUnfurl: async (evt: SceneEvent) => {
  //   await evt.pal.sendUnfurl('<https://cbg.rik.ai/items/album| :mag: examine>')
  //   // await evt.pal.sendText('<https://cbg.rik.ai/items/album|examine>')
  // },

  // sendImageLink: async (evt: SceneEvent) => {
  //   const title = "Album"

  //   const blocks = [
  //     {
  //       "type": "image",
  //       "title": {
  //         "type": "plain_text",
  //         "text": title,
  //         "emoji": true
  //       },
  //       "image_url": "https://cbg.rik.ai/cdn/storydata/asylum/items/album.jpg",
  //       "alt_text": "marg"
  //     },
  //     {
  //       "type": "actions",
  //       "elements": [
  //         {
  //           "type": "button",
  //           "text": {
  //             "type": "plain_text",
  //             "text": ":mag:  Examine",
  //             "emoji": true
  //           },
  //           "url": "https://cbg.rik.ai/items/album"
  //         }
  //       ]
  //     }
  //   ]
  //   await evt.pal.sendBlocks(blocks)
  // },


}

export { RouterService, SceneEvent }
