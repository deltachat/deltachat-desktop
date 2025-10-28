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

/**
 * @see https://github.com/deltachat/deltachat-desktop/issues/3733
 */
const QUICK_CHAT_SWITCH_BUG_HAS_BEEN_FIXED = false

test.describe.configure({ mode: 'serial' })

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

let existingProfiles: User[] = []

const numberOfProfiles = 1

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

let chatList: Locator
let textarea: Locator
let composerSection: Locator
const getChat = (chatNum: number) =>
  chatList.getByRole('tab', { name: `Some chat ${chatNum}` })

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
  textarea = page.locator('textarea#composer-textarea')
  composerSection = page.getByRole('region', { name: 'Write a message' })
  await createNDummyChats(page, 3, 'Some chat ')
})

test.afterEach(async () => {
  for (const chat of await chatList
    .getByRole('tab', { name: 'Some chat ' })
    .all()) {
    await chat.click()
    // Just send a/the message to make sure the draft is cleared.
    // In case the draft is actually empty already, type some text.
    await textarea.fill('dummy message to clear draft')
    await page.getByRole('button', { name: 'Send' }).click()
  }
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

async function typeText(text: string) {
  // We might disable the textarea while we're loading the draft.
  await expect(textarea).not.toBeDisabled()

  await textarea.pressSequentially(text, { delay: 50 })

  // Seems to be necessary, otherwise it's flaky.
  // This might indicate a bug in our app, actually.
  await expect(textarea).toHaveText(text)
}

test.describe('draft', () => {
  async function testSavesText(text: string, targetChatNum: number = 1) {
    const targetChat = getChat(targetChatNum)
    const someOtherChat = getChat(targetChatNum === 1 ? 2 : 1)
    await targetChat.click()

    await typeText(text)
    // Note that we want to switch to another chat _immediately_ after typing,
    // in order to make sure that the last input character doesn't get lost.
    // See e.g. https://github.com/deltachat/deltachat-desktop/issues/3733.
    await someOtherChat.click()

    // Shouldn't take long to clear the value.
    await expect(textarea).toBeEmpty({ timeout: 300 })

    // This is currently failing sometimes, probably due to some
    // `ChatlistItemChanged` race. TODO.
    // await expect(targetChat).toContainText(`Draft: ${text}`)

    await targetChat.click()
    await expect(textarea).toHaveText(text)
  }

  async function testSavesQuote(
    messageTextStart: string = 'some messageeeeeee ',
    targetChatNum: number = 1
  ) {
    const targetChat = getChat(targetChatNum)
    const someOtherChat = getChat(targetChatNum === 1 ? 2 : 1)
    await targetChat.click()

    // Note that this will clear the current text.
    // Maybe we should already have a message ready, e.g. in `beforeAll`.
    const messageText = `${messageTextStart}${Math.random()}`
    await textarea.fill(messageText)
    await page.getByRole('button', { name: 'Send' }).click()
    await page
      .getByLabel('Messages')
      .getByText(messageText)
      .click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Reply' }).click()

    const composerReply = composerSection.getByRole('region', { name: 'Reply' })
    await expect(composerReply).toContainText('Me', { ignoreCase: false })
    await expect(composerReply).toContainText(messageText)

    await someOtherChat.click()
    await expect(composerSection).not.toContainText(messageText, {
      timeout: 300,
    })
    await expect(composerReply).not.toBeVisible({ timeout: 1 })

    // This is currently failing sometimes, probably due to some
    // `ChatlistItemChanged` race. TODO.
    // await expect(targetChat).toContainText(`Draft: Reply`)

    await targetChat.click()
    await expect(composerReply).toContainText('Me', { ignoreCase: false })
    await expect(composerReply).toContainText(messageText)
  }

  async function testSavesFile(targetChatNum: number = 1) {
    const targetChat = getChat(targetChatNum)
    const someOtherChat = getChat(targetChatNum === 1 ? 2 : 1)
    await targetChat.click()

    await composerSection
      .getByRole('button', { name: 'Add attachment' })
      .click()
    // A contact is also a file, and it's the easiest way
    // to attach a file, so let's go for it.
    await page.getByRole('menuitem', { name: 'Contact' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Me' }).click()

    const myName = 'Alice'
    await expect(composerSection).toContainText(myName)
    await someOtherChat.click()
    await expect(composerSection).not.toContainText(myName, { timeout: 300 })

    await targetChat.click()
    await expect(composerSection).toContainText(myName)
  }

  async function testDraftIsEmpty() {
    await expect(textarea).toBeEmpty({ timeout: 500 })

    await expect(composerSection).toHaveText('', { timeout: 500 })
    // The above check should be enough, but let's double check
    // with these extra ones.
    await expect(
      composerSection.getByRole('region', { name: /reply|attachment|/i })
    ).not.toBeVisible()
    await expect(
      composerSection.getByRole('button', {
        name: /(close|cancel|remove|delete)/i,
      })
    ).not.toBeVisible()
    await expect(composerSection.locator('.upper-bar')).toBeEmpty()
  }
  async function sendDraftAndTestDraftIsCleared() {
    await page.getByRole('button', { name: 'Send' }).click()

    await testDraftIsEmpty()

    // Switch the chat back and forth.
    const currChat = await chatList
      .getByRole('tab', { selected: true })
      .elementHandle()
    await chatList
      .getByRole('tab', { selected: false, name: 'Some chat' })
      .first()
      .click()
    // Make sure that we have actually switched the chat
    // and loaded its draft.
    await textarea.fill('foo')
    await currChat!.click()
    await expect(textarea).toBeEmpty()

    await testDraftIsEmpty()
  }

  test('saves one keystroke', async () => {
    await testSavesText('a')

    await sendDraftAndTestDraftIsCleared()
  })
  ;(QUICK_CHAT_SWITCH_BUG_HAS_BEEN_FIXED ? test : test.skip)(
    'saves two keystrokes',
    async () => {
      await testSavesText('ab')

      await sendDraftAndTestDraftIsCleared()
    }
  )
  // Not reliable, for the same reason as the previos text is broken.
  ;(QUICK_CHAT_SWITCH_BUG_HAS_BEEN_FIXED ? test : test.skip)(
    'saves a bunch of keystrokes',
    async () => {
      await testSavesText(
        'Some long draft message text foobar foobar foobar foobar foobar foobar' +
          ' foobar foobar foobar foobar foobar foobar foobar foobar foobar!'
      )

      await sendDraftAndTestDraftIsCleared()
    }
  )

  test('saves quote', async () => {
    await testSavesQuote()

    await expect(page.getByRole('button', { name: 'Send' })).not.toBeVisible()
    await textarea.fill('foo')
    await sendDraftAndTestDraftIsCleared()
  })

  test('saves quote and text', async () => {
    const chatNum = 1
    const draftText = QUICK_CHAT_SWITCH_BUG_HAS_BEEN_FIXED
      ? 'Foobar foobar foobar foobar foobar foobar foobar foobar foobar'
      : 'a'
    const quoteMessageText = 'someeee messageeee'

    await testSavesQuote(quoteMessageText, chatNum)
    await testSavesText(draftText, chatNum)

    await getChat(chatNum).click()
    await expect(textarea).toHaveText(draftText)
    await expect(composerSection).toContainText('Me', { ignoreCase: false })
    await expect(composerSection).toContainText(quoteMessageText)

    await sendDraftAndTestDraftIsCleared()
  })

  test('saves file', async () => {
    await testSavesFile()
  })

  test('saves file, quote, and text', async () => {
    const chatNum = 1
    const draftText = QUICK_CHAT_SWITCH_BUG_HAS_BEEN_FIXED
      ? 'Foobar foobar foobar foobar foobar foobar foobar foobar foobar'
      : 'a'
    const quoteMessageText = 'someeee messageeee'

    await testSavesQuote(quoteMessageText, chatNum)
    await testSavesFile(chatNum)
    await testSavesText(draftText, chatNum)
  })
})
