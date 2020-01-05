if (typeof process.env.DC_ADDR !== 'string') {
  console.error('Missing DC_ADDR environment variable!')
  process.exit(1)
}

if (typeof process.env.DC_MAIL_PW !== 'string') {
  console.error('Missing DC_MAIL_PW environment variable!')
  process.exit(1)
}

const getConfig = () => {
  return {
    notifications: true,
    enterKeySends: true,
    showNotificationContent: true,
    locale: 'en',
    credentials: {
      addr: process.env.DC_ADDR
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
