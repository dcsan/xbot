import * as glob from 'glob'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { Logger } from './Logger'
import * as _ from 'lodash'

const Util = {

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  },

  // so we always get latest images
  // can remove this when thigns arent changing often
  cacheBust() {
    const oneMinute = (1 * 60 * 1000)
    const ts = Math.floor(Date.now() / oneMinute)
    return ('?x=' + ts) // 10 minute
  },

  // wrap relative image URLs
  // also allows `text=xxx` links
  imageUrl(relPath) {
    if (relPath.startsWith('http')) return relPath
    if (relPath.startsWith('text=')) return `https://via.placeholder.com/500x200/444488/CCC.png?${relPath}`

    const absPath = process.env.STATIC_SERVER + '/cdn/' + relPath + Util.cacheBust()
    Logger.log('relPath', relPath, absPath)
    return absPath
  },

  loadStoryDir(storyName) {
    Logger.log('loadStoryDir', storyName)

    const storyPath = `../../cdn/story-${storyName}.wiki/story`
    const fullPath = path.join(__dirname, storyPath)
    const pattern = `${fullPath}/*.yaml`
    const files = glob.sync(pattern)
    // Logger.testLog('files', files)
    // Logger.testLog('pattern', pattern)

    const docs: any[] = []
    let storyDoc = {
      story: {},
      rooms: []
    }

    for (const onePath of files) {
      try {
        // Logger.testLog('loadOne', onePath)
        const doc = yaml.safeLoad(fs.readFileSync(onePath, 'utf8'))
        docs.push(doc)
        storyDoc.story = _.merge(storyDoc.story, doc.story)
        if (doc.rooms) {
          storyDoc.rooms = storyDoc.rooms.concat(doc.rooms)
        }

      } catch (err) {
        console.error('ERROR failed to load story:', storyName, '=> ', storyPath)
        console.error('fullPath:', onePath)
        throw (err)
      }
    }

    // Logger.testLog('storyDoc', storyDoc)
    return storyDoc
  },

  // FIXME add full regex non WS support
  safeName(name) {
    if (!name) {
      Logger.warn('no name passed to safeName method')
      return
    }
    name = name.toLowerCase()
    return name.replace(/ /gim, '-')
  },

  quoteCode(s) {
    return ('```' + s + '```')
  },

  // strip out elements with undef values for cleaner YAML dumps
  removeEmptyKeys(obj) {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') Util.removeEmptyKeys(obj[key]);
      else if (obj[key] === undefined) delete obj[key];
    });
    return obj;
  },

  isEmptyObject(obj) {
    return typeof obj === 'object' && Object.keys(obj).length === 0;
  }


}

export default Util
