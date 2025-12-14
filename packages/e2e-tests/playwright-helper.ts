/* eslint-disable no-console */
import path from 'node:path'
import { expect, test as base, Page } from '@playwright/test'

const envPath = path.join(import.meta.dirname, '.env')

try {
  process.loadEnvFile?.(envPath)
} catch (_error) {
  console.log(`No .env file to load ${envPath}`)
}

export const chatmailServerDomain = process.env.DC_CHATMAIL_DOMAIN

export const mailServerUrl = process.env.DC_MAIL_SERVER

export const mailServerToken = process.env.DC_MAIL_SERVER_TOKEN

export const userNames = ['Alice', 'Bob', 'Chris', 'Denis', 'Eve']

export const groupName = 'TestGroup'

export type User = {
  name: string
  id: string
  address: string
  password?: string
}

export type TestOptions = {
  isChatmail: boolean
}

/**
 * extend all tests with chatmail option
 */
export const test = base.extend<TestOptions>({
  // can be overriden in the config.
  isChatmail: [true, { option: true }],
})

export async function reloadPage(page: Page): Promise<void> {
  await page.goto('https://localhost:3000/')
}

export async function clickThroughTestIds(
  page: Page,
  testIds: string[]
): Promise<void> {
  for await (const testId of testIds) {
    await page.getByTestId(testId).click()
  }
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

/**
 * Helper function to wait for all account items to finish loading
 * by waiting for all aria-busy attributes to be false and the text not being '⏳'
 * note that even if there are no accounts yet, there will be one account item
 * created preparing the InstantOnboarding process.
 */
export async function waitForAccountItemsToFinishLoading(
  page: Page
): Promise<void> {
  await page.waitForFunction(() => {
    const accountItems = document.querySelectorAll(
      '[data-testid^="account-item-"]'
    )

    // If no account items exist return false,
    // no accounts loaded yet so keep waiting
    if (accountItems.length === 0) {
      return false
    }

    return Array.from(accountItems).every(item => {
      const ariaBusy = item.getAttribute('aria-busy')
      const text = item.textContent
      return ariaBusy === 'false' && text !== null && text !== '⏳'
    })
  })
}

export async function sendMessage(
  page: Page,
  userName: string,
  messageText: string
): Promise<void> {
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userName })
    .click()
  await page.locator('#composer-textarea').fill(messageText)
  await page.locator('button.send-button').click()
  const sentMessageText = page
    .locator(`.message.outgoing`)
    .last()
    .locator('.msg-body .text')
  await expect(sentMessageText).toHaveText(messageText)
}

export async function createUser(
  userName: string,
  page: Page,
  existingProfiles: User[],
  isFirstOnboarding: boolean,
  useChatmail: boolean = true
): Promise<User> {
  const user = await createNewProfile(
    page,
    userName,
    isFirstOnboarding,
    useChatmail
  )

  expect(user.id).toBeDefined()

  existingProfiles.push(user)
  console.log(`User ${user.name} was created!`, user)
  return user
}

export const getUser = (index: number, existingProfiles: User[]) => {
  if (!existingProfiles || existingProfiles.length < index + 1) {
    throw new Error(
      `Not enough profiles for test! Found ${existingProfiles?.length}`
    )
  }
  return existingProfiles[index]
}

/**
 * create a profile after pasting DCACCOUNT link
 */
