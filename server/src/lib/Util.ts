import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import Logger from './Logger'

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
  imageUrl(urlInfo) {
    if (urlInfo.startsWith('http')) return urlInfo
    if (urlInfo.startsWith('text=')) return `https://via.placeholder.com/500x200/444488/CCC.png?${ urlInfo }`

    const imgUrl = process.env.STATIC_SERVER + '/cdn/assets/stories/' + urlInfo + Util.cacheBust()
    Logger.log('imgUrl', imgUrl)
    return imgUrl

  },

  loadYaml(pathFromData) {
    const fullPath = path.join(__dirname, '../../cdn/assets/', pathFromData)
    try {
      const doc = yaml.safeLoad(fs.readFileSync(fullPath, 'utf8'))
      return doc
    } catch (err) {
      console.error('ERROR failed to load yaml:', pathFromData)
      console.error('fullPath:', fullPath)
      throw (err)
    }
  },

  // FIXME add full regex non WS support
  safeName(name) {
    name = name.toLowerCase()
    return name.replace(/ /gim, '-')
  },

  quoteCode(s) {
    return ('```' + s + '```')
  }

}

export default Util
