import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import { loginWithTmpUser, logout, clickAppMenuItem } from './helpers'

/* global fixture, test */

const waitForLogin = 50000
const conf = {}
const welcomeMessage = 'Select a chat or create a new chat'
const testMessage = 'Test message'
let accountButton1 = null
let accountButton2 = null

const clickChatByName = async (t, name) => {
  return t.click(Selector('.chat-list-item__name').withText(name))
}

fixture('Chat e2e tests').page('../../html-dist/test.html').beforeEach(async () => {
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
  conf.account1 = await loginWithTmpUser()
  await logout()
})

test('login button is shown', async t => {
  accountButton1 = Selector('ul li button').withText(conf.account1.email)
  await t.expect(accountButton1.exists).ok()
})

test('second login works', async t => {
  conf.account2 = await loginWithTmpUser()
  await logout()
})

test('both login buttons are shown', async t => {
  accountButton2 = Selector('ul li button').withText(conf.account2.email)
  await t.expect(accountButton2.exists).ok()
  await t.expect(Selector('ul li').count).eql(2)
})

test('create chat', async t => {
  await t.click(accountButton1)
    .expect(Selector('h2', { timeout: waitForLogin }).innerText).eql(welcomeMessage)
  await clickAppMenuItem('New chat')
  await t.expect(Selector('.FixedDeltaDialog').exists).ok()
  await t.typeText('.FixedDeltaDialog input', conf.account2.email)
    .click(Selector('p').withText('New contact'))
  await clickChatByName(t, conf.account2.email)
})

test('write message', async t => {
  await t.typeText('#composer-textarea', testMessage)
    .click('button[aria-label=\'Send\']')
    .expect(Selector('#message-list li').count).eql(1)
  await logout()
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
