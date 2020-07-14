const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const Util = {

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  },

  // wrap relative image URLs
  imageUrl (file) {
    return process.env.STATIC_SERVER + file
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
  }

}

module.exports = Util
