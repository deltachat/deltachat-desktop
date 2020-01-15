const test = require('tape')

const setup = require('./setup')
const testCredentials = setup.getConfig().credentials

test('help-page: click in menu opens it', async (t) => {
  t.timeoutAfter(20e3)
  // TODO: use setup.createAppWithConfig({}) instead of clicking through the login screen, once #1399 is fixed.
  const app = setup.createApp(t)
  try {
    await setup.waitForLoad(app, t)
    app.client
      .setValue('#addr', testCredentials.addr)
      .setValue('#mail_pw', testCredentials.mail_pw)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', 'Select a chat or create a new chat', 20e3)
    await app.client.click('button#main-menu-button')
    await app.client.waitUntilTextExists('.bp3-menu', 'Help')
    await app.client.$('#help-page-link').click()
    await app.client.waitUntilTextExists('.bp3-dialog-header', 'Frequently Answered Questions')

    const text = await app.client.getText('.bp3-dialog-body')
    t.equal(text.slice(0, 19), 'What is Delta Chat?', 'finds expected text in body')

    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('help-page: opens in german language if locale is "de"', async (t) => {
  t.timeoutAfter(20e3)
  const app = setup.createAppWithConfig({ locale: 'de' })
  try {
    await setup.waitForLoad(app, t)
    app.client
      .setValue('#addr', testCredentials.addr)
      .setValue('#mail_pw', testCredentials.mail_pw)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', 'Wähle einen Chat aus oder erstelle einen neuen Chat.', 20e3)
    await app.client.click('button#main-menu-button')
    await app.client.waitUntilTextExists('.bp3-menu', 'Hilfe')
    await app.client.$('#help-page-link').click()
    await app.client.waitUntilTextExists('.bp3-dialog-header', 'Frequently Answered Questions')

    const text = await app.client.getText('.bp3-dialog-body')
    t.equal(text.slice(0, 19), 'Was ist Delta Chat?', 'finds expected german text in body')

    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})

test('help-page: opens in english language if locale is "es"', async (t) => {
  t.timeoutAfter(20e3)
  const app = setup.createAppWithConfig({ locale: 'es' })
  try {
    await setup.waitForLoad(app, t)
    app.client
      .setValue('#addr', testCredentials.addr)
      .setValue('#mail_pw', testCredentials.mail_pw)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', 'Selecciona un chat o crea uno nuevo', 20e3)
    await app.client.click('button#main-menu-button')
    await app.client.waitUntilTextExists('.bp3-menu', 'Ayuda')
    await app.client.$('#help-page-link').click()
    await app.client.waitUntilTextExists('.bp3-dialog-header', 'Frequently Answered Questions')

    const text = await app.client.getText('.bp3-dialog-body')
    t.equal(text.slice(0, 19), 'What is Delta Chat?', 'finds expected text in body')

    setup.endTest(app, t)
  } catch (err) {
    app.client.getMainProcessLogs().then(
      (logs) => console.log(logs)
    )
    setup.endTest(app, t, err || 'error')
  }
})
