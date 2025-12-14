import scanQrCode from 'jsqr'

self.addEventListener('message', event => {
  const { data, width, height } = event.data
  const result = scanQrCode(data, width, height)

  if (result) {
    postMessage(result.data)
  } else {
    postMessage(null)
  }
})
