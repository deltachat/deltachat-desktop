const merge = require('lodash.merge')

const packageJson = require('./webpack.frontend.dev.config.js')
module.exports = merge(packageJson, {
  mode: 'production',
  externals: null,
  optimization: {
    minimize: false
  },
  devtool: 'source-map'
})

module.exports.externals = []
