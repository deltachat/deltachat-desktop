const fs = require('fs')

const { VIDEO_CHAT_INSTANCES } = require('../src/shared/constants.ts')


const getData = async () => {
  let data = {}
  for (const [instanceName, instanceUrl] of Object.entries(VIDEO_CHAT_INSTANCES)) {
    for (const i = 1; i <= 3; i++) {
      const response = await fetch(instanceUrl.replace('$ROOM', 'favicon.ico'))
      if (response.ok) {
        const blob = await response.blob()
        data[instanceName] = blob.toString('base64')
        break
      }
    }
  }
  return data
}

getData().then((data) => {
  if (Object.entries(data).length < Object.entries(VIDEO_CHAT_INSTANCES).length) {
    console.error('Could not fetch all the icons')
    exit(1)
  } else {
    fs.writeFileSync('../src/shared/videochat_icons.json', JSON.stringify(data))
    console.log('Written to src/shared/videochat_instances successfully')
    exit(0)
  }
})
