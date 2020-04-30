process.env.NODE_ENV = 'test'

import test from 'tape'
import setup from './setup.js'
import domHelper from './domHelper.js'
const testCredentials = setup.getConfig().credentials

test('app runs', async (t) => {
  const app = setup.createApp()
  await setup.waitForLoad(app, t)
  const text = await app.client.getText('.bp3-navbar-heading')
  t.equal(text, 'Welcome to Delta Chat', 'App is loaded and welcome message is shown')
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

    await setup.wait(1000)
    const text = await app.client.getText('.user-feedback')
    t.equal(text, 'Bad email address.', 'Mail validation error is shown')
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
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', 'Select a chat or create a new chat', 20e3)
    const text = await app.client.getText('h2')
    t.equal(text, 'Select a chat or create a new chat', 'Login successful')
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
    await app.client.waitUntilTextExists('h2', 'Select a chat or create a new chat', 20e3)
    const text = await app.client.getText('h2')
    t.equal(text, 'Select a chat or create a new chat', 'Welcome message is shown')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('App loads language from config file', async (t) => {
  const app = setup.createAppWithConfig({ locale: 'de' })
  try {
    await setup.waitForLoad(app, t)
    await app.client.waitUntilTextExists('h2', 'Wähle einen Chat aus oder erstelle einen neuen Chat.', 20e3)
    const text = await app.client.getText('h2')
    t.equal(text, 'Wähle einen Chat aus oder erstelle einen neuen Chat.', 'Localized welcome message is shown')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('Update and persist Desktop settings', async (t) => {
  const app = setup.createAppWithConfig({})
  try {
    await setup.waitForLoad(app, t)
    domHelper.init(app)
    await app.client.waitUntilTextExists('h2', 'Select a chat or create a new chat', 20e3)
    await domHelper.openSettings()
    let currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
    await t.equals(currentConfig['enterKeySends'], true, 'enterKeySends is true in config.json')
    await t.ok(await domHelper.isActiveSwitch('Enter key sends'), 'enterKeySends switch is active')
    await app.client.pause(200) // give react time to update dom
    await app.client.$('label=Enter key sends').click()
    await app.client.pause(1100) // has to be greater than state.SAVE_DEBOUNCE_INTERVAL
    await t.ok(await domHelper.isInactiveSwitch('Enter key sends'), 'enterKeySends switch is not active after click')
    currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
    await t.equals(currentConfig['enterKeySends'], false, 'enterKeySends is false in config.json')
    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})
