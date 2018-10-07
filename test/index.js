process.env.NODE_ENV = 'test'

const test = require('tape')
const setup = require('./setup')

test('app runs', function (t) {
  const app = setup.createApp(t)
  setup.waitForLoad(app, t)
    .then(
      () => app.client.waitUntilTextExists(
        '.bp3-navbar-heading',
        'Welcome to Delta.Chat',
        20e3
      )
    )
    .then(
      () => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error')
    )

  // require('./basic-functions')
})
