require('source-map-support').install();

if (process.env.NODE_ENV === 'test') {
  const { mkdtempSync } = require('fs')
  const { tmpdir } = require('os')
  const { join } = require('path')
  process.env.TEST_DIR = mkdtempSync(join(tmpdir(), 'deltachat-'))
}
require('./tsc-dist/main')
