import * as glob from 'glob'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import * as _ from 'lodash'

import AppConfig from '../lib/AppConfig'
import { Pal } from 'mup/pal/base/Pal'

// FIXME circular deps
// import { MakeLogger } from './LogLib'

const logger = {
  log(..._rest) {
    console.log(..._rest)
  },
  warn(..._rest) {
    console.warn(..._rest)
  }
}

const cdnPath = path.join(__dirname, '../../cdn')

const Util = {
  // logger: {} as any,

  // init() {
  //   console.log('create new logger')
  //   Util.logger = new MakeLogger('util')
  // },

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

  localCdnPath(relPath) {
    const fp = path.join(__dirname, '../../cdn/storydata', relPath)
    return fp
  },

  // wrap relative image URLs
  // also allows `text=xxx` links
  imageUrl(relPath) {
    if (relPath.startsWith('http')) return relPath
    if (relPath.startsWith('text=')) return `https://via.placeholder.com/500x200/444488/CCC.png?${relPath}`

    const absPath = process.env.STATIC_SERVER + '/cdn/storydata/' + relPath + Util.cacheBust()
    logger.log('relPath', relPath, absPath)
    return absPath
  },

  loadStoryDir(storyName) {
    logger.log('loadStoryDir', storyName)

    const storyPath = `../../cdn/storydata/${storyName}/story`
    const fullPath = path.join(__dirname, storyPath)
    const pattern = `${fullPath}/*.yaml`
    const files = glob.sync(pattern)
    // logger.testLog('files', files)
    // logger.testLog('pattern', pattern)

    const docs: any[] = []
    let storyDoc = {
      story: {},
      rooms: []
    }

    for (const onePath of files) {
      try {
        // logger.testLog('loadOne', onePath)
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

    // logger.testLog('storyDoc', storyDoc)
    return storyDoc
  },

  loadYamlFile(relPath) {
    const doc = yaml.safeLoad(fs.readFileSync(relPath, 'utf8'))
    return doc
  },

  loadYamlFileFromCdn(relPath) {
    const fullPath = path.join(cdnPath, relPath)
    logger.log('loadYaml', fullPath)
    const doc = yaml.safeLoad(fs.readFileSync(fullPath, 'utf8'))
    return doc
  },

  // FIXME add full regex non WS support
  safeName(name) {
    if (!name) {
      console.warn('no name passed to safeName method')
      return
    }
    name = name.toLowerCase()
    return name.replace(/ /gim, '-')
  },

  quoteCode(s) {
    return ('```' + s + '```')
  },

  // strip out elements with undef values for cleaner YAML dumps
  removeEmptyKeys(obj, depth = 0) {
    if (depth > 5) return obj
    if (!obj) return {}  // fixme - handle better?
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = Util.removeEmptyKeys(obj[key], depth++) // recurse
      }
      if (obj[key] === undefined) delete obj[key];
    });
    return obj;
  },

  yamlDump(obj) {
    const clean = Util.removeEmptyKeys(obj)
    return yaml.dump(clean)
  },

  isEmptyObject(obj) {
    return typeof obj === 'object' && Object.keys(obj).length === 0;
  },

  // isCommand(input): boolean {
  //   if (/^[-'"\.#!`,>\\]/.test(input)) return true
  //   return false
  // },

  isCommand(input): boolean {
    let cmdFlag = false
    if (!input) return false
    if (input.split(' ').length < 6) cmdFlag = true
    if (/^btn /.test(input)) cmdFlag = true
    if (cmdFlag) {
      logger.log('isCommand: TRUE =>', input)
    }
    return cmdFlag
  },

  stripPrefix(input): string {
    let clean = input.replace(/^[-'"\.#! `,>\\]+/, '')
    return clean.trim()
  },

  isMutedChannel(pal: Pal): boolean {
    const channelName = pal.channelName()
    const mutes = AppConfig.read('MUTED_CHANNELS')
    if (mutes.includes(channelName)) {
      logger.warn('muted in channel', channelName, ' SKIP reply')
      return true
    }
    logger.log('not muted', channelName, mutes)
    return false
  },

  shouldIgnore(input): boolean {
    if (!input) return true
    if (input.split(' ').length > 5) return true
    if (/^[-'"\.#! `,>\\]/.test(input)) { return true } // has prefix
    if (/http/.test(input)) return true  // shared URLs - dont respond to
    // logger.log('not ignore', input)
    return false
  }

}


export default Util
