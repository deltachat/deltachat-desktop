//@ts-check
import sourceMap from 'source-map-support'
sourceMap.install()

if (process.env.NODE_ENV === 'test') {
  if(!process.env.TEST_DIR){
      const { mkdtempSync } = await import('fs')
      const { tmpdir } = await import('os')
      const { join } = await import('path')
      process.env.TEST_DIR = mkdtempSync(join(tmpdir(), 'deltachat-'))
  }
}
import './tsc-dist/main/index.js';
