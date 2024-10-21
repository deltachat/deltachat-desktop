import { test, expect, Locator } from '@playwright/test'

// import { WEB_PASSWORD } from 'playright.config.js'

// test.beforeEach(async ({ page }) => {
//   await page.goto('https://localhost:3000/')
// })

const user1 = { name: 'userA' }

test('login & create profile', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Delta Chat Browser Login/)
  await page.locator('#pw').fill('opopq')
  await page.locator('#loginButton').click()
  // await expect(page).toHaveTitle(/DeltaChat/)
  // const buttons = page.locator('.styles_module_welcomeScreenButtonGroup button')
  // await expect(buttons).toHaveCount(2)

  const waitForLocator = (locator: Locator): Promise<Locator> => {
    return locator.waitFor().then(() => locator)
  }

  const returnedLocator = await Promise.race([
    // first login without account
    waitForLocator(page.locator('.styles_module_welcomeScreenButtonGroup')),
    waitForLocator(
      page.locator('.styles_module_accountList .styles_module_addButton')
    ),
  ])

  console.log(returnedLocator)

  await page
    .locator('.styles_module_welcomeScreenButtonGroup button')
    .first()
    .click()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(user1.name)

  await page
    .locator('.styles_module_welcomeScreenButtonGroup button')
    .first()
    .click()

  const settingsButton = page.locator(
    '.styles_module_accountListSidebar .styles_module_settingsButtonIcon'
  )
  await settingsButton.click()

  await expect(page.locator('.styles_module_profileDisplayName')).toHaveText(
    user1.name
  )
})

// test('get started link', async ({ page }) => {
//   await page.goto('/')

//   // Click the get started link.
//   await page.locator('.styles_module_addButton').click()

//   await expect(
//     page.locator('.styles_module_welcomeScreenButton')
//   ).toBeInViewport()
// })
