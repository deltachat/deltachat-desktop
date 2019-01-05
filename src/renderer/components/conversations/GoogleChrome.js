// See: https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image_format_support
const SUPPORTED_IMAGE_MIME_TYPES = {
  'image/bmp': true,
  'image/gif': true,
  'image/jpeg': true,
  // No need to support SVG
  'image/svg+xml': false,
  'image/webp': true,
  'image/x-xbitmap': true,
  // ICO
  'image/vnd.microsoft.icon': true,
  'image/ico': true,
  'image/icon': true,
  'image/x-icon': true,
  // PNG
  'image/apng': true,
  'image/png': true
}

const isImageTypeSupported = mimeType => {
  return SUPPORTED_IMAGE_MIME_TYPES[mimeType] === true
}

const SUPPORTED_VIDEO_MIME_TYPES = {
  'video/mp4': true,
  'video/ogg': true,
  'video/webm': true
}

// See: https://www.chromium.org/audio-video
const isVideoTypeSupported = mimeType => {
  return SUPPORTED_VIDEO_MIME_TYPES[mimeType] === true
}

module.exports = {
  isImageTypeSupported,
  isVideoTypeSupported
}
