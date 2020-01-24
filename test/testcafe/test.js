import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
const { createTmpUser } = require('../integration/fixtures/config')

/* global fixture, test */

const waitForLogin = 50000
const conf = {}
const welcomeMessage = 'Select a chat or create a new chat'
const testMessage = 'Test message'
let accountButton1 = null
let accountButton2 = null

async function openMainMenuItem (t, label) {
  await t.click('#main-menu-button').wait(1000)
  if (label) {
    await t.expect(Selector('a.bp3-menu-item').withText(label).exists).ok()
    await t.click(Selector('a.bp3-menu-item').withText(label))
  }
  return t
}

const logout = async (t) => openMainMenuItem(t, 'Switch account')

const clickChatByName = async (t, name) => {
  return t.click(Selector('.chat-list-item__name').withText(name))
}

fixture('Chat e2e tests').page('../../static/test.html').beforeEach(async () => {
  await waitForReact()
})

test('shows correct headline', async t => {
  await t.expect(Selector('.bp3-navbar-heading').innerText).eql('Welcome to Delta Chat')
    .typeText('#addr', 'foo')
    .typeText('#mail_pw', 'bar')
    .click('button[type=\'submit\']')
    .expect(Selector('.user-feedback').innerText).eql('Bad email address.')
})

test('login works', async t => {
  conf.account1 = await createTmpUser()
  await t.expect(Selector('.bp3-navbar-heading').innerText).eql('Welcome to Delta Chat')
    .typeText('#addr', conf.account1.email)
    .typeText('#mail_pw', conf.account1.password)
    .click('button[type=\'submit\']')
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
  await logout(t)
})

test('login button is shown', async t => {
  accountButton1 = Selector('ul li button').withText(conf.account1.email)
  await t.expect(accountButton1.exists).ok()
})

test('second login works', async t => {
  conf.account2 = await createTmpUser()
  await t.expect(Selector('.bp3-navbar-heading').innerText).eql('Welcome to Delta Chat')
    .typeText('#addr', conf.account2.email)
    .typeText('#mail_pw', conf.account2.password)
    .click('button[type=\'submit\']')
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
  await logout(t)
})

test('both login buttons are shown', async t => {
  accountButton2 = Selector('ul li button').withText(conf.account2.email)
  await t.expect(accountButton2.exists).ok()
  await t.expect(Selector('ul li').count).eql(2)
})

test('create chat', async t => {
  await t.click(accountButton1)
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
  await openMainMenuItem(t, 'New chat')
  await t.expect(Selector('.FixedDeltaDialog').exists).ok()
  await t.typeText('.FixedDeltaDialog input', conf.account2.email)
    .click(Selector('p').withText('New contact'))
  await clickChatByName(t, conf.account2.email)
})

test('write message', async t => {
  await t.typeText('#composer-textarea', testMessage)
    .click('button[aria-label=\'Send\']')
    .expect(Selector('#message-list li').count).eql(1)
  await logout(t)
})

test('Contact request and receive message works', async t => {
  await t.click(accountButton2)
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
    .expect(Selector('.chat-list-item__name').withText('Contact request').exists).ok()
  await t.expect(Selector('.chat-list-item__name', { timeout: 20000 }).withText('Contact request').exists).ok()
  await clickChatByName(t, 'Contact request')
  await t.click(Selector('p').withText('YES'))
    .expect(Selector('#message-list li').count).eql(1)
    .expect(Selector('.text').withText(testMessage).exists).ok()
})
