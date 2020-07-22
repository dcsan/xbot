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
  imageUrl (filepath) {
    if (filepath.startsWith('http')) return filepath
    return process.env.STATIC_SERVER + filepath + Util.cacheBust()
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
