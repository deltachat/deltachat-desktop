import { expect, type Page, type Locator } from '@playwright/test'

import {
  importDummyProfileFromBackup,
  deleteSelectedProfile,
  reloadPage,
  test,
  createNDummyChats,
  createDummyChat,
  deleteChat,
  makeDummyContactInviteLink,
  selectChat as selectChatByName,
  sendMessage,
  getChat,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

let chatList: Locator
let textarea: Locator
let composerSection: Locator
let composerReply: Locator
const numDummyChats = 3
const getChatName = (chatNum: number) => `Some chat ${chatNum}`
const selectChat = (chatNum: number) =>
  selectChatByName(page, getChatName(chatNum))

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)
  await importDummyProfileFromBackup(page)

  chatList = page.getByLabel('Chats').getByRole('tablist')
  textarea = page.locator('textarea.create-or-edit-message-input')
  composerSection = page.getByRole('region', { name: 'Write a message' })
  composerReply = composerSection.getByRole('region', { name: 'Reply' })
  await createNDummyChats(page, numDummyChats, 'Some chat ')
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

// Maybe it would be more proper to have properly-skoped `afterEach`,
// but this works.
let skipDraftClear = false
test.afterEach(async () => {
  if (skipDraftClear) {
    skipDraftClear = false // Don't skip for the next test
    return
  }

  for (let i = 1; i <= numDummyChats; i++) {
    await selectChat(i)
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
  await deleteSelectedProfile(pageForProfileDeletion)
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

test("doesn't send empty message", async () => {
  await createDummyChat(page, 'empty message test')
  await selectChatByName(page, 'empty message test')
  await textarea.fill('123')
  await page.getByRole('button', { name: 'Send' }).click()
  const messages = page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .filter({ hasNotText: 'Messages are end-to-end encrypted' })
    .filter({ hasNotText: 'Others will only see this group after you sent a' })
    .filter({ hasNotText: 'Today' })
  await expect(messages).toHaveCount(1)

  await textarea.fill('     ')
  await textarea.press('ControlOrMeta+Enter')
  await textarea.press('ControlOrMeta+Enter')
  await textarea.press('ControlOrMeta+Enter')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(textarea).toHaveText('     ')
  await expect(messages).toHaveCount(1)

  await textarea.fill('\n')
  await textarea.press('ControlOrMeta+Enter')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(textarea).toHaveText('\n')
  await expect(messages).toHaveCount(1)

  await textarea.fill('\na')
  await textarea.press('ControlOrMeta+Enter')
  await expect(textarea).toBeEmpty()
  await expect(messages).toHaveCount(2)

  // Clean up
  await deleteChat(page, 'empty message test')
})

test("doesn't send the same message twice on multiple clicks", async () => {
  await selectChat(1)
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
    const dialog = page.getByRole('dialog')
    // Filter by current accounts display name so only the
    // self-contact ("Me") remains.
    await dialog.locator('input').fill('Alice')
    const selfContactItem = dialog
      .getByRole('listitem')
      .filter({ hasText: 'Me' })
    await expect(selfContactItem).toBeVisible()
    await selfContactItem.getByRole('button').click()
  }
  async function testDraftHasFile() {
    const myName = 'Alice'
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(myName)
    await expect(composerSection).toContainText(myName)
  }

  async function testSavesText(text: string, targetChatNum: number = 1) {
    const someOtherChatNum = targetChatNum === 1 ? 2 : 1
    await selectChat(targetChatNum)

    await typeText(text)
    // Note that we want to switch to another chat _immediately_ after typing,
    // in order to make sure that the last input character doesn't get lost.
    // See e.g. https://github.com/deltachat/deltachat-desktop/issues/3733.
    await selectChat(someOtherChatNum)

    // Shouldn't take long to clear the value.
    await expect(textarea).toBeEmpty({ timeout: 300 })

    // This is currently failing sometimes, probably due to some
    // `ChatlistItemChanged` race. TODO.
    // await expect(targetChat).toContainText(`Draft: ${text}`)

    await selectChat(targetChatNum)
    await expect(textarea).toHaveText(text)
  }

  async function testSavesQuote(
    messageTextStart: string = 'some messageeeeeee ',
    targetChatNum: number = 1
  ) {
    const someOtherChatNum = targetChatNum === 1 ? 2 : 1
    await selectChat(targetChatNum)

    const messageText = `${messageTextStart}${Math.random()}`
    await sendMessageAndSetAsQuote(messageText)
    await testDraftHasQuote(messageText)

    await selectChat(someOtherChatNum)
    await expect(composerSection).not.toContainText(messageText, {
      timeout: 300,
    })
    await expect(composerReply).not.toBeVisible({ timeout: 1 })

    // This is currently failing sometimes, probably due to some
    // `ChatlistItemChanged` race. TODO.
    // await expect(targetChat).toContainText(`Draft: Reply`)

    await selectChat(targetChatNum)
    await testDraftHasQuote(messageText)
  }

  async function testSavesFile(targetChatNum: number = 1) {
    const someOtherChatNum = targetChatNum === 1 ? 2 : 1
    await selectChat(targetChatNum)

    await attachFile()
    await testDraftHasFile()

    await selectChat(someOtherChatNum)
    await testDraftIsEmpty()

    await selectChat(targetChatNum)
    await testDraftHasFile()
  }

  async function sendDraftAndTestDraftIsCleared() {
    await page.getByRole('button', { name: 'Send' }).click()

    await testDraftIsEmpty()

    // Switch the chat back and forth.
    const currChatHandle = await chatList
      .getByRole('tab', { selected: true })
      .elementHandle()
    const otherChatTab = chatList
      .getByRole('tab', { selected: false, name: 'Some chat' })
      .first()
    await otherChatTab.click()
    // Wait for the other chat to fully load before going back.
    await expect(textarea).not.toBeDisabled()
    await currChatHandle!.click()
    await expect(composerSection).toHaveText('')

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

    await selectChat(chatNum)
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
    await selectChat(1)
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

    // If there is a file but no text, it's safe to set the text.
    await expect(textarea).toBeFocused()
    await textarea.clear()
    await testDraftIsEmpty()
    await attachFile()
    await commandSuggestion.click()
    await testDraftHasFile()
    await expect(textarea).toHaveText('/someBotCommand')

    const somePriorDraftText =
      'Draft text before bot command has been clicked' + Math.random()
    await textarea.fill(somePriorDraftText)
    await clickCommandAndCancel()
    await expect(textarea).toHaveText(somePriorDraftText)

    await selectChat(2)
    await expect(textarea).toBeEmpty()
    await selectChat(1)
    await clickCommandAndCancel()
    await testDraftHasFile()
    await expect(textarea).toHaveText(somePriorDraftText)

    await commandSuggestion.click()
    await replaceDraftDialog
      .getByRole('button', { name: 'Replace Draft' })
      .click()
    await expect(textarea).toHaveText('/someBotCommand')
    await getRemoveQuoteOrFileButton(composerSection).click()
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
      await getChat(page, dummyContactName).click({ button: 'right' })
      await page.getByRole('menuitem', { name: 'View Profile' }).click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'More options' })
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

    await selectChat(1)
    const somePriorDraftText = 'Some prior draft text' + Math.random()
    await expect(textarea).toBeFocused()
    await textarea.fill(somePriorDraftText)
    // Can add a file to draft if already have text but no file.
    await shareProfile()
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(dummyContactName)
    await expect(textarea).toHaveText(somePriorDraftText)

    await getRemoveQuoteOrFileButton(composerSection).click()
    await attachFile()
    await tryShareProfileAndCancel()
    const myName = 'Alice'
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(myName)
    await expect(composerSection).not.toContainText(dummyContactName)
    await expect(textarea).toHaveText(somePriorDraftText)

    await selectChat(2)
    await expect(textarea).toBeEmpty()
    await selectChat(1)
    await tryShareProfileAndCancel()
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).toContainText(myName)
    await expect(composerSection).not.toContainText(dummyContactName)
    await expect(textarea).toHaveText(somePriorDraftText)

    await shareProfile()
    await replaceDraftDialog
      .getByRole('button', { name: 'Replace Draft' })
      .click()
    await expect(
      composerSection.getByRole('region', { name: 'Attachment' })
    ).not.toContainText(myName)
    await expect(composerSection).toContainText(dummyContactName)
    await expect(textarea).toHaveText(somePriorDraftText)

    await getRemoveQuoteOrFileButton(composerSection).click()
    await textarea.clear()
    await testDraftIsEmpty()
  })
})

