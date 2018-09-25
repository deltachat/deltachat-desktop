const path = require('path')

const TEMP_DIR = process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp'
const TEST_DIR = path.join(TEMP_DIR, 'DeltaTest')

module.exports = {
  TEST_DIR
}
