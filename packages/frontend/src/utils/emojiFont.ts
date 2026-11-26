/** Keep the selected emoji font unless it draws blank, as Apple emoji can do
 * in sandboxed Electron with macOS Lockdown Mode enabled. */
export async function ensureEmojiFont(): Promise<boolean> {
  const font = '48px EmojiMart'
  await document.fonts.load(font, '😀')

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) return false
  context.font = font
  context.fillText('😀', 0, 48)
  const pixels = context.getImageData(0, 0, 64, 64).data
  if (pixels.some((value, index) => index % 4 === 3 && value > 0)) {
    return false
  }

  // Keep the fallback in the base stylesheet so theme fonts still take priority.
  const sheet = document.querySelector<HTMLLinkElement>(
    'link[href="./fonts/fonts.css"]'
  )?.sheet
  if (!sheet) return false
  const index = sheet.insertRule(
    '@font-face { font-family: EmojiMart; src: url("noto/emoji/NotoColorEmoji.ttf") }',
    sheet.cssRules.length
  )
  try {
    await document.fonts.load(font, '😀')
  } catch (error) {
    sheet.deleteRule(index)
    throw error
  }
  return true
}
