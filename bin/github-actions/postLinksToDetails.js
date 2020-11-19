const { readJsonSync } = require('fs-extra')

const sha = readJsonSync(process.env['GITHUB_EVENT_PATH']).pull_request.head.sha

const base_url =
  'https://download.delta.chat/desktop/preview/deltachat-desktop-'

const GITHUB_API_URL =
  'https://api.github.com/repos/deltachat/deltachat-desktop/statuses/' + sha

const prId = process.env['PR_ID']
const GITHUB_TOKEN = process.env['GITHUB_TOKEN']

let platform_status = {}

if (process.platform === 'darwin') {
  platform_status['context'] = '📦 MacOS Preview Build'
  // platform_status['target_url'] = base_url + prId + '.dmg'
  platform_status['target_url'] = base_url + 'mas-' + prId + '.zip'
} else if (process.platform === 'win32') {
  platform_status['context'] = '📦 Windows Preview Build (portable)'
  platform_status['target_url'] = base_url + prId + '.portable.exe'
} else if (process.platform === 'linux') {
  platform_status['context'] = '📦 Linux Preview Build'
  platform_status['target_url'] = base_url + prId + '.AppImage'
} else {
  throw new Error('Unsuported platform: ' + process.platform)
}

const STATUS_DATA = {
  state: 'success',
  description: 'Click on "Details" to download →',
  context: platform_status.context,
  target_url: platform_status.target_url,
}

const http = require('https')

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'github-action ci for deltachat deskop',
    authorization: 'Bearer ' + GITHUB_TOKEN,
  },
}

const req = http.request(GITHUB_API_URL, options, function(res) {
  var chunks = []
  res.on('data', function(chunk) {
    chunks.push(chunk)
  })
  res.on('end', function() {
    var body = Buffer.concat(chunks)
    console.log(body.toString())
  })
})

req.write(JSON.stringify(STATUS_DATA))
req.end()
