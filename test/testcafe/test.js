import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
const { createTmpUser } = require('../integration/fixtures/config')

const waitForLogin = 50000
const conf = {}
const welcomeMessage = 'Select a chat or create a new chat'
let accountButton1 = null
let accountButton2 = null

fixture('Electron test2').page('../../static/test.html').beforeEach(async () => {
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
    .click('#main-menu-button')
    .wait(1000)
    .click('.bp3-menu li:last-of-type a.bp3-menu-item')
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
    .click('#main-menu-button')
    .wait(1000)
    .click('.bp3-menu li:last-of-type a.bp3-menu-item')
})

test('both login buttons are shown', async t => {
  accountButton2 = Selector('ul li button').withText(conf.account2.email)
  await t.expect(accountButton2.exists).ok()
  await t.expect(Selector('ul li').count).eql(2)
})
