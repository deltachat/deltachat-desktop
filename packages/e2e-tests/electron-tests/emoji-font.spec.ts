import { test, expect } from '@playwright/test'

import { DeltaChatElectron } from '../electron-helper.js'

// Run on macOS with Lockdown Mode enabled to cover the ImageIO sandbox issue.
let dc: DeltaChatElectron

test.beforeAll(async () => {
  dc = await DeltaChatElectron.launch({ name: 'emoji-font' })
})

test.afterAll(async () => {
  await dc?.close()
})

for (const useSystemUIFont of [false, true]) {
  test(`the picker and body fonts render emoji (system UI font ${useSystemUIFont ? 'on' : 'off'})`, async () => {
    const results = await dc.evalInMainWorld<
      { family: string; visiblePixels: number; colorPixels: number }[]
    >(`
      (async () => {
        document.body.classList.toggle('system-fonts', ${useSystemUIFont})
        const families = ['EmojiMart', getComputedStyle(document.body).fontFamily]
        const results = []
        for (const family of families) {
          const font = '48px ' + family
          const loadedFaces = await document.fonts.load(font, '😀')
          if (family === 'EmojiMart' && !loadedFaces.length) {
            throw new Error('EmojiMart font did not load')
          }
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 64
          const context = canvas.getContext('2d')
          context.font = font
          context.fillText('😀', 0, 48)
          const pixels = context.getImageData(0, 0, 64, 64).data
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
      // The explicitly bundled picker font must still render in color.
      if (family === 'EmojiMart') {
        expect
          .soft(colorPixels, `color emoji pixels with ${family}`)
          .toBeGreaterThan(0)
      }
    }
  })
}
