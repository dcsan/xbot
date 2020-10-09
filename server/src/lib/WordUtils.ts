import stopword from 'stopword'
import { MakeLogger } from '../lib/LogLib'
const logger = new MakeLogger('WordUtils')

const WordUtils = {

  stripPunctuation(input) {
    if (!input) {
      logger.warn('tried to stripPunctuation from empty input')
    }
    // do NOT replace leading / just a few commands
    const output = input.replace(/[\.,\-\!]/gim, '')
    // const output = input.replace(/[^\w\s-]/gim, '')
    return output
  },

  makeCname(input: string): string {
    let clean = WordUtils.stripPunctuation(input)
    clean = clean.toLowerCase()
    return clean
  },

  /**
   * remove a few stopwords, punctuation and lowercase,
   * but dont remove full list of stopwords like `get`
   * @param input
   */
  basicNormalize(input) {
    if (!input || input.length < 1) return input
    input = input.toLowerCase()
    input = WordUtils.stripPunctuation(input)
    const words = input.split(' ')
    const stops = [
      'the', 'a', 'an', 'that', 'is', 'of'
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
