const { spawnSync } = require('child_process')
const fs = require('fs-extra')
const { join } = require('path')

function gatherProcessStdout(cmd, args) {
  const { status, stdout, stderr } = spawnSync(cmd, args)
  if (status !== 0) throw new Error(stderr)
  return stdout.toString().replace(/\n/g, '')
}

async function getGitRef() {
  if (process.env.VERSION_INFO_GIT_REF) {
    return process.env.VERSION_INFO_GIT_REF
  }

  let git_describe, git_branch
  try {
    git_describe = gatherProcessStdout('git', ['describe'])
    try {
      git_symbolic_ref =
        process.env.GITHUB_HEAD_REF ||
        process.env.GITHUB_REF ||
        gatherProcessStdout('git', ['symbolic-ref', 'HEAD'])
      git_branch = git_symbolic_ref.split('/').pop()
      console.log(git_symbolic_ref, git_branch)
    } catch (err) {
      console.log(err)
      git_branch = 'master'
    }
  } catch (err) {
    console.log(err)
    console.log('Hint: you can set the env var VERSION_INFO_GIT_REF manualy')
    process.exit(1)
  }

  const git_ref =
    git_describe + (git_branch === 'master' ? '' : '-' + git_branch)
  return git_ref
}

async function gatherBuildInfo() {
  const package = await fs.readJSON(join(__dirname, '../package.json'))
  return {
    VERSION: package.version,
    BUILD_TIMESTAMP: Date.now(),
    GIT_REF: await getGitRef(),
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
