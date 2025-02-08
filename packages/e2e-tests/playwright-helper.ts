import { expect, Locator, Page } from '@playwright/test'

const chatmailServer = 'https://ci-chatmail.testrun.org'

type LocatorWithSelector = Locator & {
  _selector: string
}

export type User = {
  name: string
  id: string
  address: string
}

function _hasSelector(
  arg: Locator | LocatorWithSelector
): arg is LocatorWithSelector {
  return '_selector' in arg
}

export async function switchToProfile(
  page: Page,
  accountId: string
): Promise<void> {
  await page.getByTestId(`account-item-${accountId}`).hover() // without click is not received!
  await page.getByTestId(`account-item-${accountId}`).click()
  await expect(page.getByTestId(`selected-account:${accountId}`)).toHaveCount(
    1,
    { timeout: 10000 }
  )
}

export async function createNewProfile(
  page: Page,
  name: string
): Promise<User> {
  const waitForLocator = async (locator: Locator): Promise<Locator> => {
    await locator.waitFor()
    return locator
  }

  await page.waitForSelector('.styles_module_account')
  const accountList = page.locator('.styles_module_account')

  const addAccountSelector =
    '.styles_module_accountList .styles_module_addButton'
  const welcomeButtonsSelector = '.styles_module_welcomeScreenButtonGroup'

  const returnedLocator = await Promise.race([
    // first login without account
    waitForLocator(page.locator(welcomeButtonsSelector)),
    waitForLocator(page.locator(addAccountSelector)),
  ])

  if (
    returnedLocator &&
    _hasSelector(returnedLocator) &&
    returnedLocator['_selector'] === welcomeButtonsSelector
  ) {
    // no account yet
    await page
      .locator('.styles_module_welcomeScreenButtonGroup button')
      .first()
      .click()
  } else {
    // create a new account
    returnedLocator.click()
    await page
      .locator('.styles_module_welcomeScreenButtonGroup button')
      .first()
      .click()
  }

  page.evaluate(
    `navigator.clipboard.writeText('dcaccount:${chatmailServer}/new')`
  )

  await page.getByTestId('other-login-button').click()

  await page.getByTestId('scan-qr-login').click()

  await page.getByTestId('paste').click()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(name)

  await page
    .locator('.styles_module_welcomeScreenButtonGroup button')
    .first()
    .click()

  const newAccountList = page.locator('.styles_module_account')
  await expect(newAccountList.last()).toHaveClass(/styles_module_active/)

  const settingsButton = page.locator(
    '.styles_module_accountListSidebar .styles_module_settingsButtonIcon'
  )
  await settingsButton.click()

  await expect(page.locator('.styles_module_profileDisplayName')).toHaveText(
    name
  )
  const address = await page
    .locator('.styles_module_profileAddress')
    .textContent()

  expect(address).not.toBeNull()

  await page.locator('.styles_module_headerButton').click()

  const newId = await accountList
    .last()
    .getAttribute('x-account-sidebar-account-id')

  expect(newId).not.toBeNull()

  if (newId && address) {
    return {
      id: newId,
      name,
      address,
    }
  } else {
    throw new Error(`User ${name} could not be created!`)
  }
}

export async function getProfile(page: Page, accountId: string): Promise<User> {
  await page.getByTestId(`account-item-${accountId}`).click({ button: 'right' })
  await page.getByTestId('open-settings-menu-item').click()
  // await page.getByTestId(`account-item-${accountId}`).click()
  // await page.getByTestId('open-settings-button').click()
  const name = await page
    .locator('.styles_module_profileDisplayName')
    .textContent()
  const address = await page
    .locator('.styles_module_profileAddress')
    .textContent()
  await page.getByTestId('close-settings').click()

  return {
    id: accountId,
    name: name ?? '',
    address: address ?? '',
  }
}

/**
 * can be used to load existing profiles from db
 * if fixtures are used, and the profiles are already created
 */
export async function loadExistingProfiles(page: Page): Promise<User[]> {
  // await page.goto('https://localhost:3000/')
  const existingProfiles: User[] = []
  const accountList = page.locator('.styles_module_account')
  const existingAccountItems = await accountList.count()
  /* ignore-console-log */
  console.log('existingAccountItems', existingAccountItems)
  if (existingAccountItems > 0) {
    if (existingAccountItems === 1) {
      const welcomeDialog = await page
        .locator('.styles_module_welcome')
        .isVisible()
      if (welcomeDialog) {
        // special case: when no account exists on app start a new empty
        // account is created but not yet persisted, so there are no
        // existing profiles in database yet
        return []
      }
    }
    for (let i = 0; i < existingAccountItems; i++) {
      const account = accountList.nth(i)
      const id = await account.getAttribute('x-account-sidebar-account-id')
      if (id) {
        const p = await getProfile(page, id)
        existingProfiles.push(p)
      }
    }
    return existingProfiles
  }
  return []
}

export async function deleteProfile(
  page: Page,
  accountId?: string // if empty, the last account will be deleted
): Promise<string | null> {
  await page.waitForSelector('.styles_module_account')
  const accountList = page.locator('.styles_module_account')
  await expect(accountList.last()).toBeVisible()
  const accounts = await accountList.all()
  if (accounts.length > 0) {
    if (accountId) {
      await page
        .getByTestId(`account-item-${accountId}`)
        .click({ button: 'right' })
    } else {
      await accountList.last().click({ button: 'right' })
    }
    // await page.screenshot({ path: 'accountList.png' })
    await page.getByTestId('delete-account-menu-item').click()
    await expect(page.getByTestId('account-deletion-dialog')).toBeVisible()
    const userName: string | null = await page
      .locator('.styles_module_accountName > div')
      .nth(0)
      .textContent()
    const deleteButton = page.getByTestId('delete-account')
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(page.locator('.styles_module_infoBox')).toBeVisible()
    if (accountId) {
      expect(
        await page.getByTestId(`account-item-${accountId}`).count()
      ).toEqual(0)
    }
    return userName
  }
  return null
}
