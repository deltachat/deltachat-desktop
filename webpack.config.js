const path = require('path')

module.exports = (_, argv) => ({
  entry: path.normalize(`${__dirname}/src/main/index.js`),
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx$/,
        include: path.normalize(`${__dirname}/src/renderer`),
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ],
              sourceType: 'module'
            }
          },
          'awesome-typescript-loader'
        ]
      }
    ]
  }
})
