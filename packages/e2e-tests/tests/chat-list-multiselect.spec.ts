import { expect, type Page, type Locator } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
  createNDummyChats,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

let existingProfiles: User[] = []

const numberOfProfiles = 1

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

let chatList: Locator
let selectedChats: Locator
const getChat = (chatNum: number) =>
  chatList.getByRole('tab', { name: `Some chat ${chatNum}` })
const expectSelectedChats = async (chatNums: number[]) => {
  await expect(selectedChats).toContainText(
    chatNums.map(chatNum => `Some chat ${chatNum}`)
  )
}

test.beforeAll(async ({ browser, isChatmail }) => {
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()

  console.log(
    `Running multiselect tests with ${isChatmail ? 'isChatmail' : 'plain email'} profiles`
  )

  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles

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

  chatList = page.getByLabel('Chats').getByRole('tablist')
  selectedChats = chatList.getByRole('tab', { selected: true })
  // Let's stop at 9, so that we don't accidentally select "Chat 10"
  // by providing the selector "Chat 1".
  await createNDummyChats(page, 9, 'Some chat ')
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test.describe('Ctrl + Click', () => {
  test('add chats to selection', async () => {
    await getChat(8).click()
    await expectSelectedChats([8])

    await getChat(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await getChat(3).click({
      modifiers: ['ControlOrMeta'],
    })
    await getChat(1).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([8, 5, 3, 1])
  })

  test('remove chats from selection', async () => {
    await getChat(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([8, 3, 1])
    await getChat(8).click({
      modifiers: ['ControlOrMeta'],
    })
    await getChat(3).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([1])
    await getChat(1).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([])
  })

  test('Ctrl + Space', async () => {
    await expectSelectedChats([])

    await getChat(4).focus()
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedChats([4])

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedChats([4, 3])
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedChats([4])
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedChats([4, 2])
  })
})

test.describe('Shift + Click', () => {
  test('mouse clicks', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])
    await getChat(2).click({
      modifiers: ['Shift'],
    })
    await expectSelectedChats([7, 6, 5, 4, 3, 2])

    await getChat(8).click({
      modifiers: ['Shift'],
    })
    await expectSelectedChats([8, 7])

    await getChat(7).click({
      modifiers: ['Shift'],
    })
    await expectSelectedChats([7])
  })

  test('Shift + Space', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+Space')
    await expectSelectedChats([7, 6, 5, 4])
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Shift+Space')
    await expectSelectedChats([9, 8, 7])
  })
  test('Shift + ArrowDown', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])
    await page.keyboard.press('Shift+ArrowDown')
    await expectSelectedChats([7, 6])
    await page.keyboard.press('Shift+ArrowDown')
    await expectSelectedChats([7, 6, 5])
    await page.keyboard.press('Shift+ArrowDown')
    await expectSelectedChats([7, 6, 5, 4])
    await page.keyboard.press('Shift+ArrowUp')
    await expectSelectedChats([7, 6, 5])
    await page.keyboard.press('Shift+ArrowUp')
    await expectSelectedChats([7, 6])
    await page.keyboard.press('Shift+ArrowUp')
    await expectSelectedChats([7])
    await page.keyboard.press('Shift+ArrowUp')
    await expectSelectedChats([8, 7])
    await page.keyboard.press('Shift+ArrowUp')
    await expectSelectedChats([9, 8, 7])
    await page.keyboard.press('Shift+ArrowUp')
    // This is the topmost chat: do nothing.
    await expectSelectedChats([9, 8, 7])
  })
})

