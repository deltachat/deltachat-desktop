import { Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import { loginWithTmpUser, logout, clickAppMenuItem, closeDialog } from './helpers'
import { clickOnMainMenuItem } from 'testcafe-browser-provider-electron';

fixture('Help-page tests')
  .page('../../static/test.html')
  .beforeEach(async () => {
    await waitForReact()
  })

test('help-page: click in menu opens it', async (t) => {
  await clickAppMenuItem('Help')
  const headText = await Selector('.bp3-dialog-header').textContent
  const bodyText = await Selector('.bp3-dialog-body').textContent

  await t
    .expect(headText).eql('Help')
    .expect(bodyText.trim().slice(0, 19)).eql('What is Delta Chat?')
})

test('help-page: opens in german language if language is set to "Deutsch"', async (t) => {
  await clickOnMainMenuItem(['View', 'Language', 'Deutsch'])

  await clickAppMenuItem('Hilfe')
  const headText = await Selector('.bp3-dialog-header').textContent
  const bodyText = await Selector('.bp3-dialog-body').textContent

  await t
    .expect(headText).eql('Hilfe')
    .expect(bodyText.trim().slice(0, 19)).eql('Was ist Delta Chat?')
})

test('help-page: opens in english language if language is set to "Español"', async (t) => {
  await clickOnMainMenuItem(['Ansicht', 'Sprache', 'Español'])

  await clickAppMenuItem('Ayuda')
  const headText = await Selector('.bp3-dialog-header').textContent
  const bodyText = await Selector('.bp3-dialog-body').textContent

  await t
    .expect(headText).eql('Ayuda')
    .expect(bodyText.trim().slice(0, 19)).eql('What is Delta Chat?')

  // Last test of this group, let's try to reset some things.
  await clickOnMainMenuItem(['Ver', 'Idioma', 'English'])
  await closeDialog()
  await logout()
})
