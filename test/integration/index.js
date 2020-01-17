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
chai.config.includeStack = true

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
