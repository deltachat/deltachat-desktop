const domHelper = {
  browser: null,

  init (app) {
    this.browser = app.client
  },

  async openMainMenu () {
    this.browser.$('#main-menu-button').waitForExist(5000)
    await this.browser.click('#main-menu-button')
  },
  async openSettings () {
    await this.openMainMenu()
    await this.browser.click('.bp3-menu li:nth-child(3) a')
  },
  async logout () {
    await this.openMainMenu()
    await this.browser.click('.bp3-menu li:nth-child(6) a')
  },
  async closeDialog () {
    await this.browser.click('.bp3-dialog-close-button')
  },
  async isActiveSwitch (label) {
    try {
      return await this.browser.$('label=' + label).getAttribute('class') === 'bp3-control bp3-switch active'
    } catch (error) {
      return false
    }
  },
  async isInactiveSwitch (label) {
    try {
      return await this.browser.$('label=' + label).getAttribute('class') === 'bp3-control bp3-switch inactive'
    } catch (error) {
      return false
    }
  }
}

module.exports = domHelper
