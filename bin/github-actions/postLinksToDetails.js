import { readFileSync } from 'fs'

const sha = JSON.parse(readFileSync(process.env['GITHUB_EVENT_PATH'], 'utf8'))
  .pull_request.head.sha

const base_url =
  'https://download.delta.chat/desktop/preview/deltachat-desktop'

const GITHUB_API_URL =
  'https://api.github.com/repos/deltachat/deltachat-desktop/statuses/' + sha

const branchName = process.env['PR_BRANCH']
const GITHUB_TOKEN = process.env['GITHUB_TOKEN']

/** May be absent */
const FULL_ARTIFACT_URL = process.env['FULL_ARTIFACT_URL']

let platform_status = {}

if (process.platform === 'darwin') {
  platform_status['context'] = '⭐ MacOS Preview Build'
  // platform_status['target_url'] = base_url + prId + '.dmg'
  platform_status['target_url'] =
    FULL_ARTIFACT_URL ||
    base_url + '-mas.' + branchName + '.zip'
} else if (process.platform === 'win32') {
  platform_status['context'] = '⭐ Windows Preview Build (portable)'
  platform_status['target_url'] =
    FULL_ARTIFACT_URL ||
    base_url + '.' + branchName + '.portable.exe'
} else if (process.platform === 'linux') {
  platform_status['context'] = '⭐ Linux Preview Build'
  platform_status['target_url'] =
    FULL_ARTIFACT_URL ||
    base_url + '.' + branchName + '.AppImage'
} else {
  throw new Error('Unsupported platform: ' + process.platform)
}

const STATUS_DATA = {
  state: 'success',
  description: '⏩ Click on "Details" to download →',
  context: platform_status.context,
  target_url: platform_status.target_url,
}

import { request } from 'https'

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'github-action ci for deltachat deskop',
    authorization: 'Bearer ' + GITHUB_TOKEN,
  },
}

const req = request(GITHUB_API_URL, options, function (res) {
  var chunks = []
  res.on('data', function (chunk) {
    chunks.push(chunk)
  })
  res.on('end', function () {
    var body = Buffer.concat(chunks)
    console.log(body.toString())
  })
})

req.write(JSON.stringify(STATUS_DATA))
req.end()
