const log = console.log
import stopword from 'stopword'


const WordUtils = {

  stripPunctuation(input) {
    const output = input.replace(/\.,-/gim, '')
    return output
  },

  /**
   * remove a few stopwords, punctuation and lowercase,
   * but dont remove full list of stopwords like `get`
   * @param input
   */
  basicNormalize(input) {
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

  /**
   * removes 'get' and other commands - too aggressive
   * @param words
   */
  removeAllStopWords(words) {
    if (typeof (words) === 'string') {
      words = words.split(' ')  // passed a string
    }
    const clean = stopword.removeStopwords(words)
    return clean.join(' ')
  },

  fullNormalize(input) {
    input = WordUtils.basicNormalize(input)
    input = WordUtils.removeAllStopWords(input)
    return input
  }

}

export default WordUtils
