import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const alternativeDirectory = process.env['DELTACHAT_LOCALE_DIR']

let cachedResult: string | null = null

// Idea: there could be instead a `resolveLocaleDirectoryPath(file)`
// function that looks in the other folders as fallback if it can't find a file
// this could make the `DELTACHAT_LOCALE_DIR` env var more useful in
// also allowing partial locale directories.

export function getLocaleDirectoryPath() {
  if (cachedResult) {
    return cachedResult
  }

  const places = [
    alternativeDirectory,
    join(__dirname, '../_locales'), // packaged
    join(__dirname, '../../../_locales'), // development
  ]

  if (alternativeDirectory && !isValidLocaleDirectory(alternativeDirectory)) {
    throw new Error(
      `Custom locale directory specified in \`DELTACHAT_LOCALE_DIR\` env var is not a valid locale directory.
      Make sure it exists and contains atleast the following files:
      - _languages.json        // index of what languages exist
      - _untranslated_en.json  // for untranslated strings
      - en.json                // for fallback
      
      Path to the invalid directory: ${alternativeDirectory}`
    )
  }

  const directory = places.find(isValidLocaleDirectory)
  if (!directory) {
    throw new Error('Failed to find locale data')
  }
  cachedResult = directory
  return directory
}

function isValidLocaleDirectory(path: string | undefined): boolean {
  // console.log("isValidLocaleDirectory", path);

  return (
    path !== undefined &&
    existsSync(path) &&
    existsSync(join(path, '_languages.json')) &&
    existsSync(join(path, '_untranslated_en.json')) &&
    existsSync(join(path, 'en.json'))
  )
}