test('gets focused when selecting a chat', async () => {
  await selectChat(1)
  await page.getByRole('button').first().focus() // Focus a random button
  await expect(textarea).not.toBeFocused()

  await selectChat(2)
  await expect(textarea).toBeFocused()

  await textarea.blur()
  // When clicking on a chat that is already active, still focus the composer.
  await expect(textarea).not.toBeFocused()
  await selectChat(2)
  await expect(textarea).toBeFocused()
})

test('gets focused after clicking/touching send message button', async () => {
  await selectChat(1)

  const msg = 'Msg' + Math.random()
  await textarea.fill(msg)
  await page.getByRole('button', { name: 'Send' }).focus()
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(textarea).toBeFocused()
})

test.describe('Ctrl + Up shortcut', () => {
  test.describe.configure({
    mode: 'serial',
  })

  const chatName = 'Dummy chat for shortcut testing'
  function getMessageText(i: number) {
    return `Some message ${i}`
  }
  const numMessages = 10
  test.beforeAll(async () => {
    await createDummyChat(page, chatName)

    for (let i = 0; i < numMessages; i++) {
      const text = getMessageText(i)

      // A hack against flakiness (same as other such occurrences)
      await expect(textarea).toBeFocused()

      await textarea.fill(text)
      await textarea.press('ControlOrMeta+Enter')
      await expect(page.getByLabel('Messages').getByText(text)).toBeVisible()
    }
  })
  // This is to "negate" the effect of `afterEach` in global scope.
  // A little stupid, but works I guess.
  test.beforeEach(async () => {
    await selectChatByName(page, chatName)
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

    await textarea.press('Escape')
    await expectNoQuote()
  })

  test('removes quote on Ctrl + Down', async () => {
    await textarea.focus()
    await up()
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

    await textarea.press('Escape')
    await expectNoQuote()
  })

  // This is also a stress-test to the overall draft implementation.
  test('handles rapid input', async () => {
    await up()
    await up()
    await up()
    await up()
    await up()
    await up()
    let currQuoteInd = 4
    await expectQuote(currQuoteInd)

    // TODO maybe we can avoid `await`ing
    // each individual `up()` or `down()`, for even more rapid input?
    // const promises: Promise<void>[] = []
    for (let i = 0; i < 100; i++) {
      let indChange: -1 | 1
      if (currQuoteInd === numMessages) {
        // No quote, can only go up the list
        indChange = -1
      } else if (currQuoteInd === 0) {
        // Topmost message is quoted, can only go down
        indChange = 1
      } else {
        indChange = Math.random() > 0.5 ? 1 : -1
      }

      if (indChange === 1) {
        // promises.push(down())
        await down()
      } else {
        indChange satisfies -1
        // promises.push(up())
        await up()
      }
      currQuoteInd += indChange
    }
    // await Promise.all(promises)

    const shouldExpectNoQuote = currQuoteInd === numMessages
    if (shouldExpectNoQuote) {
      await expectNoQuote()
    } else {
      await expectQuote(currQuoteInd)
    }

    // It might be that the UI still has not settled and the quote
    // is still changing rapidly.
    // Sending a message is out way to "lock" the quote,
    // and check its final value.
    const text = 'msg with quote' + Math.random()
    await textarea.fill(text)
    await textarea.press('ControlOrMeta+Enter')
    const msg = page
      .getByLabel('Messages')
      .getByRole('listitem')
      .filter({ hasText: text })
    await expect(msg).toBeVisible()

    if (shouldExpectNoQuote) {
      await expect(msg).not.toContainText(getMessageText(currQuoteInd))
    } else {
      await expect(msg).toContainText(getMessageText(currQuoteInd))
    }

    await page.getByLabel('Messages').getByText(text).click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .last()
      .click()
    await expectNoQuote()
  })

  test('sends the message with the quote', async () => {
    await expectNoQuote()
    await up()
    await up()

    await expectQuote(8)

    const msg = 'Msg' + Math.random()
    await textarea.fill(msg)
    await textarea.press('ControlOrMeta+Enter')

    await expect(
      page.getByLabel('Messages').getByRole('listitem').filter({ hasText: msg })
    ).toContainText(getMessageText(8))
  })
})

