/* eslint-disable no-console */
import path from 'node:path'

const envPath = path.join(import.meta.dirname, '.env')

export function loadEnv() {
  try {
    return process.loadEnvFile?.(envPath)
  } catch (_error) {
    console.log(`No .env file to load ${envPath}`)
  }
}
