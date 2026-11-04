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

export type ImageDisplaySize = {
  width: number
  height: number
  /** fraction of the image that is visible after cropping, 1 = not cropped */
  visibleFraction: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

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
 * - ratios between IMAGE_MIN_PORTRAIT_RATIO (200x450) and IMAGE_MAX_LANDSCAPE_RATIO (4:1)
 *   are shown completely
 *
 * - images outside of this range are cropped to the closest allowed ratio
 *   (centered, by `object-fit: cover`) and show an "Image is cropped"
 *   indicator
 */
export function getImageDisplaySize(
  width: number,
  height: number
): ImageDisplaySize {
  if (width <= 0 || height <= 0) {
    // unknown dimensions
    return {
      width: IMAGE_MIN_WIDTH,
      height: IMAGE_MIN_WIDTH,
      visibleFraction: 1,
    }
  }

  const ratio = width / height
  const displayRatio = clamp(
    ratio,
    IMAGE_MIN_PORTRAIT_RATIO,
    IMAGE_MAX_LANDSCAPE_RATIO
  )

  let displayWidth: number
  let displayHeight: number
  if (displayRatio >= 1) {
    // landscape
    displayWidth = clamp(width, IMAGE_MIN_WIDTH, IMAGE_MAX_WIDTH)
    displayHeight = displayWidth / displayRatio
  } else {
    // portrait
    displayHeight = clamp(
      height,
      IMAGE_MIN_WIDTH / displayRatio,
      IMAGE_MAX_HEIGHT
    )
    displayWidth = displayHeight * displayRatio
  }

  const sizeSum = displayWidth + displayHeight
  if (sizeSum > IMAGE_MAX_WIDTH_PLUS_HEIGHT) {
    displayWidth *= IMAGE_MAX_WIDTH_PLUS_HEIGHT / sizeSum
    displayHeight *= IMAGE_MAX_WIDTH_PLUS_HEIGHT / sizeSum
  }

  return {
    width: Math.round(displayWidth),
    height: Math.round(displayHeight),
    visibleFraction: Math.min(ratio / displayRatio, displayRatio / ratio),
  }
}
