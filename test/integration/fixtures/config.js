const conf = require('rc')('DC', {})
// const request = require('request')
const fetch = require('node-fetch')

if (conf.TESTRUN_URL === undefined) {
  console.error('Missing TESTRUN_URL environment variable!')
  process.exit(1)
}
if (conf.TESTRUN_TOKEN === undefined) {
  console.error('Missing TESTRUN_TOKEN environment variable!')
  process.exit(1)
}

async function postData (url = '', token) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'cache-control': 'no-cache',
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: '{ "token_create_user": ' + token + '}' // body data type must match "Content-Type" header
  })
  return response.json() // parses JSON response into native JavaScript objects
}

const createTmpUser = async () => {
  return postData(conf.TESTRUN_URL, conf.TESTRUN_TOKEN)
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
