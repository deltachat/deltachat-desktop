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

test('the picker and body fonts render color emoji', async () => {
  const results = await dc.evalInMainWorld<
    { family: string; colorPixels: number }[]
  >(`
    (async () => {
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
        let colorPixels = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] &&
              (pixels[i] !== pixels[i + 1] || pixels[i + 1] !== pixels[i + 2])) {
            colorPixels++
          }
        }
        results.push({ family, colorPixels })
      }
      return results
    })()
  `)

  for (const { family, colorPixels } of results) {
    expect(colorPixels, `color emoji pixels with ${family}`).toBeGreaterThan(0)
  }
})
