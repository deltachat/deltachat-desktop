const setup = require('./setup')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const domHelper = require('./domHelper')
const { createTmpUser } = require('../integration/fixtures/config')
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

const testMessage1 = 'Test message 1'

describe('Login with false mail address gives an error', function () {
  this.timeout(30000)
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
    const text = await app.client.getText('.bp3-navbar-heading')
    return assert.equal(text, 'Welcome to Delta Chat', 'App is loaded and welcome message is shown')
  })

  it('wrong credentials results in error message', async () => {
    domHelper.init(app)
    app.client
      .setValue('#addr', 'foo')
      .setValue('#mail_pw', 'bar')
      .click('button[type=\'submit\']')
    await setup.wait(1000)
    const text = await app.client.getText('.user-feedback')
    app.client.$('.user-feedback').click()
    return assert.equal(text, 'Bad email address.', 'Mail validation error is shown')
  })
})

const conf = {
  account1: null,
  account2: null
}

const welcomeMessage = 'Select a chat or create a new chat'

describe('Login with valid credentials works', function () {
  this.timeout(30000)
  before(function async () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.start()
  })
  after(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it('login with valid credentials', async () => {
    domHelper.init(app)
    conf.account1 = await createTmpUser()
    app.client
      .setValue('#addr', conf.account1.email)
      .setValue('#mail_pw', conf.account1.password)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    app.client.getText('h2').should.eventually.equal(welcomeMessage)
  })
  // it('changing settings is applied to config', async () => {
  //   domHelper.init(app)
  //   await domHelper.openSettings()
  //   let currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
  //   assert.equal(currentConfig['enterKeySends'], false, 'enterKeySends is true in config.json')
  //   assert.isTrue(await domHelper.isInactiveSwitch('Enter key sends'), 'enterKeySends switch is inactive')
  //   await app.client.$('label=Enter key sends').click()
  //   await app.client.pause(1100) // has to be greater than state.SAVE_DEBOUNCE_INTERVAL
  //   await assert.isTrue(await domHelper.isActiveSwitch('Enter key sends'), 'enterKeySends switch is active after click')
  //   currentConfig = await setup.readConfigFile(app.env.TEST_DIR + '/config.json')
  //   const newSetting = currentConfig['enterKeySends']
  //   await domHelper.closeDialog()
  //   return assert.isTrue(newSetting, 'enterKeySends is false in config.json')
  // })
  it('account is created and a button shown in login screen', async () => {
    await domHelper.logout()
    await app.client.waitUntilTextExists('p', 'Known accounts', 20e3)
    assert.isNotEmpty(await app.client.$('p=Known accounts'), 'Account list exists')
    const accountButton = await app.client.$('=' + conf.account1.email)
    assert.isNotEmpty(accountButton, 'Account button exists')
  })
  it('account can login again', async () => {
    app.client.$('ul li:first-child').click()
    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    app.client.getText('h2').should.eventually.equal(welcomeMessage)
    await domHelper.logout()
  })
})

describe('Create chat and send message works', function () {
  this.timeout(30000)
  before(function () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.start()
  })
  after(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })
  it('login with other valid credentials works', async () => {
    domHelper.init(app)
    conf.account2 = await createTmpUser()
    app.client
      .setValue('#addr', conf.account2.email)
      .setValue('#mail_pw', conf.account2.password)
      .click('button[type=\'submit\']')
    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
  })
  it('create chat', async () => {
    await domHelper.openMainMenuItem('New chat')
    app.client.$('.FixedDeltaDialog input').setValue(conf.account1.email)
    await app.client.waitUntilTextExists('p', 'New contact', 20e3)
    assert.isOk(await app.client.$('p=New contact'), 'New contact button is visible')
    await app.client.$('p=New contact').click()
    domHelper.clickChatByName(conf.account1.email)
  })
  it('send message', async () => {
    await app.client.waitForExist('#composer-textarea', 3000)
    await app.client.setValue('#composer-textarea', testMessage1)
    await app.client.click('button[aria-label=\'Send\']')
    await domHelper.logout()
  })
})

describe('Contact request and receive message works', function () {
  this.timeout(30000)
  before(function async () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.start()
  })
  after(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })
  it('contact request is displayed', async () => {
    domHelper.init(app)
    app.client.$('ul li:first-child').click()
    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    await app.client.waitUntilTextExists('.chat-list-item__name', 'Contact request', 20e3)
    await domHelper.clickChatByName('Contact request')
  })
  it('contact request and message are displayed', async () => {
    await app.client.waitUntilTextExists('p', 'YES', 20e3)
    assert.isOk(await app.client.$('p=YES'), 'Contact request is visible')
    await setup.wait(200)
    await app.client.click('p=YES')
    const messages = await app.client.$$('#message-list li')
    assert.equal(messages.length, 1, 'Message is displayed')
    const messageText = await app.client.$('.text').getText()
    assert.equal(testMessage1, messageText)
    await domHelper.logout()
  })
})
