import { expect, Locator, Page } from '@playwright/test'

type LocatorWithSelector = Locator & {
  _selector: string
}

export type User = {
  name: string
  id?: string | null
  address?: string | null
}

function hasSelector(
  arg: Locator | LocatorWithSelector
): arg is LocatorWithSelector {
  return '_selector' in arg
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
  // await expect(accountList.last()).toBeVisible()

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
    hasSelector(returnedLocator) &&
    returnedLocator['_selector'] === welcomeButtonsSelector
  ) {
    const c = await returnedLocator.evaluate('node => node.className')
    console.log(c)
    // no account yet
    await page
      .locator('.styles_module_welcomeScreenButtonGroup button')
      .first()
      .click()
  } else {
    const c = await returnedLocator.evaluate('node => node.className')
    console.log(c)
    // create a new account
    returnedLocator.click()
    await page
      .locator('.styles_module_welcomeScreenButtonGroup button')
      .first()
      .click()
  }

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

export async function deleteAccount(
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
        .locator(`[x-account-sidebar-account-id="${accountId}"]`)
        .click({ button: 'right' })
    } else {
      await accountList.last().click({ button: 'right' })
    }
    // await page.screenshot({ path: 'accountList.png' })
    const items = page.locator('.dc-context-menu-layer .dc-context-menu .item')
    expect(await items.last().textContent()).toContain('Delete')
    // await page.screenshot({ path: 'account-context-menu.png' })
    items.last().click()
    await expect(
      page.locator('.styles_module_AccountDeletionScreen')
    ).toBeVisible()
    const userName: string | null = await page
      .locator('.styles_module_accountName > div')
      .nth(0)
      .textContent()
    const deleteButton = page.locator('button.style_module_danger')
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(page.locator('.styles_module_infoBox')).toBeVisible()
    if (accountId) {
      expect(
        await page
          .locator(`[x-account-sidebar-account-id="${accountId}"]`)
          .count()
      ).toEqual(0)
    }
    return userName
  }
  return null
}
