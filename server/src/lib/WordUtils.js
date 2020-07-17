const NlpUtils = {

  // remove predicates, lowercase etc.
  cheapNormalize(input) {
    input = input.replace(/the |a |an |that /gim, '')  // these just get in the way
    input = input.toLowerCase()
    return input
  }

}

module.exports = NlpUtils
