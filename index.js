require('source-map-support').install();

if (process.env.NODE_ENV === 'test') {
  const tempy = require('tempy')
  if(!process.env.TEST_DIR){
    process.env.TEST_DIR = tempy.directory()
  }
}
require('./tsc-dist/main')