test.describe('context menu', () => {
  test('opens', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])
    await getChat(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([7, 5])

    await getChat(5).click({
      button: 'right',
    })
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Pin Chat',
      'Mute Notifications',
      'Archive Chat',
      'Delete Chat',
    ])
    await expectSelectedChats([7, 5])

    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).not.toBeVisible()
    await expectSelectedChats([7, 5])
  })

  test('if invoked on a non-selected chat, resets selection', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])
    await getChat(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([7, 5])

    await getChat(4).click({
      button: 'right',
    })
    await expect(page.getByRole('menu')).toBeVisible()
    await expectSelectedChats([4])

    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).not.toBeVisible()
  })

  test('when mixed items are selected, shows appropriate bulk actions', async () => {
    await getChat(7).click()
    await expectSelectedChats([7])
    await getChat(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([7, 5])

    await getChat(5).click({
      button: 'right',
    })
    await page.getByRole('menuitem', { name: 'Pin Chat' }).click()

    // Unfortunately we have to wait for core to respond to the "Pin" action,
    // otherwise the menu would think that the chats are still not pinned.
    await expect(
      chatList.getByRole('tab', { name: 'Some chat ' })
    ).toContainText([
      'Some chat 7',
      'Some chat 5',

      'Some chat 9',
      'Some chat 8',
      'Some chat 6',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ])

    await getChat(5).click({
      button: 'right',
    })
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Unpin Chat',

      'Mute Notifications',
      'Archive Chat',
      'Delete Chat',
    ])
    await page.keyboard.press('Escape')

    await getChat(3).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([7, 5, 3])
    await getChat(3).click({
      button: 'right',
    })
    // Some of the selected are pinned, some are not.
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Pin Chat',

      'Mute Notifications',
      'Archive Chat',
      'Delete Chat',
    ])

    await page.getByRole('menuitem', { name: 'Pin Chat' }).click()
    await expect(
      chatList.getByRole('tab', { name: 'Some chat ' })
    ).toContainText([
      'Some chat 7',
      'Some chat 5',
      'Some chat 3',

      'Some chat 9',
      'Some chat 8',
      'Some chat 6',
      'Some chat 4',
      'Some chat 2',
      'Some chat 1',
    ])
    await getChat(3).click({
      button: 'right',
    })
    // Unpin all, to restore state for other tests.
    await page.getByRole('menuitem', { name: 'Unpin Chat' }).click()
    await expect(
      chatList.getByRole('tab', { name: 'Some chat ' })
    ).toContainText([
      'Some chat 9',
      'Some chat 8',
      'Some chat 7',
      'Some chat 6',
      'Some chat 5',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ])

    await getChat(7).click()
    await getChat(2).click({
      modifiers: ['ControlOrMeta'],
    })
    await getChat(2).click({
      button: 'right',
    })
    await page.getByRole('menuitem', { name: 'Mute Notifications' }).click()
    await page.getByRole('menuitem', { name: 'Mute for 1 hour' }).click()
    await expect(getChat(2).getByLabel('Mute')).toBeVisible()
    await expect(getChat(7).getByLabel('Mute')).toBeVisible()
    await expectSelectedChats([7, 2])
    await getChat(2).click({
      button: 'right',
    })
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Pin Chat',
      'Unmute',
      'Archive Chat',
      'Delete Chat',
    ])
    await page.keyboard.press('Escape')

    await getChat(4).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedChats([7, 4, 2])
    await getChat(2).click({
      button: 'right',
    })
    // Some of the selected are muted, some are not.
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Pin Chat',
      'Mute Notifications',
      'Archive Chat',
      'Delete Chat',
    ])
    await page.keyboard.press('Escape')
  })
})

test('resets selection when the active chat changes', async () => {
  await getChat(7).click()
  await expectSelectedChats([7])
  await getChat(5).click({
    modifiers: ['ControlOrMeta'],
  })
  await expectSelectedChats([7, 5])

  await page.keyboard.press('ControlOrMeta+PageDown')
  await expectSelectedChats([6])
})

