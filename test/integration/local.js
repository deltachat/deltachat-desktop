const setup = require('./setup')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const domHelper = require('./domHelper')
const { createTmpUser } = require('../integration/fixtures/config')
const { describe, it, before, after } = require('mocha')

process.env.NODE_ENV = 'test'

chai.should()
chai.use(chaiAsPromised)
const app = setup.createApp()
const assert = chai.assert
chai.config.includeStack = true

const testMessage1 = 'Test message 1'
const conf = {
  account1: null,
  account2: null
}
const welcomeMessage = 'Select a chat or create a new chat'

const runAppSession = (name, tests) => {
  describe(name, function () {
    before(function async () {
      chaiAsPromised.transferPromiseness = app.transferPromiseness
      return app.start().then(() => {
        domHelper.init(app)
        return app.client.waitUntilWindowLoaded()
      })
    })
    tests()
    after(function () {
      if (app && app.isRunning()) {
        return app.stop()
      }
    })
  })
}

runAppSession('Login with false mail address gives an error', function () {
  it('app runs', async () => {
    app.client.getText('.bp3-navbar-heading')
      .should.eventually.equal(
        'Welcome to Delta Chat',
        'App is loaded and welcome message is shown'
      )
  })

  it('wrong credentials results in error message', async () => {
    domHelper.init(app)
    app.client
      .setValue('#addr', 'foo')
      .setValue('#mail_pw', 'bar')
      .click('button[type=\'submit\']')
    await setup.wait(1000)
    app.client.getText('.user-feedback').should.eventually.equal(
      'Bad email address.',
      'Mail validation error is shown'
    )
    app.client.$('.user-feedback').click()
  })
})

runAppSession('Login with valid credentials works', function () {
  it('login with valid credentials', async () => {
    conf.account1 = await createTmpUser()
    app.client
      .setValue('#addr', conf.account1.email)
      .setValue('#mail_pw', conf.account1.password)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    app.client.getText('h2').should.eventually.equal(welcomeMessage)
    await domHelper.logout()
  })
})

runAppSession('Login with other valid credentials works', function () {
  it('login with valid other credentials', async function () {
    conf.account2 = await createTmpUser()
    app.client
      .setValue('#addr', conf.account2.email)
      .setValue('#mail_pw', conf.account2.password)
      .click('button[type=\'submit\']')

    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    app.client.getText('h2').should.eventually.equal(welcomeMessage)
    await domHelper.logout()
  })
})

runAppSession('Accounts are created', function () {
  it('accounts are created', async () => {
    await app.client.pause(500)
    await app.client.waitUntilTextExists('p', 'Known accounts', 20e3)
    await app.client.waitUntilTextExists('.bp3-button-text', conf.account1.email, 20e3)
    await app.client.waitUntilTextExists('.bp3-button-text', conf.account2.email, 20e3)
  })
})

runAppSession('Create chat and send message works', function () {
  it('create chat', async () => {
    await domHelper.login(conf.account2.email)
    await app.client.waitUntilTextExists('h2', welcomeMessage, 20e3)
    await domHelper.openMainMenuItem('New chat')
    await app.client.waitUntilTextExists('p', 'New group', 20e3)
    assert.isOk(await app.client.$('.FixedDeltaDialog'), 'Dialog is shown')
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

runAppSession('Contact request and receive message works', function () {
  it('contact request is displayed', async () => {
    await app.client.waitUntilTextExists('.bp3-button-text', conf.account1.email, 20e3)
    await domHelper.login(conf.account1.email)
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

runAppSession('Update and persist Desktop settings', function () {
  it('changing a settings is applied to config.json', async () => {
    await domHelper.login(conf.account2.email)
    await domHelper.openSettings()
    let currentConfig = await setup.readConfigFile()
    await assert.equal(currentConfig['enterKeySends'], false, 'enterKeySends is false in config.json')
    await app.client.pause(200) // give react time to update dom
    await assert.isOk(await domHelper.isInactiveSwitch('Enter key sends'), 'enterKeySends switch is not active after click')
    await app.client.$('label=Enter key sends').click()
    await app.client.pause(1100) // has to be greater than state.SAVE_DEBOUNCE_INTERVAL
    await assert.isOk(await domHelper.isActiveSwitch('Enter key sends'), 'enterKeySends switch is active')
    currentConfig = await setup.readConfigFile()
    await assert.equal(currentConfig['enterKeySends'], true, 'enterKeySends is true in config.json')
  })
})
