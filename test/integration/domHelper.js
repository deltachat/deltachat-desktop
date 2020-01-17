const domHelper = {
  browser: null,
  app: null,

  getMainMenuItemSelector (index) {
    return `.bp3-menu li:nth-child(${index}) a.bp3-menu-item`
  },

  init (app) {
    this.app = app
    this.browser = app.client
  },

  async openMainMenuItem (label) {
    this.browser.$('#main-menu-button').waitForExist(5000)
    await this.browser.click('#main-menu-button')
    if (label) {
      await this.browser.pause(500)
      this.browser.$('=' + label).waitForExist(5000)
      await this.browser.click('=' + label)
    }
  },
  async openSettings () {
    await this.openMainMenuItem('Settings')
  },
  async logout () {
    return this.openMainMenuItem('Switch account')
  },
  async closeDialog () {
    this.browser.$('.bp3-dialog-header .bp3-dialog-close-button').click()
  },
  async isActiveSwitch (label) {
    try {
      this.browser.$('label=' + label).waitForExist(1000)
      return await this.browser.$('label=' + label).getAttribute('class') === 'bp3-control bp3-switch active'
    } catch (error) {
      return false
    }
  },
  async isInactiveSwitch (label) {
    try {
      this.browser.$('label=' + label).waitForExist(1000)
      return await this.browser.$('label=' + label).getAttribute('class') === 'bp3-control bp3-switch inactive'
    } catch (error) {
      return false
    }
  },
  click (selector) {
    this.browser.click(selector)
    return this
  },
  async clickChatByName (name) {
    this.browser.click('.chat-list-item__name=' + name)
  },
  async login (accountAddress) {
    await this.browser.pause(500)
    await this.browser.waitUntilTextExists('.bp3-button-text', accountAddress, 20e3)
    return this.browser.$('.bp3-button-text=' + accountAddress).click()
  }
}

module.exports = domHelper
