const path = require('path'),
  webpack = require('webpack')

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// CleanWebpackPlugin = require('clean-webpack-plugin');

// const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
  target: 'node',
  context: __dirname,
  entry: ['./src/index.ts'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
