/** needed for readable footer & reactions */
export const IMAGE_MIN_WIDTH = 200
export const IMAGE_MAX_WIDTH = 450
export const IMAGE_MAX_HEIGHT = 450
/**
 * limits images close to 1:1, so they don't take much more room
 * than e.g. 16:9 images (450x253)
 */
export const IMAGE_MAX_WIDTH_PLUS_HEIGHT = 720

/** wider images are cropped to this width/height ratio */
export const IMAGE_MAX_LANDSCAPE_RATIO = 4

/** taller images are cropped to this width/height ratio (200x450) */
export const IMAGE_MIN_PORTRAIT_RATIO = IMAGE_MIN_WIDTH / IMAGE_MAX_HEIGHT

/**
 * message bubbles with an image and text are at least this wide,
 * so the text doesn't get too narrow
 */
export const IMAGE_WITH_TEXT_MIN_WIDTH = 300

/**
 * Images with text that are narrower than IMAGE_WITH_TEXT_MIN_WIDTH
 * are widened and cropped to fill the bubble, if at least this fraction
 * of what is visible without text stays visible (e.g. 9:16 keeps 84%).
 * Otherwise the space next to the image is filled with a blurred copy.
 */
export const IMAGE_WITH_TEXT_MIN_VISIBLE = 0.8

export type ImageDisplaySize = {
  width: number
  height: number
  /** fraction of the image that is visible after cropping, 1 = not cropped */
  visibleFraction: number
  /**
   * the image is narrower than the bubble (IMAGE_WITH_TEXT_MIN_WIDTH),
   * the space next to it is filled with a blurred copy of the image
   */
  blurredFill: boolean
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function computeSize(width: number, height: number, minWidth: number) {
  const ratio = width / height
  let displayRatio = clamp(
    ratio,
    minWidth / IMAGE_MAX_HEIGHT,
    IMAGE_MAX_LANDSCAPE_RATIO
  )

  let displayWidth: number
  let displayHeight: number
  if (displayRatio >= 1) {
    // landscape
    displayWidth = clamp(width, minWidth, IMAGE_MAX_WIDTH)
    displayHeight = displayWidth / displayRatio
  } else {
    // portrait
    displayHeight = clamp(height, minWidth / displayRatio, IMAGE_MAX_HEIGHT)
    displayWidth = displayHeight * displayRatio
  }

  const sizeSum = displayWidth + displayHeight
  if (sizeSum > IMAGE_MAX_WIDTH_PLUS_HEIGHT) {
    displayWidth *= IMAGE_MAX_WIDTH_PLUS_HEIGHT / sizeSum
    displayHeight *= IMAGE_MAX_WIDTH_PLUS_HEIGHT / sizeSum
  }

  // the minimum width wins over the width + height limit
  if (displayWidth < minWidth) {
    displayWidth = minWidth
    displayHeight = Math.min(IMAGE_MAX_HEIGHT, minWidth / displayRatio)
    displayRatio = displayWidth / displayHeight
  }

  return {
    width: Math.round(displayWidth),
    height: Math.round(displayHeight),
    visibleFraction: Math.min(ratio / displayRatio, displayRatio / ratio),
  }
}

/**
 * Size of an image in the message list, computed from its dimensions so it
 * is known before the image is loaded.
 *
 * - images are scaled to a width between IMAGE_MIN_WIDTH (200px) and IMAGE_MAX_WIDTH (450px)
 *   and a height of at most IMAGE_MAX_HEIGHT (450px)
 *
 * - width + height is at most IMAGE_MAX_WIDTH_PLUS_HEIGHT (720px),
 *   so a square image becomes 360x360 and not 450x450
 *
 * - ratios between IMAGE_MIN_PORTRAIT_RATIO (1:2.25) and IMAGE_MAX_LANDSCAPE_RATIO (4:1)
 *   are shown completely
 *
 * - images outside of this range are cropped to the closest allowed ratio
 *   (centered, by `object-fit: cover`) and show an "Image is cropped"
 *   indicator
 *
 * - images with text fill a bubble of at least IMAGE_WITH_TEXT_MIN_WIDTH,
 *   see IMAGE_WITH_TEXT_MIN_VISIBLE
 */
export function getImageDisplaySize(
  width: number,
  height: number,
  withText = false
): ImageDisplaySize {
  if (width <= 0 || height <= 0) {
    // unknown dimensions
    const size = withText ? IMAGE_WITH_TEXT_MIN_WIDTH : IMAGE_MIN_WIDTH
    return {
      width: size,
      height: size,
      visibleFraction: 1,
      blurredFill: false,
    }
  }

  const withoutText = computeSize(width, height, IMAGE_MIN_WIDTH)
  if (!withText || withoutText.width >= IMAGE_WITH_TEXT_MIN_WIDTH) {
    return { ...withoutText, blurredFill: false }
  }

  const widened = computeSize(width, height, IMAGE_WITH_TEXT_MIN_WIDTH)
  if (
    widened.visibleFraction / withoutText.visibleFraction >=
    IMAGE_WITH_TEXT_MIN_VISIBLE
  ) {
    return { ...widened, blurredFill: false }
  }
  return { ...withoutText, blurredFill: true }
}
