import { expect } from 'chai'
import { afterEach, describe, it } from 'mocha'

import { ensureEmojiFont } from '../utils/emojiFont.js'

describe('ensureEmojiFont', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document'
  )

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument)
    } else {
      Reflect.deleteProperty(globalThis, 'document')
    }
  })

  function setup(
    pixels: number[],
    contextAvailable = true,
    nativeReady = Promise.resolve()
  ) {
    const calls: string[] = []
    const rules: string[] = []
    let failFallbackLoad = false
    const context = {
      font: '',
      fillText(text: string) {
        calls.push(`draw ${text}`)
      },
      getImageData: () => ({ data: new Uint8ClampedArray(pixels) }),
    }
    const sheet = {
      cssRules: rules,
      insertRule(rule: string, index: number) {
        rules.splice(index, 0, rule)
        return index
      },
      deleteRule(index: number) {
        rules.splice(index, 1)
      },
    }
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        fonts: {
          async load(font: string, text: string) {
            calls.push(`load ${font} ${text}`)
            if (rules.length) {
              if (failFallbackLoad) throw new Error('font unavailable')
              pixels = [255, 128, 0, 255]
            } else {
              await nativeReady
            }
          },
        },
        createElement: () => ({
          getContext: () => (contextAvailable ? context : null),
        }),
        querySelector: () => ({ sheet }),
      },
    })
    return {
      calls,
      rules,
      context,
      failFallbackLoad: () => (failFallbackLoad = true),
    }
  }

  it('keeps a working color font and waits for it before drawing', async () => {
    let ready!: () => void
    const nativeReady = new Promise<void>(resolve => (ready = resolve))
    const { calls, rules, context } = setup(
      [255, 128, 0, 255],
      true,
      nativeReady
    )
    const result = ensureEmojiFont()
    expect(calls).to.deep.equal(['load 48px EmojiMart 😀'])
    ready()
    expect(await result).to.equal(false)
    expect(calls).to.deep.equal(['load 48px EmojiMart 😀', 'draw 😀'])
    expect(context.font).to.equal('48px EmojiMart')
    expect(rules).to.have.length(0)
  })

  it('keeps a working monochrome font', async () => {
    const { rules } = setup([0, 0, 0, 255])
    expect(await ensureEmojiFont()).to.equal(false)
    expect(rules).to.have.length(0)
  })

  it('loads bundled Noto under the picker alias when emoji are blank', async () => {
    const { rules } = setup([0, 0, 0, 0])
    expect(await ensureEmojiFont()).to.equal(true)
    expect(rules).to.deep.equal([
      '@font-face { font-family: EmojiMart; src: url("noto/emoji/NotoColorEmoji.ttf") }',
    ])
  })

  it('ignores RGB values in transparent pixels', async () => {
    setup([255, 128, 0, 0])
    expect(await ensureEmojiFont()).to.equal(true)
  })

  it('does not change fonts when canvas is unavailable', async () => {
    const { rules } = setup([], false)
    expect(await ensureEmojiFont()).to.equal(false)
    expect(rules).to.have.length(0)
  })

  it('removes a fallback that failed to load', async () => {
    const { rules, failFallbackLoad } = setup([0, 0, 0, 0])
    failFallbackLoad()
    let error: unknown
    try {
      await ensureEmojiFont()
    } catch (err) {
      error = err
    }
    expect(error).to.be.instanceOf(Error)
    expect(rules).to.have.length(0)
  })

  it('does not add another fallback when called again', async () => {
    const { rules } = setup([0, 0, 0, 0])
    expect(await ensureEmojiFont()).to.equal(true)
    expect(await ensureEmojiFont()).to.equal(false)
    expect(rules).to.have.length(1)
  })
})
