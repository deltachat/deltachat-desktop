var nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.normalize(`${__dirname}/src/renderer/main.js`),
  target: 'electron-main',
  output: {
    path: path.normalize(`${__dirname}/build`),
    filename: 'static/index.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  devtool: 'inline-source-map',
  node: {
    __dirname: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.normalize(`${__dirname}/src/renderer`),
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'images', to: 'images' },
      { from: '_locales/*.json' },
      { from: 'static', to: 'static' },
      { from: 'node_modules/normalize.css/normalize.css', to: 'static' },
      { from: 'node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css', to: 'static' },
      { from: 'node_modules/@blueprintjs/core/lib/css/blueprint.css', to: 'static' }
    ])
  ]
}
