import { platform } from 'os'
import { writeFile, rm } from 'fs/promises'
import appConfig from './application-config'
import { join } from 'path'
import { existsSync } from 'fs'

export let appx = false

export async function findOutIfWeAreRunningAsAppx() {
  if (platform() === 'win32') {
    const configFolder = appConfig.filePath
    const appxConfigFolder = join(
      configFolder,
      '../Packages/merlinux.DeltaChat_v2ry5hvxhdhyy/LocalCache/Local/DeltaChat'
    )
    const testfile = join(configFolder, 'appxTest.txt')
    const testfileInAppx = join(appxConfigFolder, 'appxTest.txt')

    if (existsSync(testfile)) {
      await rm(testfile)
    }

    await writeFile(testfile, 'test')

    if (existsSync(testfileInAppx)) {
      appx = true
    }

    // cleanup
    if (existsSync(testfile)) {
      await rm(testfile)
    }
  }
}
