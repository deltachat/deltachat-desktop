// Custom Node module loader for unit tests. Registered after ts-node in
// register-ts-node.mjs, so its `resolve` hook runs first.
//
// It papers over the differences between Node's ESM loader and esbuild
// (which bundles the real app):
// - stubs style and asset imports
// - redirects ScreenController to a lightweight stub, because the real
//   module pulls in the entire component tree (see
//   src/tests/helpers/screen-controller-stub.ts)
// - resolves extensionless relative imports to .ts/.tsx files
// - provides named-export shims for CJS packages whose named exports
//   Node's cjs-module-lexer cannot detect (extend `cjsNamedExportShims`
//   when a new package trips the loader)

const STYLE_RE = /\.(css|scss|sass)$/
const ASSET_RE = /\.(png|jpe?g|gif|svg|webp|avif|ico|wav|mp3|ogg|woff2?|ttf)$/

const dataModule = source =>
  'data:text/javascript,' + encodeURIComponent(source)

// CSS modules: return the looked-up class name so snapshots stay readable
const styleStubUrl = dataModule(
  'export default new Proxy({}, { get: (_t, prop) => String(prop) });'
)
const assetStubUrl = dataModule("export default '';")
const workerStubUrl = dataModule(
  'export default class StubWorker { postMessage() {} addEventListener() {} removeEventListener() {} terminate() {} };'
)

/**
 * package name -> list of named exports to re-export via createRequire.
 * Only needed for CJS packages where `import { x } from 'pkg'` fails in Node.
 */
const cjsNamedExportShims = new Map([['debounce', ['debounce']]])

export async function resolve(specifier, context, nextResolve) {
  const bare = specifier.split('?')[0]

  if (specifier.endsWith('?worker')) {
    return { url: workerStubUrl, shortCircuit: true }
  }
  if (STYLE_RE.test(bare)) {
    return { url: styleStubUrl, shortCircuit: true }
  }
  if (ASSET_RE.test(bare)) {
    return { url: assetStubUrl, shortCircuit: true }
  }

  if (cjsNamedExportShims.has(specifier)) {
    const names = cjsNamedExportShims.get(specifier)
    const source =
      "import { createRequire } from 'node:module';\n" +
      `const require = createRequire(${JSON.stringify(
        context.parentURL ?? import.meta.url
      )});\n` +
      `const mod = require(${JSON.stringify(specifier)});\n` +
      'export default mod.default ?? mod;\n' +
      names
        .map(name => `export const ${name} = mod[${JSON.stringify(name)}];`)
        .join('\n')
    return { url: dataModule(source), shortCircuit: true }
  }

  // The ScreenController module (only needed for `selectedAccountId`)
  // would pull in the whole react component tree, so redirect it to a stub.
  if (
    /(^|\/)ScreenController(\.tsx)?$/.test(bare) &&
    context.parentURL?.includes('/packages/frontend/') &&
    !context.parentURL.includes('/tests/')
  ) {
    return {
      url: new URL(
        '../src/tests/helpers/screen-controller-stub.ts',
        import.meta.url
      ).href,
      shortCircuit: true,
    }
  }

  try {
    return await nextResolve(specifier, context)
  } catch (err) {
    // esbuild resolves extensionless and directory imports, Node does not
    // (this also covers workspace-package subpaths like
    // `@deltachat-desktop/shared/logger`)
    for (const suffix of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      try {
        return await nextResolve(specifier + suffix, context)
      } catch {
        /* try next suffix */
      }
    }
    throw err
  }
}