test("selection doesn't reset if items get reordered", async () => {
  await getChat(7).click()
  await expectSelectedChats([7])
  await getChat(5).click({
    modifiers: ['ControlOrMeta'],
  })
  await expectSelectedChats([7, 5])

  await getChat(5).click({
    button: 'right',
  })
  // Change the order of chats by pinning some.
  await page.getByRole('menuitem', { name: 'Pin Chat' }).click()
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    [
      'Some chat 7',
      'Some chat 5',

      'Some chat 9',
      'Some chat 8',
      'Some chat 6',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ]
  )
  await expectSelectedChats([7, 5])

  await getChat(5).click({
    button: 'right',
  })
  // Unpin all, to restore state for other tests.
  await page.getByRole('menuitem', { name: 'Unpin Chat' }).click()
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    [
      'Some chat 9',
      'Some chat 8',
      'Some chat 7',
      'Some chat 6',
      'Some chat 5',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ]
  )
})

test('when chats get removed from the list, they get unselected', async () => {
  // Using the "search" function is perhaps not
  // the most appropriate display of items getting removed from the list,
  // but it's probably the best one we can get by using a single device
  // and not being able to receive messages on command.

  // This is a pretty stupid hack to ensure that the search results
  // get "cached". When we perform the search for the first time,
  // there is a moment when it shows 0 chats before the results get loaded,
  // resulting in all chats getting unselected, which we don't want.
  await page.getByRole('textbox', { name: 'Search' }).fill('5')
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    ['Some chat 5']
  )
  await page.getByRole('textbox', { name: 'Search' }).clear()

  await getChat(9).click()
  await expectSelectedChats([9])
  await getChat(1).click({
    modifiers: ['Shift'],
  })
  await expectSelectedChats([9, 8, 7, 6, 5, 4, 3, 2, 1])

  await page.getByRole('textbox', { name: 'Search' }).fill('5')
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    ['Some chat 5']
  )
  await expectSelectedChats([5])

  // Check that the action only affects a single chat.
  await getChat(5).click({
    button: 'right',
  })
  await page.getByRole('menuitem', { name: 'Pin Chat' }).click()
  await page.getByRole('textbox', { name: 'Search' }).clear()
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    [
      'Some chat 5',

      'Some chat 9',
      'Some chat 8',
      'Some chat 7',
      'Some chat 6',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ]
  )
  await expect(
    chatList.getByRole('tab', { name: 'Some chat ' }).getByLabel('Pin')
  ).toHaveCount(1)

  // Now verify that the previously selected chats are not selected
  // after they have been brought back.
  // Why? See the comment
  // "Remove chats from selection that have been removed from `chatListIds`"
  // in the code base.
  await expectSelectedChats([5])

  await getChat(5).click({
    button: 'right',
  })
  // Unpin all, to restore state for other tests.
  await page.getByRole('menuitem', { name: 'Unpin Chat' }).click()
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    [
      'Some chat 9',
      'Some chat 8',
      'Some chat 7',
      'Some chat 6',
      'Some chat 5',
      'Some chat 4',
      'Some chat 3',
      'Some chat 2',
      'Some chat 1',
    ]
  )
})

test('delete several', async () => {
  await getChat(7).click()
  await expectSelectedChats([7])
  await getChat(5).click({
    modifiers: ['Shift'],
  })
  await getChat(2).click({
    modifiers: ['ControlOrMeta'],
  })
  await expectSelectedChats([7, 6, 5, 2])

  await getChat(6).click({
    button: 'right',
  })
  await page.getByRole('menuitem', { name: 'Delete Chat' }).click()

  await expect(page.getByRole('dialog')).toContainText(
    'Delete 4 chats on all your devices?'
  )
  await expect(page.getByRole('dialog').locator('p')).toHaveText(
    'Delete 4 chats on all your devices?' +
      '\n\n' +
      'Some chat 7\n' +
      'Some chat 6\n' +
      'Some chat 5\n' +
      'Some chat 2'
  )
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await expect(chatList.getByRole('tab', { name: 'Some chat ' })).toContainText(
    ['Some chat 9', 'Some chat 8', 'Some chat 4', 'Some chat 3', 'Some chat 1']
  )
  await expectSelectedChats([])
})
