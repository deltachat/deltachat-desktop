//@ts-check
import { Selector, t, ClientFunction  } from 'testcafe'
import { createTmpUser } from '../integration/fixtures/config'

const waitForLogin = 50000

export async function clickThreeDotMenuItem (label) {
  await t.click('#three-dot-menu-button')
  // await ClientFunction(() => document.querySelector('#three-dot-menu-button').click())()
  await t.expect(Selector('dc-context-menu > .item').withText(label).exists).ok()
  await t.click(Selector('dc-context-menu > .item').withText(label))
}

export async function clickSideBarItem (label) {
  await t.click('#hamburger-menu-button')
  await t.expect(Selector('.sidebar-item').withText(label).exists).ok()
  await t.click(Selector('.sidebar-item').withText(label))
}

export async function logout () {
  await clickThreeDotMenuItem(await translate('switch_account'))
}

export async function closeDialog () {
  await t.click('.DeltaDialog .bp3-dialog-close-button')
}

export async function loginWithTmpUser () {
  const account = await createTmpUser()
  await t
    .click('#action-go-to-login')
    .typeText('#addr', account.email)
    .typeText('#mail_pw', account.password)
    .click("#action-login")
    .expect(Selector('.info-message.big', { timeout: waitForLogin }).innerText)
    .eql(await translate('no_chat_selected_suggestion_desktop'))
  return account
}

export const translate = ClientFunction((...args) => window.static_translate(...args))
