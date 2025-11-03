import { expect, type Page, type Locator } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
  createNDummyChats,
  createDummyChat,
  makeDummyContactInviteLink,
} from '../playwright-helper'

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
let composerReply: Locator
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
  composerReply = composerSection.getByRole('region', { name: 'Reply' })
  await createNDummyChats(page, 3, 'Some chat ')
})

function getRemoveQuoteOrFileButton(parent: Locator): Locator {
  return parent.getByRole('button', {
    name: /(close|cancel|remove|delete)/i,
  })
}
async function testDraftIsEmpty() {
  await expect(textarea).toBeEmpty({ timeout: 500 })

  await expect(composerSection).toHaveText('', { timeout: 500 })
  // The above check should be enough, but let's double check
  // with these extra ones.
  await expect(
    composerSection.getByRole('region', { name: /reply|attachment|/i })
  ).not.toBeVisible()
  await expect(getRemoveQuoteOrFileButton(composerSection)).not.toBeVisible()
  await expect(composerSection.locator('.upper-bar')).toBeEmpty()
}

test.afterEach(async () => {
  const chats = chatList.getByRole('tab', { name: 'Some chat ' }).all()
  for (const chat of await chats) {
    await chat.click()
    // Just send a/the message to make sure the draft is cleared.
    // In case the draft is actually empty already, type some text.
    const msg = 'dummy message to clear draft'
    await textarea.fill(msg)
    await page.getByRole('button', { name: 'Send' }).click()
    await testDraftIsEmpty()

    // Delete it, to leave no side effects.
    await page.getByLabel('Messages').getByText(msg).click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .last()
      .click()
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

test("doesn't send the same message twice on multiple clicks", async () => {
  await getChat(1).click()
  const messageText = `somee messageee foo ${Math.random()}`
  await textarea.fill(messageText)

  const sendButton = page.getByRole('button', { name: 'Send' })

  await sendButton.click()
  for (let i = 0; i < 5; i++) {
    try {
      // Note that if we don't `await` each click,
      // it can results in Playwright clicking
      // the "record voice message" button.
      await sendButton.click({ timeout: 1000, force: true })
    } catch (_error) {
      break
    }
  }

  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .getByText(messageText)
  ).toHaveCount(1)

  await textarea.fill(messageText)

  await Promise.allSettled([
    textarea.press('ControlOrMeta+Enter'),
    textarea.press('ControlOrMeta+Enter'),
    textarea.press('ControlOrMeta+Enter'),
  ])
  // One more outside of the `Promise.allSettled`, for good measure.
  await textarea.press('ControlOrMeta+Enter')

  // Note that we're using the same message text so that we can check
  // that there are now 2 elements, and not that there is one element
  // that contains both of the messages.
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .getByText(messageText)
  ).toHaveCount(2)

  // Now make sure that the message list is in its "final" state
  // and no message sends are pending.
  const finalMessageText = 'my final message'
  await textarea.fill(finalMessageText)
  await sendButton.click()
  await expect(page.getByRole('list', { name: 'Messages' })).toContainText(
    finalMessageText
  )
  // And verify message count again.
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .getByText(messageText)
  ).toHaveCount(2)
})

