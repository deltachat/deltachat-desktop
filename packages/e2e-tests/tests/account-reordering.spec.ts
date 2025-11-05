import { expect, type Page } from '@playwright/test'

import {
  getUser,
  createProfiles,
  User,
  loadExistingProfiles,
  reloadPage,
  test,
  deleteAllProfiles,
  waitForAccountItemsToFinishLoading,
} from '../playwright-helper'

/**
 * It takes one backend call to show the new order after reordering.
 * We should be optimistally setting the new order without doing another
 * `BackendRemote.rpc.getAllAccountIds`. TODO.
 */
const REORDER_DELAY_BUG_FIXED = false

/**
 * This test covers the drag-and-drop account
 * reordering functionality in the AccountListSidebar
 */

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 3 // Need at least 3 accounts to test reordering

let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()
  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles
  test.setTimeout(120_000)

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    pageForProfileCreation,
    browser.browserType().name(),
    isChatmail
  )

  await contextForProfileCreation.close()
  page = await browser.newPage()
  await reloadPage(page)
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test('basic drag-and-drop account reordering', async () => {
  // Ensure we have at least 3 accounts for meaningful reordering tests
  expect(existingProfiles.length).toBeGreaterThanOrEqual(3)

  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  const userC = getUser(2, existingProfiles)

  const userAInitial = userA.name.substring(0, 1)
  const userBInitial = userB.name.substring(0, 1)
  const userCInitial = userC.name.substring(0, 1)

  // Wait for account items to be rendered and finish loading
  const accountItems = page.locator('[data-testid^="account-item-"]')
  await waitForAccountItemsToFinishLoading(page)

  const initialOrder = [userAInitial, userBInitial, userCInitial]
  await expect(accountItems).toContainText(initialOrder)

  // Find the account items by their test IDs
  const accountA = page.getByTestId(`account-item-${userA.id}`)
  const accountB = page.getByTestId(`account-item-${userB.id}`)
  const accountC = page.getByTestId(`account-item-${userC.id}`)

  // Ensure all accounts are visible
  await expect(accountA).toBeVisible()
  await expect(accountB).toBeVisible()
  await expect(accountC).toBeVisible()

  // Perform drag-and-drop: move userA to position after userB
  await accountA.dragTo(accountB, {
    targetPosition: { x: 0, y: 50 }, // Drop on bottom half of (after) userB
    force: true,
  })

  // Wait for the new order to take effect before starting another drag.
  if (!REORDER_DELAY_BUG_FIXED) {
    await expect(accountItems).toContainText([
      userBInitial,
      userAInitial,
      userCInitial,
    ])
  }

  // Perform drag-and-drop: move userC to position after userB
  await accountC.dragTo(accountB, {
    targetPosition: { x: 0, y: 20 }, // Drop on top half of (before) userB
    force: true,
  })
  await waitForAccountItemsToFinishLoading(page)

  const orderAfterDrag = [userCInitial, userBInitial, userAInitial]
  await expect(accountItems).toContainText(orderAfterDrag)
  await expect(accountItems).not.toContainText(initialOrder)

  await reloadPage(page)
  await waitForAccountItemsToFinishLoading(page)

  await expect(accountItems).toContainText(orderAfterDrag)
})
