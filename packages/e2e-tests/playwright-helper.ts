import { expect, Page } from '@playwright/test'

const chatmailServer = 'https://ci-chatmail.testrun.org'

export type User = {
  name: string
  id: string
  address: string
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

export async function createUser(
  userName: string,
  page: Page,
  existingProfiles: User[],
  isFirstOnboarding: boolean
): Promise<User> {
  const user = await createNewProfile(page, userName, isFirstOnboarding)

  expect(user.id).toBeDefined()

  existingProfiles.push(user)
  console.log(`User ${user.name} wurde angelegt!`, user)
  return user
}

export async function createNewProfile(
  page: Page,
  name: string,
  isFirstOnboarding: boolean
): Promise<User> {
  await page.waitForSelector('.styles_module_account')
  const accountList = page.locator('.styles_module_account')

  if (!isFirstOnboarding) {
    // add account to show onboarding screen
    await page.getByTestId('add-account-button').click()
  }
  // create a new account
  await page.getByTestId('create-account-button').click()

  page.evaluate(
    `navigator.clipboard.writeText('dcaccount:${chatmailServer}/new')`
  )

  await page.getByTestId('other-login-button').click()

  await page.getByTestId('scan-qr-login').click()

  await page.getByTestId('paste').click()

  // Wait for the dialog to close, so that the underlying content
  // becomes interactive, otherwise `fill()` might silently do nothing.
  await expect(page.getByTestId('close')).not.toBeVisible()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(name)

  await page.getByTestId('login-button').click()

  const newAccountList = page.locator('.styles_module_account')
  await expect(newAccountList.last()).toHaveClass(
    /(^|\s)styles_module_active(\s|$)/
  )
  // open settings to validate the name and to get
  // the (randomly) created mail address
  const settingsButton = page.getByTestId('open-settings-button')
  await settingsButton.click()

  await expect(page.locator('.styles_module_profileDisplayName')).toHaveText(
    name
  )
  const address = await page
    .locator('.styles_module_profileAddress')
    .textContent()

  expect(address).not.toBeNull()

  await page.getByTestId('settings-close').click()

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
  const name = await page
    .locator('.styles_module_profileDisplayName')
    .textContent()
  const address = await page
    .locator('.styles_module_profileAddress')
    .textContent()
  await page.getByTestId('settings-close').click()

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
  page.waitForSelector('.main-container')
  await expect(page.locator('.main-container')).toBeVisible()
  // TODO: the next waitFor calls are needed when loading existing profiles
  // and skipping the createProfiles step, but will never succeed if there
  // are no profiles yet
  await page.waitForSelector('button.styles_module_account')
  await page.waitForSelector('button.styles_module_account[aria-busy=false]')
  const accountList = page.locator('button.styles_module_account')
  const existingAccountItems = await accountList.count()
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
      console.log(`Found account ${id}`)
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
      await expect(page.getByTestId(`account-item-${accountId}`)).toHaveCount(0)
    }
    return userName
  }
  return null
}
