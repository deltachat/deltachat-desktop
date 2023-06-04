//@ts-check
import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import { loginWithTmpUser, logout, clickThreeDotMenuItem, translate, clickSideBarItem } from './helpers'

/* global fixture, test */
'.bp4-navbar-heading'
const waitForLogin = 5000
const conf = {}
const testMessage = 'Test message'
let accountButton1 = null
let accountButton2 = null

const clickChatByName = async (t, name) => {
  return t.click(
    Selector('.chat-list-item > .content > .header > .name > span').withText(
      name
    )
  )
}

fixture('Chat e2e tests')
  .page('../../html-dist/test.html')
  .beforeEach(async () => {
    await waitForReact()
  })

async function goBackToAccountOverviewIfNeeded(t) {
  let cancelButton = Selector('#action-cancel')
  if (await cancelButton.exists) {
    await t.click(cancelButton)
    return
  }
  let menu_button = Selector('#hamburger-menu-button')
  if (await menu_button.exists) {
    await logout()
  }
}

test('shows correct headline', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  await t
    .expect(Selector('.welcome-deltachat > .f1').innerText)
    .eql(await translate('welcome_chat_over_email'))
    .click('#action-login-to-email')
    .typeText('#addr', 'foo')
    .typeText('#mail_pw', 'bar')
    .click("#action-login")
    .expect(Selector('.delta-dialog-content > p').innerText)
    .contains('Bad email-address: Email "foo" must contain \'@\' character')
})

test('login works', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  conf.account1 = await loginWithTmpUser()
  //console.log(conf.account1)
  await t.expect(conf.account1).notEql(undefined)
  await logout()
})

test('account is shown on account overview', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  accountButton1 = Selector('.display-name').withText(conf.account1.email)
  await t.expect(accountButton1.exists).ok()
  await t.expect(Selector('.contact-list-item').count).eql(2)
})

test('second login works', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  await t.click('#action-go-to-login')
  conf.account2 = await loginWithTmpUser()
  //console.log(conf.account2)
  await t.expect(conf.account2).notEql(undefined)
  await logout()
})

test('both login buttons are shown', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  accountButton2 = Selector('.display-name').withText(conf.account2.email)
  await t.expect(accountButton2.exists).ok()
  await t.expect(Selector('.contact-list-item').count).eql(3)
})

test('create chat', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  await t
    .click(accountButton1)
  await clickSideBarItem(await translate('menu_new_chat'))
  await t.expect(Selector('.FixedDeltaDialog').exists).ok()
  await t.typeText('.FixedDeltaDialog input', conf.account2.email)
  await t
    .expect(Selector('div.display-name').withText(await translate('menu_new_contact')).exists)
    .ok()
  await t.click(
    Selector('div.display-name')
      .withText(await translate('menu_new_contact'))
      .parent(0)
  )
  await clickChatByName(t, conf.account2.email)
})

test('write message', async t => {
  await goBackToAccountOverviewIfNeeded(t)
  await t
    .click(accountButton1)
  await clickChatByName(t, conf.account2.email)
  await t
    .typeText('#composer-textarea', testMessage)
    .click("button[aria-label='" + await translate('menu_send') + "']")
    .expect(Selector('#message-list li').count)
    .eql(1)
  await logout()
})

test('open settings dialog and close with escape', async t => {

  await goBackToAccountOverviewIfNeeded(t)
  const SettingsShouldBeOpen = async ()=>{
    await t
    .expect(
      Selector(
        '.bp4-dialog-header.bp4-dialog-header-border-bottom > .bp4-heading'
      ).innerText
    )
    .eql(await translate('menu_settings'))
  }
  const SettingsShouldBeClosed = async ()=>{
    await t.wait(1000).expect(
      Selector(
        '.bp4-dialog-header.bp4-dialog-header-border-bottom > .bp4-heading'
      ).exists
    ).notOk()
  }

  await t.click(accountButton1)
  // check open via menu
  await clickSideBarItem(await translate('menu_settings'))
  await SettingsShouldBeOpen()
  // check close via keycombination
  await t.pressKey('esc')
  await SettingsShouldBeClosed()
  // check open via keycombination
  await t.pressKey('Ctrl+,')
  await SettingsShouldBeOpen()
  // check close via close button
  await t.click(Selector(".SettingsDialog .close-btn"))
  await SettingsShouldBeClosed()
  await logout()
})

if (process.env.CI !== 'true') {
  test('Contact request and receive message works', async t => {
  await goBackToAccountOverviewIfNeeded(t)
    await t
      .click(accountButton2)
      await t
      .expect(
        Selector('.chat-list-item.is-contact-request').exists
      )
      .ok({ timeout: 30000 })

    await t.click('.chat-list-item.is-contact-request')
    await t
      .expect(Selector('#message-list li').count)
      .eql(1)
      .expect(Selector('.text').withText(testMessage).exists)
      .ok()
  })

}
