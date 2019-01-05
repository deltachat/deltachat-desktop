// export type MIMEType = string & { _mimeTypeBrand: any };

// export const APPLICATION_OCTET_STREAM = 'application/octet-stream'
// export const APPLICATION_JSON = 'application/json'
// export const AUDIO_AAC = 'audio/aac'
// export const AUDIO_MP3 = 'audio/mp3'
// export const AUDIO_OGG = 'audio/ogg'
// export const IMAGE_GIF = 'image/gif'
// export const IMAGE_JPG = 'image/jpg'
// export const IMAGE_JPEG = 'image/jpeg'
// export const VIDEO_MP4 = 'video/mp4'
// export const VIDEO_QUICKTIME = 'video/quicktime'

// export const isJPEG = value => value === 'image/jpeg'
// export const isImage = value => value.startsWith('image/')
// export const isVideo = value => value.startsWith('video/')
exports.isAudio = value => value.startsWith('audio/')
