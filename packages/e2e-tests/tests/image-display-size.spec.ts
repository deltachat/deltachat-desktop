import { expect, type Page } from '@playwright/test'
import path from 'path'

import {
  importDummyProfileFromBackup,
  deleteSelectedProfile,
  reloadPage,
  test,
  createDummyChat,
  selectChat,
} from '../playwright-helper.js'

/**
 * Checks the displayed size of image messages with different ratios,
 * see `getImageDisplaySize`
 *
 * Uses an imported dummy profile and a group without other members,
 * so the tests don't need a relay.
 */

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })
test.setTimeout(60_000)

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

const imagesPath = path.join(import.meta.dirname, '..', 'fixtures', 'images')

/**
 * `size` is the expected size of the image in px
 * with the default viewport (wide enough for 450px images)
 */
const cases = [
  // typical ratios are shown completely, scaled down to the maximum size
  { file: '4x3_landscape_L_1280x960.png', size: [450, 338] },
  { file: '9x20_portrait_L_576x1280.png', size: [203, 450] },
  // small images are scaled up to the minimum width
  { file: '4x3_landscape_XS_48x36.png', size: [200, 150] },
  { file: '9x16_portrait_XS_27x48.png', size: [200, 356] },
  // wide images: up to 4:1 they are shown completely, wider ones are cropped
  { file: 'extreme_3x1_landscape_2000x667.png', size: [450, 150] },
  { file: 'extreme_5x1_landscape_2000x400.png', size: [450, 113] },
  { file: 'extreme_10x1_landscape_2000x200.png', size: [450, 113] },
  { file: 'extreme_10x1_landscape_200x20.png', size: [200, 50] },
  // tall images: everything taller than 1:2.25 is cropped to 200x450
  { file: 'extreme_1x3_portrait_667x2000.png', size: [200, 450] },
  { file: 'extreme_1x3_portrait_67x200.png', size: [200, 450] },
  { file: 'extreme_1x10_portrait_200x2000.png', size: [200, 450] },
  // small tall images must not get higher than the maximum height
  // when they are scaled up to the minimum width
  { file: 'extreme_1x10_portrait_20x200.png', size: [200, 450] },
] as const

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)
  await importDummyProfileFromBackup(page)

  await createDummyChat(page, 'Image chat')
  await selectChat(page, 'Image chat')
})

test.afterAll(async () => {
  await deleteSelectedProfile(page)
  await page?.close()
})

/** sends the image and returns the new message */
async function sendImage(file: string) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Attach' }).click()
  await page.getByRole('menuitem', { name: 'Image' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(imagesPath, file))
  // wait for the draft preview, otherwise the message might be sent
  // before the attachment is added
  await expect(
    page.getByRole('region', { name: 'Write a message' }).getByRole('img')
  ).toBeVisible()

  const lastMessage = page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .locator('.message')
    .last()
  // The message list only renders a part of the messages,
  // so wait for a new last message (the id is the message id)
  const previousId =
    (await lastMessage.count()) > 0
      ? await lastMessage.getAttribute('id')
      : null
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(lastMessage).not.toHaveAttribute('id', previousId ?? '')
  await expect(lastMessage).toHaveAttribute('id', /^\d+$/)
  // the id of the new message, so the locator doesn't move on
  // if more messages are sent later
  const id = (await lastMessage.getAttribute('id'))!
  return page.locator(`.message[id="${id}"]`)
}

for (const { file, size } of cases) {
  test(`image ${file} is displayed with ${size[0]}x${size[1]}`, async () => {
    const message = await sendImage(file)
    const image = message.locator('img.attachment-content')
    await expect(image).toBeVisible()
    // `toBeCloseTo(x, 0)` allows a difference of < 0.5px
    const box = await image.boundingBox()
    expect(box?.width).toBeCloseTo(size[0], 0)
    expect(box?.height).toBeCloseTo(size[1], 0)
  })
}

/**
 * Images must shrink with the message bubble instead of being cropped by it.
 *
 * `size` is the full display size (as in `cases`), the image may get smaller
 * than that in the narrow window, but must keep its ratio.
 */
const narrowCases = [
  // above the narrow layout breakpoint (900px), but the bubble
  // (max 66% of the message list) is narrower than 450px
  {
    file: '3x2_landscape_L_1280x853.png',
    viewportWidth: 950,
    size: [450, 300],
  },
  // narrow layout, the bubble is wider than the image,
  // so the image keeps its full size
  {
    file: '9x16_portrait_L_720x1280.png',
    viewportWidth: 800,
    size: [253, 450],
  },
] as const

for (const { file, viewportWidth, size } of narrowCases) {
  test(`image ${file} is not cropped in a ${viewportWidth}px window`, async () => {
    const message = await sendImage(file)
    const image = message.locator('img.attachment-content')
    await expect(image).toBeVisible()

    const viewport = page.viewportSize()!
    try {
      await page.setViewportSize({
        width: viewportWidth,
        height: viewport.height,
      })
      // retry until the layout has adapted to the new viewport size
      await expect(async () => {
        const imageBox = (await image.boundingBox())!
        // the button around the image, it has the width of the bubble
        const containerBox = (await image.locator('..').boundingBox())!
        // not larger than the full display size
        expect(imageBox.width).toBeLessThanOrEqual(size[0] + 0.5)
        // not wider than the bubble, which would crop it at the sides
        expect(imageBox.width).toBeCloseTo(containerBox.width, 0)
        // same ratio as the full size, so not cropped at top and bottom
        expect(imageBox.width / imageBox.height).toBeCloseTo(
          size[0] / size[1],
          1
        )
      }).toPass()
    } finally {
      // the following tests expect the default viewport
      await page.setViewportSize(viewport)
    }
  })
}

// Runs last, because it reloads the page.
test('image has its final size before it is loaded', async () => {
  // a cropped image, so the displayed ratio differs from the image's ratio
  const file = 'extreme_10x1_landscape_2000x200.png'
  const size = [450, 113]
  const id = await (await sendImage(file)).getAttribute('id')

  // hold back all images until they are released below
  let releaseImages!: () => void
  const imagesReleased = new Promise<void>(resolve => {
    releaseImages = resolve
  })
  await page.route('/blobs/**', async route => {
    await imagesReleased
    await route.continue()
  })

  try {
    await reloadPage(page)
    await selectChat(page, 'Image chat')

    const image = page.locator(`.message[id="${id}"] img.attachment-content`)
    await expect(image).toBeAttached()
    await expect(image, 'image must not be loaded yet').toHaveJSProperty(
      'naturalWidth',
      0
    )
    const boxBeforeLoad = (await image.boundingBox())!
    expect(boxBeforeLoad.width).toBeCloseTo(size[0], 0)
    expect(boxBeforeLoad.height).toBeCloseTo(size[1], 0)

    releaseImages()
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
    // the explicit aspect-ratio must win over the loaded image's ratio
    const boxAfterLoad = (await image.boundingBox())!
    expect(boxAfterLoad.width).toBeCloseTo(boxBeforeLoad.width, 0)
    expect(boxAfterLoad.height).toBeCloseTo(boxBeforeLoad.height, 0)
  } finally {
    releaseImages()
    await page.unroute('/blobs/**')
  }
})
