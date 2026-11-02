import { expect, type Locator, type Page } from '@playwright/test'
import path from 'path'

import {
  createDummyChat,
  deleteChat,
  deleteSelectedProfile,
  importDummyProfileFromBackup,
  reloadPage,
  test,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

const chatName = 'Image editor test'
const imagePath = path.join(
  import.meta.dirname,
  '..',
  'fixtures',
  'Deltachat-Logo.png'
)
const imageSize = 300

let page: Page
let composer: Locator
let draftImage: Locator
let editor: Locator

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)
  await importDummyProfileFromBackup(page)
  await createDummyChat(page, chatName)

  composer = page.getByRole('region', { name: 'Write a message' })
  draftImage = composer
    .getByRole('region', { name: 'Attachment' })
    .locator('img')
  editor = page.getByRole('dialog', { name: 'Edit Image' })
})

test.afterAll(async () => {
  await deleteChat(page, chatName)
  await deleteSelectedProfile(page)
  await page.close()
})

async function attachImage() {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'Image' }).click()
  await (await fileChooserPromise).setFiles(imagePath)
  await expect(draftImage).toHaveJSProperty('naturalWidth', imageSize)
}

async function openEditor() {
  await composer.getByRole('button', { name: 'Edit Image' }).click()
  await expect(editor).toBeVisible()
  // the image is drawn on a canvas once it is loaded
  await expect(editor.locator('canvas').first()).toBeVisible()
}

function closeButton() {
  return editor.getByRole('button', { name: 'Close', exact: true })
}

async function drawStroke() {
  const box = await editor.locator('.FIE_canvas-node').boundingBox()
  if (!box) {
    throw new Error('image editor canvas not found')
  }
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  await page.mouse.move(centerX - 50, centerY - 50)
  await page.mouse.down()
  await page.mouse.move(centerX + 50, centerY + 50, { steps: 10 })
  await page.mouse.up()
}

test('shows the edit button for image attachments', async () => {
  await attachImage()
  await expect(
    composer.getByRole('button', { name: 'Edit Image' })
  ).toBeVisible()
})

test('closes without confirmation if nothing was changed', async () => {
  await openEditor()
  await closeButton().click()
  await expect(editor).not.toBeVisible()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('asks before discarding changes', async () => {
  const draftImageSrc = await draftImage.getAttribute('src')
  await openEditor()
  await drawStroke()

  const confirmDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Discard changes?' })

  await closeButton().click()
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(confirmDialog).not.toBeVisible()
  await expect(editor).toBeVisible()

  await closeButton().click()
  await confirmDialog.getByRole('button', { name: 'Discard' }).click()
  await expect(editor).not.toBeVisible()
  await expect(draftImage).toHaveAttribute('src', draftImageSrc!)
})

test('asks before resetting changes', async () => {
  await openEditor()
  const resetButton = editor.getByRole('button', {
    name: 'Reset',
    exact: true,
  })
  await expect(resetButton).toBeDisabled()
  await drawStroke()
  await expect(resetButton).toBeEnabled()

  const confirmDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Reset all changes?' })

  await resetButton.click()
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(confirmDialog).not.toBeVisible()
  await expect(resetButton).toBeEnabled()

  await resetButton.click()
  await confirmDialog.getByRole('button', { name: 'Reset' }).click()
  await expect(confirmDialog).not.toBeVisible()
  await expect(editor.locator('canvas').first()).toBeVisible()
  await expect(resetButton).toBeDisabled()

  // nothing left to discard after the reset
  await closeButton().click()
  await expect(editor).not.toBeVisible()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('saving replaces the draft image with the edited one', async () => {
  await openEditor()
  await editor.getByText('Resize', { exact: true }).click()
  const width = editor.getByRole('spinbutton').first()
  await width.fill(String(imageSize / 2))
  await width.press('Tab')

  await editor.getByRole('button', { name: 'Save' }).click()
  await expect(editor).not.toBeVisible()
  await expect(draftImage).toHaveJSProperty('naturalWidth', imageSize / 2)
  await expect(draftImage).toHaveJSProperty('naturalHeight', imageSize / 2)
})
