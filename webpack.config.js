const path = require('path')

module.exports = (_, argv) => ({
  entry: path.normalize(`${__dirname}/src/renderer/main.tsx`),
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
        test: /\.[tj]s(x?)$/,
        include: path.normalize(`${__dirname}/src/renderer`),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
            sourceType: 'module'
          }
        }
      }
    ]
  }
})
