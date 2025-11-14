const userPerceivedCharacterSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
})
/**
 * Works both in Node.js and in the browser.
 *
 * This could return an empty string, e.g. if the inputs are also empty strings.
 */
export function avatarInitial(name: string, addr?: string): string {
  const str = name || addr || ''
  const segments = userPerceivedCharacterSegmenter.segment(str)
  return segments[Symbol.iterator]().next().value?.segment.toUpperCase() ?? ''
}
