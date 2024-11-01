//@ts-check

if (process.env.NODE_ENV === 'test') {
  if (!process.env.DC_TEST_DIR) {
    const { mkdtempSync } = await import('fs')
    const { tmpdir } = await import('os')
    const { join } = await import('path')
    process.env.DC_TEST_DIR = mkdtempSync(join(tmpdir(), 'deltachat-'))
  }
}
import './bundle_out/index.js'
