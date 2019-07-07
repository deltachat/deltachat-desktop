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
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            sourceType: 'module'
          }
        }
      }
    ]
  }
})
