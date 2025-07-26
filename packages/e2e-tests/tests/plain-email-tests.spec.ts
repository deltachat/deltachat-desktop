import { test, expect } from '@playwright/test'

import {
  createProfiles,
  deleteProfile,
  User,
  loadExistingProfiles,
  reloadPage,
} from '../playwright-helper'

/**
 * This test suite covers basic functionalities like
 * creating profiles based on DCACCOUNT qr code
 * - invite a user
 * - start a chat
 * - send, edit, delete messages
 * - load and send webxdc app
 * - delete profile
 *
 * creating and deleting profiles also happens in
 * other tests in beforAll and afterAll so if this
 * test fails the other ones will also
 */

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 2

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await reloadPage(page)

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await reloadPage(page)
})

/**
 * covers creating a profile with preconfigured
 * chatmail server on first start or after
 */
test('create e-mail profiles', async ({ page, context, browserName }) => {
  test.setTimeout(120_000)
  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    page,
    context,
    browserName,
    true // unencrypted = true
  )
  expect(existingProfiles.length).toBe(numberOfProfiles)
})

test('delete profiles', async ({ page }) => {
  if (existingProfiles.length < 1) {
    throw new Error('Not existing profiles to delete!')
  }
  for (let i = 0; i < existingProfiles.length; i++) {
    const profileToDelete = existingProfiles[i]
    const deleted = await deleteProfile(page, profileToDelete.id)
    expect(deleted).toContain(profileToDelete.name)
    if (deleted) {
      /* ignore-console-log */
      console.log(`User ${profileToDelete.name} was deleted!`)
    }
  }
})
