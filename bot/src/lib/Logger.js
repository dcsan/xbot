const Logger = {

  logObj(msg, obj) {
    console.log(msg, JSON.stringify(obj, null, 2))
  }

}

module.exports = Logger