test.describe('draft', () => {
  async function sendMessageAndSetAsQuote(messageText: string) {
    // Note that this will clear the current text.
    // Maybe we should already have a message ready, e.g. in `beforeAll`.
    await textarea.fill(messageText)
    await page.getByRole('button', { name: 'Send' }).click()

    await page
      .getByLabel('Messages')
      .getByText(messageText)
      .click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Reply' }).click()
  }
  async function testDraftHasQuote(quoteText: string) {
    await expect(composerReply).toContainText('Me', { ignoreCase: false })
    await expect(composerReply).toContainText(quoteText)
  }

  // A contact is also a file, and it's the easiest way
  // to attach a file, so let's go for it.
  async function attachFile() {
    await composerSection
      .getByRole('button', { name: 'Add attachment' })
      .click()
    await page.getByRole('menuitem', { name: 'Contact' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Me' }).click()
  }
  async function testDraftHasFile() {
    const myName = 'Alice'
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(myName)
    await expect(composerSection).toContainText(myName)
  }

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

    const messageText = `${messageTextStart}${Math.random()}`
    await sendMessageAndSetAsQuote(messageText)
    await testDraftHasQuote(messageText)

    await someOtherChat.click()
    await expect(composerSection).not.toContainText(messageText, {
      timeout: 300,
    })
    await expect(composerReply).not.toBeVisible({ timeout: 1 })

    // This is currently failing sometimes, probably due to some
    // `ChatlistItemChanged` race. TODO.
    // await expect(targetChat).toContainText(`Draft: Reply`)

    await targetChat.click()
    await testDraftHasQuote(messageText)
  }

  async function testSavesFile(targetChatNum: number = 1) {
    const targetChat = getChat(targetChatNum)
    const someOtherChat = getChat(targetChatNum === 1 ? 2 : 1)
    await targetChat.click()

    await attachFile()
    await testDraftHasFile()

    await someOtherChat.click()
    await testDraftIsEmpty()

    await targetChat.click()
    await testDraftHasFile()
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
  test('saves two keystrokes', async () => {
    await testSavesText('ab')

    await sendDraftAndTestDraftIsCleared()
  })
  test('saves a bunch of keystrokes', async () => {
    await testSavesText(
      'Some long draft message text foobar foobar foobar foobar foobar foobar' +
        ' foobar foobar foobar foobar foobar foobar foobar foobar foobar!'
    )

    await sendDraftAndTestDraftIsCleared()
  })

  test('saves quote', async () => {
    await testSavesQuote()

    await expect(page.getByRole('button', { name: 'Send' })).not.toBeVisible()
    await textarea.fill('foo')
    await sendDraftAndTestDraftIsCleared()
  })

  test('saves quote and text', async () => {
    const chatNum = 1
    const draftText =
      'Foobar foobar foobar foobar foobar foobar foobar foobar foobar'
    const quoteMessageText = 'someeee messageeee'

    await testSavesQuote(quoteMessageText, chatNum)
    await testSavesText(draftText, chatNum)

    await getChat(chatNum).click()
    await expect(textarea).toHaveText(draftText)
    await testDraftHasQuote(quoteMessageText)

    await sendDraftAndTestDraftIsCleared()
  })

  test('saves file', async () => {
    await testSavesFile()
  })

  test('saves file, quote, and text', async () => {
    const chatNum = 1
    const draftText =
      'Foobar foobar foobar foobar foobar foobar foobar foobar foobar'
    const quoteMessageText = 'someeee messageeee'

    await testSavesQuote(quoteMessageText, chatNum)
    await testSavesFile(chatNum)
    await testSavesText(draftText, chatNum)
  })

  // FYI there are more of such "prepare draft" functions,
  // see `useCreateDraftMessage`.
  test("bot command click doesn't override draft", async () => {
    await getChat(1).click()
    await textarea.fill('Try /someBotCommand')
    await textarea.press('ControlOrMeta+Enter')
    const commandSuggestion = page.getByRole('link', {
      name: '/someBotCommand',
    })

    const replaceDraftDialog = page.getByRole('dialog').filter({
      hasText: 'already has a draft message, do you want to replace it?',
    })
    const clickCommandAndCancel = async () => {
      await commandSuggestion.click()
      await expect(replaceDraftDialog).toBeVisible()

      await replaceDraftDialog.getByRole('button', { name: 'Cancel' }).click()
    }

    const somePriorDraftText =
      'Draft text before bot command has been clicked' + Math.random()
    await textarea.fill(somePriorDraftText)
    await clickCommandAndCancel()
    await expect(textarea).toHaveText(somePriorDraftText)

    await textarea.clear()
    await testDraftIsEmpty()
    // It probably doesn't make senese to warn when there is no text
    // but only a file, but let's test for this.
    await attachFile()
    await clickCommandAndCancel()
    await testDraftHasFile()
    await expect(textarea).toBeEmpty()

    await getChat(2).click()
    await expect(textarea).toBeEmpty()
    await getChat(1).click()
    await clickCommandAndCancel()
    await testDraftHasFile()
    await expect(textarea).toBeEmpty()

    await commandSuggestion.click()
    await replaceDraftDialog
      .getByRole('button', { name: 'Replace Draft' })
      .click()
    await expect(textarea).toHaveText('/someBotCommand')
    await textarea.clear()
    await testDraftIsEmpty()
  })
  // This is pretty similar to the previous test.
  test('"Share Profile" doesn\'t override draft', async () => {
    // Create dummy contact
    await page.getByRole('button', { name: 'New Chat' }).click()
    const dummyContactName = 'Dummy Contact' + Math.random()
    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill(makeDummyContactInviteLink(dummyContactName))
    await page
      .getByRole('dialog')
      .getByRole('button', {
        name: dummyContactName,
      })
      .click()
    await page
      .getByRole('dialog')
      .filter({ hasText: 'Chat with' })
      .getByRole('button', { name: 'Ok' })
      .click()

    const shareProfile = async () => {
      await chatList.getByText(dummyContactName).click({ button: 'right' })
      await page.getByRole('menuitem', { name: 'View Profile' }).click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Profile Menu' })
        .click()
      await page.getByRole('menuitem', { name: 'Share' }).click()
      await page
        .getByRole('dialog')
        .filter({ hasText: 'Share with' })
        .getByRole('button', { name: 'Some Chat 1' })
        .click()
    }
    const replaceDraftDialog = page.getByRole('dialog').filter({
      hasText: 'already has a draft message, do you want to replace it?',
    })
    const tryShareProfileAndCancel = async () => {
      await shareProfile()
      await expect(replaceDraftDialog).toBeVisible()
      await replaceDraftDialog.press('Escape')
      await expect(replaceDraftDialog).not.toBeVisible()
    }

    await getChat(1).click()
    await attachFile()
    const somePriorDraftText = 'Some prior draft text' + Math.random()
    await textarea.fill(somePriorDraftText)
    await tryShareProfileAndCancel()
    const myName = 'Alice'
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(myName)
    await expect(composerSection).not.toContainText(dummyContactName)
    await expect(textarea).toHaveText(somePriorDraftText)

    await getRemoveQuoteOrFileButton(composerSection).click()
    // Again, it probably doesn't make sense to replace the whole draft
    // if we only need to attach a file (contact), but let's test.
    await tryShareProfileAndCancel()
    await expect(textarea).toHaveText(somePriorDraftText)

    await getChat(2).click()
    await expect(textarea).toBeEmpty()
    await getChat(1).click()
    await tryShareProfileAndCancel()
    await expect(textarea).toHaveText(somePriorDraftText)

    await shareProfile()
    await replaceDraftDialog
      .getByRole('button', { name: 'Replace Draft' })
      .click()
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).not.toContainText(myName)
    await expect(composerSection).toContainText(dummyContactName)
    await expect(textarea).not.toHaveText(somePriorDraftText)

    await getRemoveQuoteOrFileButton(composerSection).click()
    await testDraftIsEmpty()
  })
})

test.describe('Ctrl + Up shortcut', () => {
  test.describe.configure({ mode: 'serial' })

  const chatName = 'Dummy chat for shortcut testing'
  function getMessageText(i: number) {
    return `Some message ${i}`
  }
  test.beforeAll(async () => {
    await createDummyChat(page, 'Dummy chat for shortcut testing')

    for (let i = 0; i <= 9; i++) {
      const text = getMessageText(i)
      await textarea.fill(text)
      await textarea.press('ControlOrMeta+Enter')
      await expect(page.getByLabel('Messages').getByText(text)).toBeVisible()
    }
  })
  // This is to "negate" the effect of `afterEach` in global scope.
  // A little stupid, but works I guess.
  test.beforeEach(async () => {
    await chatList.getByRole('tab', { name: chatName }).click()
  })

  async function up() {
    await textarea.press('ControlOrMeta+ArrowUp')
  }
  async function down() {
    await textarea.press('ControlOrMeta+ArrowDown')
  }
  async function expectQuote(i: number) {
    await expect(composerSection).toContainText('Me', { timeout: 500 })
    await expect(composerSection).toContainText(getMessageText(i), {
      timeout: 500,
    })
  }
  async function expectNoQuote() {
    await expect(composerSection).toHaveText('', { timeout: 500 })

    await expect(composerSection).not.toContainText('Me', { timeout: 500 })
  }

  test('quotes last message', async () => {
    await expectNoQuote()

    await textarea.focus()
    await up()
    await expectQuote(9)

    await expect(textarea).toBeFocused()
  })

  test('removes quote on Ctrl + Down', async () => {
    await expectQuote(9)
    await down()
    await expectNoQuote()
  })

  test('quotes messages above', async () => {
    await expectNoQuote()
    for (let i = 9; i >= 1; i--) {
      await up()
      await expectQuote(i)
    }
    await expectQuote(1)
    await up()
    await expectQuote(0)

    // Not quoting info messages above.
    await up()
    await expectQuote(0)
    await up()
    await expectQuote(0)

    await composerSection
      .getByRole('button', {
        name: /(close|cancel|remove|delete)/i,
      })
      .click()
    await expectNoQuote()
  })

  test('quotes messages back and forth', async () => {
    await up()
    await expectQuote(9)
    await up()
    await expectQuote(8)
    await down()
    await expectQuote(9)
    await up()
    await expectQuote(8)
    await up()
    await expectQuote(7)
    await down()
    await expectQuote(8)
  })

  test('sends the message with the quote', async () => {
    await expectQuote(8)

    const msg = 'Msg' + Math.random()
    await textarea.fill(msg)
    await textarea.press('ControlOrMeta+Enter')

    await expect(
      page.getByLabel('Messages').getByRole('listitem').filter({ hasText: msg })
    ).toContainText(getMessageText(8))
  })
})
