const ASCII_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const ASCII_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const PUNCTUATION = "%&'()*+,-./:;<=>?@[]^_`{|}~"

export function generateRandomUUID() {
  return crypto.randomUUID()
}

export function getCryptoRandomBetween(min: number, max: number): number {
  // The highest random value that crypto.getRandomValues could store in a Uint32Array
  const MAX_VAL = 4294967295

  // Find the number of randoms we'll need to generate in order to give every
  // number between min and max a fair chance
  const numberOfRandomsNeeded = Math.ceil((max - min) / MAX_VAL)

  // Grab those randoms
  const cryptoRandomNumbers = new Uint32Array(numberOfRandomsNeeded)
  crypto.getRandomValues(cryptoRandomNumbers)

  // Add them together
  let sum = 0
  for (let i = 0; i < cryptoRandomNumbers.length; i++) {
    sum += cryptoRandomNumbers[i]
  }

  // ... and divide their sum by the max possible value to get a decimal
  const randomDecimal = sum / (MAX_VAL * numberOfRandomsNeeded)

  // If result is 1, retry. otherwise, return decimal.
  return randomDecimal === 1
    ? getCryptoRandomBetween(min, max)
    : Math.floor(randomDecimal * (max - min + 1) + min)
}

export function getRandomChar(str: string) {
  return str.charAt(getCryptoRandomBetween(0, str.length - 1))
}

export function getRandomString(length: number, characters: string): string {
  let str = ''
  for (let i = 0; i < length; i++) {
    str += getRandomChar(characters)
  }
  return str
}

export function getRandomAlphanumeric(length = 9): string {
  return getRandomString(length, ASCII_LOWERCASE + ASCII_UPPERCASE + DIGITS)
}

export function getRandomAlphanumericPunct(length = 32): string {
  return getRandomString(
    length,
    ASCII_LOWERCASE + ASCII_UPPERCASE + DIGITS + PUNCTUATION
  )
}
