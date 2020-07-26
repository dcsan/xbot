const log = console.log
import stopword from 'stopword'


const WordUtils = {

  stripPunctuation(input) {
    const output = input.replace(/\.,-/gim, '')
    return output
  },

  // remove predicates, lowercase etc.
  // but dont remove all stopwords
  cheapNormalize(input) {
    input = input.toLowerCase()
    input = WordUtils.stripPunctuation(input)
    const words = input.split(' ')
    const stops = [
      'the', 'a', 'an', 'that', 'is'
    ]

    const output = words.filter(w => {
      return (!stops.includes(w))
    })
    return output.join(' ')
  },

  removeStopWords(words) {
    if (typeof (words) === 'string') {
      words = words.split(' ')  // passed a string
    }
    const clean = stopword.removeStopwords(words)
    return clean.join(' ')
  },

  fullNormalize(input) {
    input = WordUtils.cheapNormalize(input)
    input = WordUtils.removeStopWords(input)
    return input
  }

}

export default WordUtils
