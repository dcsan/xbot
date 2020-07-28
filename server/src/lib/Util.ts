import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { Logger } from './Logger'

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
    if (relPath.startsWith('text=')) return `https://via.placeholder.com/500x200/444488/CCC.png?${ relPath }`

    // const imgUrl = process.env.STATIC_SERVER + '/cdn/assets/stories/' + urlInfo + Util.cacheBust()
    Logger.log('relPath', relPath)
    return relPath
  },

  loadStory(storyName) {
    const storyPath = `../../cdn/story-${ storyName }.wiki/story.yaml`
    const fullPath = path.join(__dirname, storyPath)
    try {
      const doc = yaml.safeLoad(fs.readFileSync(fullPath, 'utf8'))
      return doc
    } catch (err) {
      console.error('ERROR failed to load story:', storyName, '=> ', storyPath)
      console.error('fullPath:', fullPath)
      throw (err)
    }
  },

  // FIXME add full regex non WS support
  safeName(name) {
    if (!name) Logger.error('no name passed to safeName method')
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
