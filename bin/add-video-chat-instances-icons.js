const fs = require('fs')
const process = require('process')

//const { VIDEO_CHAT_INSTANCES } = require('../src/shared/constants.ts')
// TODO instead of duplicating these data
// Videochat Server URLs and icons
const VIDEO_CHAT_INSTANCES = {
  systemli: {
    name: 'Systemli',
    url: 'https://meet.systemli.org/$ROOM',
    icon: '../images/videochat_instances/systemli.ico',
  },
  autistici: {
    name: 'Autistici',
    url: 'https://vc.autistici.org/$ROOM',
    icon: '../images/videochat_instances/autistici.ico',
  },
}

const getData = async () => {
  let data = {}
  for (const [id, props] of Object.entries(VIDEO_CHAT_INSTANCES)) {
    for (const i = 1; i <= 3; i++) { // max 3 retries
      const response = await fetch(props.url.replace('$ROOM', '/images/favicon.ico'))
      if (response.ok) {
        data[id] = {
          buffer: new Uint8Array(await response.arrayBuffer()),
          file: props.icon,
        }
        break
      }
    }
  }
  return data
}

getData().then((data) => {
  if (Object.entries(data).length < VIDEO_CHAT_INSTANCES.length) {
    console.error('Could not fetch all the icons')
    process.exit(1)
  } else {
    for (const [_id, { buffer, file }] of Object.entries(data)) {
      fs.writeFileSync(file, buffer)
    }
    console.log('Written to images/videochat_instances successfully')
    process.exit(0)
  }
})
