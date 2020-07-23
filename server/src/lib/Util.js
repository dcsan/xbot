const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const Util = {

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  },

  // so we always get latest images
  // can remove this when thigns arent changing often
  cacheBust () {
    const oneMinute = (1 * 60 * 1000)
    const ts = Math.floor(Date.now() / oneMinute)
    return('?x=' + ts) // 10 minute
  },

  // wrap relative image URLs
  // also allows `text=xxx` links
  imageUrl (urlInfo) {
    if (urlInfo.startsWith('http')) return urlInfo
    if (urlInfo.startsWith('text=')) return `https://via.placeholder.com/500x200/444488/CCC.png?${urlInfo}`

    return process.env.STATIC_SERVER + urlInfo + Util.cacheBust()
  },

  loadYaml(pathFromData) {
    const filepath = path.join(__dirname, '../data/', pathFromData)
    try {
      const doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
      return doc
    } catch (err) {
      console.error('ERROR failed to load yaml:', pathFromData)
      throw(err)
    }
  },

  quoteCode (s) {
    return('```' + s + '```')
  }

}

module.exports = Util
