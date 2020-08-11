import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import { loginWithTmpUser, logout, clickAppMenuItem, translate } from './helpers'

/* global fixture, test */
'.bp3-navbar-heading'
const waitForLogin = 50000
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

test('shows correct headline', async t => {
  await t
    .expect(Selector('.welcome-deltachat > .f1').innerText)
    .eql(await translate('welcome_desktop'))
    .click('.welcome-button')
    .typeText('#addr', 'foo')
    .typeText('#mail_pw', 'bar')
    .click("#action-login")
    .expect(Selector('.delta-dialog-content > p').innerText)
    .eql('Error: ' + await translate('bad_email_address'))
})

test('login works', async t => {
  conf.account1 = await loginWithTmpUser()
  console.log(conf.account1)
  await logout()
})

test('account is shown on account overview', async t => {
  accountButton1 = Selector('.display-name').withText(conf.account1.email)
  await t.expect(accountButton1.exists).ok()
  await t.expect(Selector('.contact-list-item').count).eql(2)
})

test('second login works', async t => {
  conf.account2 = await loginWithTmpUser()
  console.log(conf.account2)
  await logout()
})

test('both login buttons are shown', async t => {
  accountButton2 = Selector('.display-name').withText(conf.account2.email)
  await t.expect(accountButton2.exists).ok()
  await t.expect(Selector('.contact-list-item').count).eql(3)
})

test('create chat', async t => {
  await t
    .click(accountButton1)
  await clickAppMenuItem(await translate('menu_new_chat'))
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

if (process.env.CI !== 'true') {
  test('Contact request and receive message works', async t => {
    await t
      .click(accountButton2)
      await t
      .expect(
        Selector('.chat-list-item > .content > .header > .name > span').withText(
          await translate('chat_contact_request')
        ).exists
      )
      .ok({ timeout: 30000 })
    await clickChatByName(t, await translate('chat_contact_request'))
    await t
      .click(Selector('p').withText((await translate('yes')).toUpperCase()))
      .expect(Selector('#message-list li').count)
      .eql(1)
      .expect(Selector('.text').withText(testMessage).exists)
      .ok()
  })

}
