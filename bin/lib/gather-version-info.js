//@ts-check
import { spawnSync } from 'child_process'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
    git_describe = gatherProcessStdout('git', ['describe', '--tags'])
    try {
      const git_symbolic_ref =
        process.env.GITHUB_HEAD_REF ||
        process.env.GITHUB_REF ||
        gatherProcessStdout('git', ['symbolic-ref', 'HEAD'])
      git_branch = git_symbolic_ref.split('/').pop()
      console.log(git_symbolic_ref, git_branch)
    } catch (err) {
      console.log(err)
      git_branch = 'main'
    }
  } catch (err) {
    console.log(err)
    console.log('Hint: you can set the env var VERSION_INFO_GIT_REF manualy')
    process.exit(1)
  }

  const git_ref = git_describe + (git_branch === 'main' ? '' : '-' + git_branch)
  return git_ref
}

/**
 * @returns {Promise<import('@deltachat-desktop/shared/shared-types').BuildInfo>}
 */
export async function gatherBuildInfo() {
  const packageJSON = join(__dirname, '../../package.json')
  const packageObject = JSON.parse(await readFile(packageJSON, 'utf8'))
  return {
    VERSION: packageObject.version,
    BUILD_TIMESTAMP: process.env.SOURCE_DATE_EPOCH
      ? Number(process.env.SOURCE_DATE_EPOCH) * 1000
      : Date.now(),
    GIT_REF: await getGitRef(),
  }
}