export async function createNewProfile(
  page: Page,
  name: string,
  isFirstOnboarding: boolean,
  useChatmail: boolean
): Promise<User> {
  await page.waitForSelector('.styles_module_account')
  const accountList = page.locator('.styles_module_account')

  if (!isFirstOnboarding) {
    // add account to show onboarding screen
    await page.getByTestId('add-account-button').click()
  }
  // create a new account
  await page.getByTestId('create-account-button').click()

  let dcAccountLink: string
  if (useChatmail) {
    if (!chatmailServerDomain) {
      throw new Error('DC_CHATMAIL_DOMAIN env var not set, cannot run tests')
    }
    dcAccountLink = `dcaccount:${chatmailServerDomain satisfies string}`
  } else {
    if (!mailServerUrl || mailServerToken == undefined) {
      throw new Error(
        'DC_MAIL_SERVER or DC_MAIL_SERVER_TOKEN env var not set, cannot run tests'
      )
    }
    dcAccountLink = `dcaccount:${mailServerUrl satisfies string}//new_email?t=${mailServerToken satisfies string}&n=ci_github`
  }
  await page.evaluate(`navigator.clipboard.writeText('${dcAccountLink}')`)
  await clickThroughTestIds(page, [
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])

  // Wait for the dialog to close, so that the underlying content
  // becomes interactive, otherwise `fill()` might silently do nothing.
  await expect(page.getByTestId('qrscan-dialog')).not.toBeVisible()

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
  await page.getByTestId('open-advanced-settings').click()
  await page.getByTestId('open-transport-settings').click()
  await page.getByLabel('Edit Relay').first().click()
  const addressLocator = page.locator('#addr')
  await expect(addressLocator).toHaveValue(/.+@.+/)
  const address = await addressLocator.inputValue()

  await page.getByTestId('cancel').click()
  await page.getByTestId('transports-settings-close').click()
  await page.getByTestId('settings-advanced-close').click()

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

export async function getProfile(
  page: Page,
  accountId: string,
  includePasswd = false
): Promise<User> {
  await page.getByTestId(`account-item-${accountId}`).click({ button: 'right' })
  await page.getByTestId('open-settings-menu-item').click()
  const nameLocator = page.locator('.styles_module_profileDisplayName')
  await expect(nameLocator).not.toBeEmpty()
  const name = await nameLocator.textContent()
  await page.getByTestId('open-advanced-settings').click()
  await page.getByTestId('open-transport-settings').click()
  await page.getByLabel('Edit Relay').first().click()
  const addressLocator = page.locator('#addr')
  await expect(addressLocator).toHaveValue(/.+@.+/)
  const address = await addressLocator.inputValue()
  let password = ''
  if (includePasswd) {
    const passwdLocator = page.locator('#password')
    password = await passwdLocator.inputValue()
  }
  await page.getByTestId('cancel').click()
  await page.getByTestId('transports-settings-close').click()
  await page.getByTestId('settings-advanced-close').click()

  return {
    id: accountId,
    name: name ?? '',
    address: address ?? '',
    password: password,
  }
}

export async function createProfiles(
  number: number,
  existingProfiles: User[],
  page: Page,
  browserName: string,
  useChatmail: boolean = true
): Promise<void> {
  const hasProfileWithName = (name: string): boolean => {
    let hasProfile = false
    if (existingProfiles.length > 0) {
      existingProfiles.forEach(user => {
        if (user.name === name) {
          hasProfile = true
        }
      })
    }
    return hasProfile
  }
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  for (let n = 0; n < number; n++) {
    if (!hasProfileWithName(userNames[n])) {
      await createUser(
        userNames[n],
        page,
        existingProfiles,
        n === 0,
        useChatmail
      )
    } else {
      console.log('User already exists')
    }
  }
}

export async function deleteAllProfiles(
  page: Page,
  existingProfiles: User[]
): Promise<void> {
  for (let i = 0; i < existingProfiles.length; i++) {
    const profileToDelete = existingProfiles[i]
    const deleted = await deleteProfile(page, profileToDelete.id)
    expect(deleted).toContain(profileToDelete.name)
    if (deleted) {
      console.log(`User ${profileToDelete.name} was deleted!`)
    }
  }
}

/**
 * can be used to load existing profiles from db
 * if fixtures are used, and the profiles are already created
 */
export async function loadExistingProfiles(page: Page): Promise<User[]> {
  // await page.goto('https://localhost:3000/')
  const existingProfiles: User[] = []
  await page.waitForSelector('.main-container')
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

export async function createNDummyChats(
  page: Page,
  n: number,
  chatNamePrefix = 'Some chat '
) {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'New Chat' }).click()
    await page.getByRole('button', { name: 'New Group' }).click()
    await page
      .getByRole('textbox', { name: 'Group Name' })
      .fill(`${chatNamePrefix}${(i + 1).toString()}`)
    await page.getByTestId('group-create-button').click()
  }
  const chatList = page.getByLabel('Chats').getByRole('tablist')
  await expect(
    chatList.getByRole('tab', { name: chatNamePrefix })
  ).toContainText(
    Array(n)
      .fill(null)
      .map((_val, i) => `${chatNamePrefix}${(i + 1).toString()}`)
      .reverse()
  )
}

export async function selectChat(
  page: Page,
  chatName: string,
  options?: { dontWaitForLoaded?: boolean }
) {
  const chatList = page.getByLabel('Chats').getByRole('tablist')
  await chatList.getByRole('tab', { name: chatName }).click()

  if (options?.dontWaitForLoaded) {
    return
  }

  // Waiting for the chat to get loaded is useful to avoid the tests
  // trying to do something in the previous chat without
  // while the new one is being loaded, e.g. filling the textarea.
  //
  // We should probably consider making sure that the old chat
  // cannot be interacted with anymore when we have initiated chat switching.
  // For example, by disabling the composer, or applying `aria-busy`.
  // When we have done that, we can remove this code.
  await expect(chatList.getByRole('tab', { selected: true })).toContainText(
    chatName
  )
  await expect(
    page
      .getByRole('region', { name: /chat(?!s)/i })
      .filter({ has: page.getByRole('list', { name: 'Messages' }) })
      .getByRole('heading')
  ).toContainText(chatName)
}

/**
 * Create a profile from an invite link and start a chat
 * based on that link
 */
export const createProfileAndJoinChat = async (
  inviterName: string,
  inviteeName: string,
  page: Page
) => {
  const confirmDialog = page.getByTestId('ask-create-profile-and-join-chat')
  await expect(confirmDialog).toContainText(inviterName)

  await confirmDialog.getByTestId('confirm').click()

  // we have to wait till both dialogs are closed since
  // the displayName input is just behind these dialogs
  await expect(confirmDialog).not.toBeVisible()

  await expect(page.getByTestId('qr-reader-settings')).not.toBeVisible()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(inviteeName)

  await page.getByTestId('login-button').click()
}

export const makeDummyContactInviteLink = (
  contactName: string
) => `https://i.delta.chat/\
#AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
&a=echo%40${chatmailServerDomain}\
&n=${encodeURIComponent(contactName)}\
&i=aaaaaaaaaaaaaaaaaaaaaaaa\
&s=aaaaaaaaaaaaaaaaaaaaaaaa`
