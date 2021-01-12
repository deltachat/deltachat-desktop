const { spawnSync } = require('child_process')
const fs = require('fs-extra')
const { join } = require('path')

function gatherProcessStdout(cmd, args) {
  const { status, stdout, stderr } = spawnSync(cmd, args)
  if (status !== 0) throw new Err(stderr)
  return stdout.toString().replace(/\n/g, '')
}

async function gatherBuildInfo() {
  let git_describe, git_branch;
  try {
    git_describe = gatherProcessStdout('git', ['describe'])
    git_branch = gatherProcessStdout('git', ['symbolic-ref', 'HEAD']).split('/').pop()
    
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  const git_ref = git_describe + (git_branch === 'master' ? '' : '-' + git_branch)

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
