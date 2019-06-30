if (typeof process.env.DC_ADDR !== 'string') {
  console.error('Missing DC_ADDR environment variable!')
  process.exit(1)
}

if (typeof process.env.DC_MAIL_PW !== 'string') {
  console.error('Missing DC_MAIL_PW environment variable!')
  process.exit(1)
}

let getConfig = () => {
  let mailServerDomain = process.env.DC_MAIL_SERVER
  if (typeof mailServer !== 'string') {
    mailServerDomain = process.env.DC_ADDR.split('@').pop()
  }
  return {
    'markRead': true,
    'notifications': true,
    'showNotificationContent': true,
    'locale': 'en',
    'credentials': {
      'addr': process.env.DC_ADDR,
      'mail_port': '993',
      'mail_pw': process.env.DC_MAIL_PW,
      'mail_security': '',
      'mail_server': 'imap.' + mailServerDomain,
      'mail_user': process.env.DC_ADDR,
      'send_port': '587',
      'send_pw': process.env.DC_MAIL_PW,
      'send_security': '',
      'send_server': 'smtp.' + mailServerDomain,
      'send_user': process.env.DC_ADDR
    },
    'bounds': {
      'x': 0,
      'y': 23,
      'width': 1206,
      'height': 873
    }
  }
}

module.exports = getConfig
