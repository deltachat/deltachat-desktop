const path = require('path')

const paths = [
  path.join(__dirname, 'es5', 'renderer'),
  path.join(__dirname, 'static')
]

console.log('electron-reload watching:')
paths.forEach(p => console.log(` - ${p}`))

require('electron-reload')(paths)

require('.')
