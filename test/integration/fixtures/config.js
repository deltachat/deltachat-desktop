const conf = require('rc')('DC', {})

if (conf.account1 === undefined || conf.account1.credentials === undefined) {
  if (typeof process.env.DC_ADDR !== 'string') {
    console.error('Missing DC_ADDR environment variable!')
    process.exit(1)
  }
  if (typeof process.env.DC_MAIL_PW !== 'string') {
    console.error('Missing DC_MAIL_PW environment variable!')
    process.exit(1)
  }
  if (typeof process.env.DC_MAIL_PW1 !== 'string') {
    console.error('Missing DC_MAIL_PW1 environment variable!')
    process.exit(1)
  }
  if (typeof process.env.DC_MAIL_PW2 !== 'string') {
    console.error('Missing DC_MAIL_PW2 environment variable!')
    process.exit(1)
  }
  conf.account1 = {
    credentials: {
      addr: process.env.DC_ADDR1,
      mail_pw: process.env.DC_MAIL_PW1,
      mail_server: process.env.DC_MAIL_SERVER
    }
  }
  conf.account2 = {
    credentials: {
      addr: process.env.DC_ADDR2,
      mail_pw: process.env.DC_MAIL_PW2,
      mail_server: process.env.DC_MAIL_SERVER
    }
  }
}

module.exports = {
  ...conf,
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
