const domHelper = {
  browser: null,

  getMainMenuItemSelector (index) {
    return `.bp3-menu li:nth-child(${index}) a.bp3-menu-item`
  },

  init (app) {
    this.browser = app.client
  },

  async openMainMenuItem (itemClass) {
    this.browser.$('#main-menu-button').waitForExist(5000)
    await this.browser.click('#main-menu-button')
    this.browser.$('=Settings').waitForExist(5000)
    await this.browser.click('=Settings')
  },
  async openSettings () {
    await this.openMainMenuItem('bp3-icon-settings')
  },
  async logout () {
    await this.openMainMenuItem('bp3-icon-log-out')
  },
  async closeDialog () {
    await this.browser.click('.bp3-dialog-close-button')
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
  }
}

module.exports = domHelper
