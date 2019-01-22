var nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.normalize(`${__dirname}/index.js`),
  target: 'electron-main',
  devtool: 'inline-source-map',
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  output: {
    path: path.normalize(`${__dirname}/build`),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  }
}