test.describe('edit message', () => {
  const textareaEdit = () => page.locator('#composer-textarea-edit')
  const textareaNonEdit = () => page.locator('#composer-textarea-non-edit')
  const editMessageSection = () =>
    page.getByRole('region', { name: 'Edit Message' })

  test.beforeAll(async () => {
    await createDummyChat(page, 'Chat for ArrowUp tests')

    await sendMessage(page, 'Chat for ArrowUp tests', 'M 1')
    await sendMessage(page, 'Chat for ArrowUp tests', 'M 2')
    await sendMessage(page, 'Chat for ArrowUp tests', 'M 3')
  })
  test.afterEach(async () => {
    skipDraftClear = true
  })
  test.afterAll(async () => {
    await deleteChat(page, 'Chat for ArrowUp tests')
  })

  test('enter edit mode with ArrowUp', async () => {
    await textarea.focus()
    await expect(textarea).toBeEmpty()

    await page.keyboard.press('ArrowUp')

    await expect(textarea).toHaveText('M 3')
    await expect(editMessageSection()).toContainText('Edit Message')
    await expect(editMessageSection()).toContainText('M 3')
    await expect(
      page.getByRole('button', { name: 'Add Attachment' })
    ).not.toBeVisible()
    await expect(textareaEdit()).toBeFocused()
  })
  test('exit edit mode with Escape', async () => {
    await page.keyboard.press('Escape')

    await expect(textarea).toBeEmpty()
    await expect(composerSection).not.toContainText('Edit Message')
    await expect(composerSection).not.toContainText('M 3')
    await expect(
      composerSection.getByRole('button', { name: 'Add Attachment' })
    ).toBeVisible()
    await expect(textareaNonEdit()).toBeFocused()
  })
  test("don't enter edit mode on ArrowUp if input is not empty", async () => {
    await expect(textareaNonEdit()).toBeEmpty()

    // Check that normally we can enter the edit mode.
    await page.keyboard.press('ArrowUp')
    await expect(textareaEdit()).toHaveText('M 3')
    await expect(textareaEdit()).toBeFocused()
    await page.keyboard.press('Escape')

    await textareaNonEdit().fill('123')
    await page.keyboard.press('ArrowUp')
    await expect(textareaNonEdit()).toHaveText('123')
    await expect(composerSection).not.toContainText('Edit Message')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(textareaNonEdit()).toHaveText('123')

    // All-whitespace is also considered non-empty.
    // Here ArrowUp is supposed to move the cursor and not enter the edit mode.
    await textareaNonEdit().fill('\n\n\n\n\n')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(textareaNonEdit()).toHaveText('\n\n\n\n\n')
    await expect(composerSection).not.toContainText('Edit Message')
  })
})

test.describe('Emoji picker', () => {
  test.beforeAll(async () => {
    await createDummyChat(page, 'Chat for emoji picker tests')
  })
  test.afterAll(async () => {
    await deleteChat(page, 'Chat for emoji picker tests')
  })

  test('adds emoji to draft', async () => {
    await textarea.focus()
    await textarea.fill('12345')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await expect(
      page.getByRole('tabpanel', { name: 'Emoji' }).getByRole('searchbox')
    ).toBeFocused()
    await page.keyboard.type('thumbs up')
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('tabpanel', { name: 'Emoji' })
    ).not.toBeVisible()
    await expect(textarea).toBeFocused()
    await expect(textarea).toHaveText('123👍45')
  })
  test('focuses composer when closed with Escape', async () => {
    await textarea.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await expect(
      page.getByRole('tabpanel', { name: 'Emoji' }).getByRole('searchbox')
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('tabpanel', { name: 'Emoji' })
    ).not.toBeVisible()
    await expect(textarea).toBeFocused()
    await expect(textarea).toBeEmpty()
  })
})
