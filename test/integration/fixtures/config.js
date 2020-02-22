const conf = require('rc')('DCC', {})
// const request = require('request')
const fetch = require('node-fetch')

if (conf.NEW_TMP_EMAIL === undefined) {
  console.error('Missing DCC_NEW_TMP_EMAIL environment variable!')
  process.exit(1)
}

async function postData (url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'cache-control': 'no-cache'
    },
    referrerPolicy: 'no-referrer' // no-referrer, *client
  })
  return response.json() // parses JSON response into native JavaScript objects
}

const createTmpUser = async () => {
  return postData(conf.NEW_TMP_EMAIL)
}

module.exports = {
  ...conf,
  createTmpUser,
  notifications: true,
  enterKeySends: true,
  showNotificationContent: true,
  locale: 'en',
  bounds: {
    x: 0,
    y: 23,
    width: 1806,
    height: 1173
  }
}
