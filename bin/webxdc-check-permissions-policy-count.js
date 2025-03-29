import fs from 'fs/promises'
import path from 'path'

// See `PERMISSIONS_POLICY_DENY_ALL` in `src-tauri/src/webxdc/webxdc_scheme.rs`.

const url =
  'https://raw.githubusercontent.com/w3c/webappsec-permissions-policy/refs/heads/main/features.md'

async function getRequiredCount(url) {
  const res = await fetch(url)
  const count = ((await res.text()).match(/^\| `/gm) ?? []).length

  if (count === 0) {
    throw new Error('Failed to parse count')
  }

  return count
}

async function getActualCount(filePath) {
  const fileContent = await fs.readFile(filePath, { encoding: 'utf8' })
  const count = (fileContent.match(/^    (\/\/ )?".*?=\(\)(, )?",$/gm) ?? [])
    .length

  if (count === 0) {
    throw new Error('Failed to parse count')
  }

  return count
}

const targetFile = path.join(
  '.',
  'src-tauri',
  'src',
  'webxdc',
  'webxdc_scheme.rs'
)

const requiredCount = await getRequiredCount(url)
const actualCount = await getActualCount(targetFile)

if (actualCount !== requiredCount) {
  throw new Error(
    'PERMISSIONS_POLICY_DENY_ALL variable needs to be updated to include all the possible permissions'
  )
} else {
  console.log(
    `PERMISSIONS_POLICY_DENY_ALL value is good, permission counts are ${actualCount} == ${requiredCount}`
  )
}
