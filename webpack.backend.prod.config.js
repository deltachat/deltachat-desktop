const merge = require('lodash.merge')

module.exports = merge(require('./webpack.backend.dev.config.js'), {
  mode: 'production',
  devtool: 'source-map'
})

module.exports.externals = ['deltachat-node']
