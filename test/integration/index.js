const setup = require('./setup')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const domHelper = require('./domHelper')
const config = require('../integration/fixtures/config')
const { describe, it, before, after } = require('mocha')

process.env.NODE_ENV = 'test'

// const setup = require('./setup')
// const domHelper = require('./domHelper')
// const testCredentials = setup.getConfig().credentials

chai.should()
chai.use(chaiAsPromised)
const app = setup.createApp()
const assert = chai.assert
chai.config.includeStack = true

describe('Deltachat desktop', function () {
  this.timeout(20000)
  const account1Credentials = config.account1.credentials
  const account2Credentials = config.account2.credentials
  before(function () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.start()
  })
  after(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })
  it('app runs', async () => {
    // await waitForLoad(app, t)
    const text = await app.client.getText('.bp3-navbar-heading')
    return assert.equal(text, 'Welcome to Delta Chat', 'App is loaded and welcome message is shown')
  })
  it('wrong credentials results in error message', async () => {
    app.client
      .setValue('#addr', 'foo')
      .setValue('#mail_pw', 'bar')
      .click('button[type=\'submit\']')
    await setup.wait(1000)
    const text = await app.client.getText('.user-feedback')
    app.client.$('.user-feedback').click()
    return assert.equal(text, 'Bad email address.', 'Mail validation error is shown')
  })
  it('login with valid credentials works', async () => {
    app.client.$('#show-advanced-button').click()
    app.client
      .setValue('#addr', account1Credentials.addr)
      .setValue('#mail_pw', account1Credentials.mail_pw)
      .setValue('#mail_server', account1Credentials.mail_server)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h1', 'Welcome to Delta Chat', 20e3)
    return app.client.getText('h1').should.eventually.equal('Welcome to Delta Chat')
  })
  it('changing settings is applied to config', async () => {
    domHelper.init(app)
    await domHelper.openSettings()
    let currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
    assert.equal(currentConfig['enterKeySends'], false, 'enterKeySends is true in config.json')
    assert.isTrue(await domHelper.isInactiveSwitch('Enter key sends'), 'enterKeySends switch is inactive')
    await app.client.$('label=Enter key sends').click()
    await app.client.pause(1100) // has to be greater than state.SAVE_DEBOUNCE_INTERVAL
    await assert.isTrue(await domHelper.isActiveSwitch('Enter key sends'), 'enterKeySends switch is active after click')
    currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
    const newSetting = currentConfig['enterKeySends']
    await domHelper.closeDialog()
    return assert.isTrue(newSetting, 'enterKeySends is false in config.json')
  })
  it('account is created and a button shown in login screen', async () => {
    await domHelper.logout()
    await app.client.waitUntilTextExists('p', 'Known accounts', 20e3)
    const accountButton = await app.client.$('=' + account1Credentials.addr)
    return assert.isNotEmpty(accountButton)
  })
  it('account can login again', async () => {
    app.client.$('ul li:first-child').click()
    await app.client.waitUntilTextExists('h1', 'Welcome to Delta Chat', 20e3)
    await domHelper.logout()
  })
  it('login with valid credentials works', async () => {
    app.client.$('#show-advanced-button').click()
    app.client
      .setValue('#addr', account2Credentials.addr)
      .setValue('#mail_pw', account2Credentials.mail_pw)
      .setValue('#mail_server', account1Credentials.mail_server)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h1', 'Welcome to Delta Chat', 20e3)
    return app.client.getText('h1').should.eventually.equal('Welcome to Delta Chat')
  })
})
