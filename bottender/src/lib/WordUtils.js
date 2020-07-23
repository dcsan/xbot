const log = console.log
const stopword = require('stopword')


const WordUtils = {

  // remove predicates, lowercase etc.
  cheapNormalize(input) {
    input = input.replace(/the |a |an |that /gim, '')  // these just get in the way
    // input = input.replace(/\bto |\bto do /gim, '')  // tell sid to do X -> tell sid X
    input = input.toLowerCase()
    input = input.replace(/  +/, '') // double spaces
    return input
  },

  removeStopWords (words) {
    if (typeof(words) === 'string') {
      words = words.split(' ')  // passed a string
    }
    const clean = stopword.removeStopwords(words)
    return clean.join(' ')
  },

  fullNormalize (input) {
    input = WordUtils.cheapNormalize(input)
    input = WordUtils.removeStopWords(input)
    return input
  }

}

module.exports = WordUtils
