import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'

globalThis.require = createRequire(import.meta.url)
globalThis.__filename = url.fileURLToPath(import.meta.url)
globalThis.__dirname = path.dirname(__filename)

// from https://github.com/evanw/esbuild/issues/1921#issuecomment-1898197331
// read the issue for more context, basically esbuild can not convert cjs style `require()` calls to import calls (yet).
// and since we output esm, "require" is not avaiable unless we bing it back with this trick.
// Another option would be to only use esm dependencies, but that's too much work at the time of writing this.
