import { test, expect } from '@playwright/test'

import { createNewProfile, deleteAccount, User } from '../playwright-helper'

let userA: User = { name: 'Alice' }
let userB: User = { name: 'Bob' }
let userC: User = { name: 'Chris' }

test.beforeEach(async ({ page }) => {
  await page.goto('https://localhost:3000/')
})

test('create profiles', async ({ page }) => {
  await page.goto('/')

  userA = await createNewProfile(page, userA.name)

  expect(userA.id).toBeDefined()

  console.log(`User ${userA.name} wurde angelegt!`, userA)

  userB = await createNewProfile(page, userB.name)

  expect(userB.id).toBeDefined()

  console.log(`User ${userB.name} wurde angelegt!`, userB)

  userC = await createNewProfile(page, userC.name)

  expect(userC.id).toBeDefined()

  console.log(`User ${userC.name} wurde angelegt!`, userC)
})

test('delete profiles', async ({ page }) => {
  await page.goto('/')

  if (userA.id) {
    const deleted = await deleteAccount(page, userA.id)
    expect(deleted).toContain(userA.name)
    if (deleted) {
      console.log(`User ${userA.name} wurde gelöscht!`, userA)
    }
  }
  if (userB.id) {
    const deleted = await deleteAccount(page, userB.id)
    expect(deleted).toContain(userB.name)
    if (deleted) {
      console.log(`User ${userB.name} wurde gelöscht!`, userB)
    }
  }
  if (userC.id) {
    const deleted = await deleteAccount(page, userC.id)
    expect(deleted).toContain(userC.name)
    if (deleted) {
      console.log(`User ${userC.name} wurde gelöscht!`, userC)
    }
  }
})
