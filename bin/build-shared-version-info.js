const { spawnSync } = require('child_process')
const fs = require('fs-extra')
const { join } = require('path')

async function gatherBuildInfo() {
  const { status, stdout, stderr } = spawnSync('git', ['describe'])
  let git_ref = "None"
  if (status !== 0) {
    console.log(stderr)
  } else {
    git_ref = stdout.toString().replace(/\n/g, '')
  }
  const package = await fs.readJSON(join(__dirname, '../package.json'))
  return {
    VERSION: package.version,
    BUILD_TIMESTAMP: Date.now(),
    GIT_REF: git_ref
  }
}

// write file

gatherBuildInfo().then(build_info => {
  fs.writeFileSync(
    join(__dirname, '../src/shared/build-info.ts'),
    '/// GENERATED FILE run `npm run build` to refresh\n' +
      Object.keys(build_info)
        .map(
          key =>
            `export const ${key} = ${JSON.stringify(build_info[key]).replace(
              /^"|"$/g,
              "'"
            )}`
        )
        .join('\n') +
      '\n',
    'utf-8'
  )
})
