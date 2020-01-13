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
      this.browser.$('=' + label).waitForExist(5000)
      await this.browser.click('=' + label)
    }
  },
  async openSettings () {
    await this.openMainMenuItem('Settings')
  },
  async logout () {
    await this.openMainMenuItem('Switch account')
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
  clearAndSetValue (selector, value) {
    // this.browser.click(selector).click(selector) // selects the text written in the input
    // this.browser.keys('Delete') // removes old value
    this.browser.$(selector).$(function () {
      console.log(this.value)
      return this.nextSibling
    })
    this.browser.setValue(selector, value) // sets new Value
    return this
  },
  click (selector) {
    this.browser.click(selector)
    return this
  },
  async clickChatByName (name) {
    this.browser.click('.chat-list-item__name=' + name)
  }
}

module.exports = domHelper
