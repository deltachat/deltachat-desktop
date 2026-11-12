import { test, expect } from '@playwright/test'

import { DeltaChatElectron } from '../electron-helper.js'

// Run on macOS with Lockdown Mode enabled to cover the ImageIO sandbox issue.
let dc: DeltaChatElectron

// Evaluated in the renderer, where ordinary page.evaluate is blocked.
const renderText = `
  async function renderText(family, text = '😀') {
    const font = '48px ' + family
    const loadedFaces = await document.fonts.load(font, text)
    if (family === 'EmojiMart' && !loadedFaces.length) {
      throw new Error('EmojiMart font did not load')
    }
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')
    context.font = font
    context.fillText(text, 0, 48)
    return context.getImageData(0, 0, 64, 64).data
  }
`

test.beforeAll(async () => {
  dc = await DeltaChatElectron.launch({ name: 'emoji-font' })
  // DOMContentLoaded does not wait for the asynchronous renderer initialization.
  await expect(
    dc.mainWindow.getByRole('button', { name: 'I Already Have a Profile' })
  ).toBeVisible()
})

test.afterAll(async () => {
  await dc?.close()
})

test('keeps Apple emoji unless the native font renders blank', async () => {
  test.skip(process.platform !== 'darwin', 'Apple Color Emoji is macOS-only')
  const result = await dc.evalInMainWorld<{
    nativeVisible: boolean
    matchesNative: boolean
    matchesBundled: boolean
  }>(`
    (async () => {
      ${renderText}
      const native = new FontFace('NativeEmojiReference', 'local("Apple Color Emoji")')
      await native.load()
      document.fonts.add(native)
      try {
        const selected = await renderText('EmojiMart')
        const apple = await renderText('NativeEmojiReference')
        const bundled = await renderText('NotoEmoji')
        return {
          nativeVisible: apple.some((value, index) => index % 4 === 3 && value > 0),
          matchesNative: selected.every((value, index) => value === apple[index]),
          matchesBundled: selected.every((value, index) => value === bundled[index]),
        }
      } finally {
        document.fonts.delete(native)
      }
    })()
  `)
  expect(
    result.nativeVisible ? result.matchesNative : result.matchesBundled
  ).toBe(true)
})

for (const useSystemUIFont of [false, true]) {
  test(`the picker and body fonts render emoji (system UI font ${useSystemUIFont ? 'on' : 'off'})`, async () => {
    const results = await dc.evalInMainWorld<
      { family: string; visiblePixels: number; colorPixels: number }[]
    >(`
      (async () => {
        ${renderText}
        document.body.classList.toggle('system-fonts', ${useSystemUIFont})
        const families = ['EmojiMart', getComputedStyle(document.body).fontFamily]
        const results = []
        for (const family of families) {
          const pixels = await renderText(family)
          let visiblePixels = 0
          let colorPixels = 0
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3]) visiblePixels++
            if (pixels[i + 3] &&
                (pixels[i] !== pixels[i + 1] || pixels[i + 1] !== pixels[i + 2])) {
              colorPixels++
            }
          }
          results.push({ family, visiblePixels, colorPixels })
        }
        return results
      })()
    `)

    expect(results[1]?.family.startsWith('system-ui')).toBe(useSystemUIFont)
    for (const { family, visiblePixels, colorPixels } of results) {
      expect
        .soft(visiblePixels, `visible emoji pixels with ${family}`)
        .toBeGreaterThan(0)
      // System fonts can supply monochrome emoji, notably on Linux.
      // The explicit picker font must still render in color.
      if (family === 'EmojiMart') {
        expect
          .soft(colorPixels, `color emoji pixels with ${family}`)
          .toBeGreaterThan(0)
      }
    }
  })
}

test('theme fonts can override the emoji fallback', async () => {
  const matchesTheme = await dc.evalInMainWorld<boolean>(`
    (async () => {
      ${renderText}
      const theme = document.getElementById('theme-vars')
      const original = theme.textContent
      theme.textContent += '@font-face { font-family: EmojiMart; src: url("./fonts/Roboto-Regular.ttf") }'
      try {
        // Both fonts contain ©, but only Roboto should be selected by the theme.
        const selected = await renderText('EmojiMart', '©')
        const reference = await renderText('Roboto', '©')
        return selected.every((value, index) => value === reference[index])
      } finally {
        theme.textContent = original
      }
    })()
  `)
  expect(matchesTheme).toBe(true)
})
