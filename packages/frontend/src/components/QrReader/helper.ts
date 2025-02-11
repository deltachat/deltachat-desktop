import scanQrCode, { QRCode } from 'jsqr'
import { Runtime } from '@deltachat-desktop/runtime-interface'

/**
 * Convert file data to base64 encoded data URL string.
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    try {
      reader.addEventListener(
        'load',
        () => {
          resolve(reader.result as string)
        },
        false
      )

      reader.readAsDataURL(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert base64-encoded blob string into image data.
 */
export async function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = image.width
        canvas.height = image.height

        if (!context) {
          return
        }

        context.drawImage(image, 0, 0)

        const imageData = context.getImageData(0, 0, image.width, image.height)
        resolve(imageData)
      } catch (error) {
        reject(error)
      }
    })
    image.addEventListener('error', err => {
      reject(err)
    })
    image.src = base64
  })
}

/**
 * @throws Error (no data in clipboard)
 */
export async function qrCodeFromClipboard(runtime: Runtime): Promise<string> {
  // Try interpreting the clipboard data as an image
  const base64 = await runtime.readClipboardImage()
  if (base64) {
    const imageData = await base64ToImageData(base64)
    const result = scanQrCode(imageData.data, imageData.width, imageData.height)
    if (result?.data) {
      return result.data
    } else {
      throw new Error('no data in clipboard image')
    }
  }

  // .. otherwise return non-image data from clipboard directly
  const data = await runtime.readClipboardText()
  if (!data) {
    throw new Error('no data in clipboard')
  }
  // trim whitespaces because user might copy them by accident when sending over other messengers
  // see https://github.com/deltachat/deltachat-desktop/issues/4161#issuecomment-2390428338
  return data.trim()
}

export async function qrCodeFromImage(file: File): Promise<QRCode | null> {
  const base64 = await fileToBase64(file)
  const imageData = await base64ToImageData(base64)
  return scanQrCode(imageData.data, imageData.width, imageData.height)
}
