import { app } from 'electron'
import { mkdir, readdir, rm, rmdir } from 'fs/promises'
import { join } from 'path'
import { getLogger } from '../../shared/logger.js'
import {
  getDraftTempDir,
  getAccountsPath,
  INTERNAL_TMP_DIR_NAME,
} from './application-constants.js'
import { readdirSync } from 'fs'

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
      for (const file of files) {
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

/**
 * clean tmp directory in all accounts
 */
export async function cleanupInternalTempDirs() {
  try {
    let deletedTmpDirs = 0
    const tmpDirents = readdirSync(getAccountsPath(), {
      withFileTypes: true,
    })
      .filter(dirent => dirent.isDirectory())
      .flatMap(accountDir => {
        return readdirSync(join(accountDir.parentPath, accountDir.name), {
          withFileTypes: true,
        }).filter(
          tmpDir =>
            tmpDir.isDirectory() && tmpDir.name === INTERNAL_TMP_DIR_NAME
        )
      })
    if (tmpDirents.length > 0) {
      deletedTmpDirs = (
        await Promise.all(
          tmpDirents.map(tmpDir =>
            rm(join(tmpDir.parentPath, tmpDir.name), {
              recursive: true,
              force: true,
            })
          )
        )
      ).length
    }
    log.info(`Deleted ${deletedTmpDirs} internal tmp directories`)
  } catch (error) {
    log.error('Cleanup of internal temp dirs failed: ', error)
  }
}
