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
