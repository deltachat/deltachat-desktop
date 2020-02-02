import { Selector, t } from 'testcafe'
import { createTmpUser } from '../integration/fixtures/config'

const waitForLogin = 50000
const welcomeMessage = 'Select a chat or create a new chat'

async function clickAppMenuItem (label) {
  await t.click('#main-menu-button')
  await t.expect(Selector('a.bp3-menu-item').withText(label).exists).ok()
  await t.click(Selector('a.bp3-menu-item').withText(label))
}

async function logout () {
  await clickAppMenuItem('Switch account')
}

async function closeDialog () {
  await t.click('.DeltaDialog .bp3-dialog-close-button')
}

async function loginWithTmpUser () {
  const account = await createTmpUser()
  await t.expect(Selector('.bp3-navbar-heading').innerText).eql('Welcome to Delta Chat')
    .typeText('#addr', account.email)
    .typeText('#mail_pw', account.password)
    .click('button[type=\'submit\']')
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
  return account
}

module.exports = {
  clickAppMenuItem,
  loginWithTmpUser,
  logout,
  closeDialog
}
