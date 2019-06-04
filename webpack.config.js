const path = require('path')

module.exports = (_, argv) => ({
  entry: path.normalize(`${__dirname}/src/renderer/main.js`),
  target: 'electron-main',
  output: {
    path: path.normalize(`${__dirname}/static`),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    nodeEnv: argv.mode
  },
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
        options: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ],
          sourceType: 'module'
        }
      }
    ]
  }
})
