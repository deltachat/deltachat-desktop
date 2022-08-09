const fs = require('fs/promises')
const { spawn, spawnSync } = require('child_process')
const path = require('path')
const {argv0} = require('process')

const COUNT_USAGES_BEFORE = 157
const COUNT_METHODS_BEFORE = 110

async function findDeltaRemoteMethods() {
  const data = await fs.readFile('src/renderer/delta-remote.ts', 'utf8')

  const matches = data.matchAll(/fnName:.*'(?<name>.+)'/gm)

  let methods = []
  for (let m of matches) {
    methods.push(m[1])
  }
  return methods
}

async function findMethodUsage(methodName) {
  let p = spawnSync('rg', [`${methodName}`, `.`, `-g`, `'!delta-remote.ts'`, `-c`], {
    shell: true,
    cwd: path.join(process.cwd(), 'src', 'renderer'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let data = p.stdout.toString()
  let total_occurances = 0
  let files = []
  for (let line of data.split(/\r?\n/)) {
    let [file, occurances] = line.split(':')
    occurances = Number(occurances)

    if (file === '' || typeof occurances === 'undefined') continue
    files.push([file, occurances])
    total_occurances += occurances
  }

  return {
    methodName,
    files,
    total_occurances
  }


}

async function main() {
  const delta_remote_methods = await findDeltaRemoteMethods()

  let result = []
  for (let m of delta_remote_methods) {
    result.push(await findMethodUsage(m))
  }

  result.sort((a, b) => {
    if (a.total_occurances < b.total_occurances) {
      return -1
    } else if (a.total_occurances > b.total_occurances) {
      return 1
    }
    return 0
  })

  result.reverse()

  let count_usages = 0
  for (let r of result) {
    console.log(`# ${r.methodName} [${r.total_occurances}]`)
    for (let f of r.files) {
      console.log(`- ${f[0]} [${f[1]}]`)
      count_usages++
    }
  }

  console.log('')
  console.log(`Ported (Methods): ${COUNT_METHODS_BEFORE - result.length}/${COUNT_METHODS_BEFORE} (${(COUNT_METHODS_BEFORE - result.length) / COUNT_METHODS_BEFORE}%)`) 
  console.log(`Ported (Usages): ${COUNT_USAGES_BEFORE - count_usages}/${COUNT_USAGES_BEFORE} (${(COUNT_USAGES_BEFORE - count_usages) / COUNT_USAGES_BEFORE}%)`)
  console.log('')
  console.log(`Remaining (Methods): ${result.length}`)
  console.log(`Remaining (Usages): ${count_usages}`)


}


main()

