if (typeof process.env.DC_ADDR !== 'string') {
  console.error('Missing DC_ADDR environment variable!')
  process.exit(1)
}

if (typeof process.env.DC_MAIL_PW !== 'string') {
  console.error('Missing DC_MAIL_PW environment variable!')
  process.exit(1)
}

const getConfig = () => {
  let mailServerDomain = process.env.DC_MAIL_SERVER
  if (typeof mailServer !== 'string') {
    mailServerDomain = process.env.DC_ADDR.split('@').pop()
  }
  return {
    notifications: true,
    enterKeySends: true,
    showNotificationContent: true,
    locale: 'en',
    credentials: {
      addr: process.env.DC_ADDR,
      mail_pw: process.env.DC_MAIL_PW,
    },
    bounds: {
      x: 0,
      y: 23,
      width: 1206,
      height: 873
    }
  }
}

module.exports = getConfig
