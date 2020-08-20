const mongoose = require('mongoose');
import AppConfig from '../../lib/AppConfig'

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cbg'

const dbConfig = {
  mongoUri: AppConfig.mongoUri,
  options: {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useMongoClient: true,
    keepAlive: 1,
    connectTimeoutMS: 30000,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 5000,
    // useFindAndModify: false
  }
}

let dbConn

const DbConfig = {

  async init() {
    if (dbConn) return dbConn
    try {
      await mongoose.connect(dbConfig.mongoUri, dbConfig.options)
      dbConn = mongoose.connection
      console.log('connected to', dbConfig.mongoUri)
      // console.log('OK dbConn.name=>', dbConn.name)
      // console.log(`Connected to database on Worker process: ${process.pid}`)
    } catch (error) {
      console.error('Connection error:', error.stack)
      // process.exit(1)
    }
    return dbConn
  },

  async close() {
    // console.log('dbConfig.close prev state', mongoose.connection)
    await mongoose.connection.close()
  }

  // mongoose.connect(mongoUri, );
  // dbConn = mongoose.connection;
  // dbConn.on('error', console.error.bind(console, 'connection error:'));
  // await dbConn.once('open');
}


export { DbConfig, dbConn }

