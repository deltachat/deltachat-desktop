const domHelper = {
  browser: null,

  getMainMenuItemSelector (index) {
    return `.bp3-menu li:nth-child(${index}) a.bp3-menu-item`
  },

  init (app) {
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
  }
}

module.exports = domHelper
