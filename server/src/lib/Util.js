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

}

module.exports = Util
