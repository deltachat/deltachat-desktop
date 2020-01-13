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
  devtool: 'source-map', // we now somehow need to tell this sourcemap to honor the source maps from ts
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
        include: path.normalize(`${__dirname}/../tsc-dist/renderer`),
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
