process.env.NODE_ENV = 'test'

const test = require('tape')
const setup = require('./setup')
const testCredentials = setup.testConfig.credentials

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
      .setValue('#mailPw', 'bar')
      .click('button[type=\'submit\']')

    await setup.wait(5000)
    let text = await app.client.getText('.user-feedback')
    t.equal(text, 'Bad email-address.')
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
      .setValue('#mailPw', testCredentials.mailPw)
      .click('#showAdvancedButton')
      .setValue('#mailUser', testCredentials.mailUser)
      .setValue('#mailServer', testCredentials.mailServer)
      .setValue('#mailPort', testCredentials.mailPort)
      .setValue('#sendUser', testCredentials.sendUser)
      .setValue('#sendPw', testCredentials.sendPw)
      .setValue('#sendServer', testCredentials.sendServer)
      .setValue('#sendPort', testCredentials.sendPort)
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
    await app.client.waitUntilTextExists('h1', 'Willkommen zu DeltaChat', 20e3)
    let text = await app.client.getText('h1')
    await t.equal(text, 'Willkommen zu DeltaChat')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})
