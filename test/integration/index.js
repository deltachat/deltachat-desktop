process.env.NODE_ENV = 'test'

const test = require('tape')
const setup = require('./setup')
const testCredentials = setup.getConfig().credentials

test('app runs', async (t) => {
  const app = setup.createApp()
  await setup.waitForLoad(app, t)
  let text = await app.client.getText('.bp3-navbar-heading')
  t.equal(text, 'Welcome to DeltaChat')
  setup.endTest(app, t)
})

test('Bad mail address results in error message', async (t) => {
  const app = setup.createApp()
  try {
    await setup.waitForLoad(app, t)
    app.client
      .setValue('#addr', 'foo')
      .setValue('#mail_pw', 'bar')
      .click('button[type=\'submit\']')

    await setup.wait(5000)
    let text = await app.client.getText('.user-feedback')
    t.equal(text, 'Bad email address.')
    setup.endTest(app, t)
  } catch (err) {
    setup.endTest(app, t, err || 'error')
  }
})

test('Valid mail credentials results in success message', async (t) => {
  const app = setup.createApp()
  try {
    await setup.waitForLoad(app, t)
    app.client
      .setValue('#addr', testCredentials.addr)
      .setValue('#mail_pw', testCredentials.mail_pw)
      .click('#show-advanced-button')
      .setValue('#mail_user', testCredentials.mail_user)
      .setValue('#mail_server', testCredentials.mail_server)
      .setValue('#mail_port', testCredentials.mail_port)
      .setValue('#send_user', testCredentials.send_user)
      .setValue('#send_pw', testCredentials.send_pw)
      .setValue('#send_server', testCredentials.send_server)
      .setValue('#send_port', testCredentials.send_port)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h1', 'Welcome to DeltaChat', 20e3)
    let text = await app.client.getText('h1')
    t.equal(text, 'Welcome to DeltaChat')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('App uses credentials from existing config file', async (t) => {
  const app = setup.createAppWithConfig({})
  try {
    await setup.waitForLoad(app, t)
    await app.client.waitUntilTextExists('h1', 'Welcome to DeltaChat', 20e3)
    let text = await app.client.getText('h1')
    await t.equal(text, 'Welcome to DeltaChat')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('App loads language from config file', async (t) => {
  const app = setup.createAppWithConfig({ 'locale': 'de' })
  try {
    await setup.waitForLoad(app, t)
    await app.client.waitUntilTextExists('h1', 'Willkommen zu Delta Chat', 20e3)
    let text = await app.client.getText('h1')
    await t.equal(text, 'Willkommen zu Delta Chat')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})
