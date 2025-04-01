import type libheif_init_type from 'libheif-js/libheif-wasm/libheif'
import libheif_init from './libheif'

let libheif: ReturnType<typeof libheif_init_type> | null = null

export async function initLibHeif(path_to_wasm: string) {
  const wasmBinary = await (await fetch(path_to_wasm)).arrayBuffer()
  libheif = libheif_init({ wasmBinary })
}

// IDEA: performance: make sure the conversion is not started multiple times for the same file

export async function loadAndConvertToPngDataUrl(src: string): Promise<{
  objectUrl: string
  width: number
  height: number
}> {
  const id = `heif_${encodeURIComponent(src)}`
  const cached = sessionStorage.getItem(id)
  if (cached) {
    return Promise.resolve(JSON.parse(cached))
  }

  const buffer = await (await fetch(src)).arrayBuffer()
  const decoder = new libheif!.HeifDecoder()
  // console.log({ libheif, decoder })
  const data = decoder.decode(buffer)
  const image = data[0]
  const width = image.get_width()
  const height = image.get_height()

  // console.log({ image, width, height })
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  const imageData = context.createImageData(width, height)
  await new Promise<void>((resolve, reject) => {
    image.display(imageData, (displayData: unknown) => {
      if (!displayData) {
        return reject(new Error('HEIF processing error'))
      }

      resolve()
    })
  })
  context.putImageData(imageData, 0, 0)
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(c => {
      if (!c) {
        rej('conversion to blob failed')
      } else {
        res(c)
      }
    })
  )
  // console.log({ blob })

  const objectUrl = URL.createObjectURL(blob)
  const result = { objectUrl, height, width }
  sessionStorage.setItem(id, JSON.stringify(result))
  return result
}
