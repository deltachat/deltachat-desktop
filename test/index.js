const tempy = require('tempy')
process.env.TEST_DIR = tempy.directory()
require('../src/main')
