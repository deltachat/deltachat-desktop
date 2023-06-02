import { app } from 'electron'
import { mkdir, readdir, rm, rmdir } from 'fs/promises'
import { join } from 'path'
import { getLogger } from '../shared/logger'
import { getDraftTempDir } from './application-constants'

const log = getLogger('main/cleanup_temp_dir')

export async function cleanupDraftTempDir() {
  try {
    // ensure dir exists
    const path = getDraftTempDir()
    await mkdir(path, { recursive: true })
    if (path.indexOf(app.getPath('temp')) === -1 || path.indexOf('..') !== -1) {
      log.error(
        'removeTempFile was called with a path that is outside of the temp dir: ',
        path
      )
      throw new Error('Path is outside of the temp folder')
    }

    const files = await readdir(path)
    if (files.length !== 0) {
      log.debug(
        `found old ${files.length} temporary draft files, trying to delete them now`
      )
      const promises = []
      for (const file in files) {
        log.debug('delete', join(path, file))
        promises.push(rm(join(path, file)))
      }

      await Promise.all(promises)
    }

    // delete dir at the end
    await rmdir(path)
  } catch (error) {
    log.error('Cleanup of old temp files failed: ', error)
  }
}
