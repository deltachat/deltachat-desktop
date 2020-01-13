// webpack.config.js for the renderer
const path = require('path')

module.exports = (_, argv) => ({
  entry: path.normalize(`${__dirname}/../tsc-dist/renderer/main.js`),
  target: 'electron-main',
  output: {
    path: path.normalize(`${__dirname}/../static`),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    nodeEnv: argv.mode
  },
  devtool: 'inline-source-map', // this must be inline for some unknown reason
  node: {
    __dirname: true
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.normalize(`${__dirname}/../tsc-dist`),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            sourceType: 'module'
          }
        }, {
          loader: 'source-map-loader',
          options: {
            enforce: 'pre'
          }
        }]
      }
    ]
  }
})
