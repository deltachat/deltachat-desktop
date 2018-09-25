const test = require('tape')

const setup = require('./setup')

test('basic: login', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.click('button'))
    .then(() => app.client.waitUntilTextExists('.bp3-navbar', 'Logout')
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('basic: add contact', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.click('button'))
    .then(() => app.client.waitUntilTextExists('.bp3-navbar', 'Logout'))
    .then(() => app.client.click('button#add-contact'))
    .then(() => app.client.waitUntilTextExists('.window', 'E-Mail Address'))
    .then(() => app.client.setValue('#email', 'theiremail@email.com'))
    .then(() => app.client.setValue('#name', 'theiremail'))
    .then(() => app.client.click('form button'))
    .then(() => app.client.waitUntilTextExists('.bp3-navbar', 'Logout'))
    .then(() => app.client.click('button#add-chat'))
    .then(() => app.client.waitUntilTextExists('.window', 'theiremail@email.com'))
    .then(() => app.client.click('.module-contact-list-item'))
    .then(() => app.client.waitUntilTextExists('.window', 'theiremail@email.com'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
