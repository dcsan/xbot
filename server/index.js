// do this first
const AppConfig = require('./src/lib/AppConfig')
AppConfig.init()

module.exports = require('./src/botRoutes');
