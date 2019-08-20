const domHelper = {
  browser: null,

  init (app) {
    this.browser = app.client
  },

  async openMainMenu () {
    await this.browser.click('#main-menu-button')
  },
  async openSettings () {
    await this.openMainMenu()
    await this.browser.click('=Settings')
  },
  async logout () {
    await this.browser.click('#main-menu-button')
    await this.browser.click('=Logout')
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
