//@ts-check
import { Selector, t, ClientFunction  } from 'testcafe'
import { createTmpUser } from '../integration/fixtures/config'

const waitForLogin = 50000

export async function clickAppMenuItem (label) {
  await t.click('#main-menu-button')
  await t.expect(Selector('a.bp3-menu-item').withText(label).exists).ok()
  await t.click(Selector('a.bp3-menu-item').withText(label))
}

export async function logout () {
  await clickAppMenuItem(await translate('switch_account'))
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
    .expect(Selector('h2', { timeout: waitForLogin }).innerText)
    .eql(await translate('no_chat_selected_suggestion_desktop'))
  return account
}

export const translate = ClientFunction((...args) => window.static_translate(...args))
