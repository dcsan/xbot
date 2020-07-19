const path = require('path');
const {
  NODE_ENV = 'production',
} = process.env;

module.exports = {
  entry: './src/index.js',
  mode: NODE_ENV,
  target: 'node',

  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
}
