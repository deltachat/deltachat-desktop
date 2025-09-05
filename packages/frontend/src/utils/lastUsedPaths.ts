import { runtime } from '@deltachat-desktop/runtime-interface'

export const enum LastUsedSlot {
  Attachment = 'last_directory:attachment',
  ProfileImage = 'last_directory:profile_image',
  GroupImage = 'last_directory:group_image',
  Backup = 'last_directory:backup',
  BackgroundImage = 'last_directory:background_image',
  KeyImport = 'last_directory:keys_import',
  KeyExport = 'last_directory:keys_export',
}

const defaultLocations: {
  [key in LastUsedSlot]: Parameters<typeof runtime.getAppPath>[0]
} = {
  [LastUsedSlot.Attachment]: 'home',
  [LastUsedSlot.ProfileImage]: 'pictures',
  [LastUsedSlot.GroupImage]: 'pictures',
  [LastUsedSlot.Backup]: 'downloads',
  [LastUsedSlot.BackgroundImage]: 'pictures',
  [LastUsedSlot.KeyImport]: 'downloads',
  [LastUsedSlot.KeyExport]: 'downloads',
}

/*
 * What path last has been used for this data? Return a default path if
 * no path has been used.
 *
 * @param {string} key The data slot you are looking for.
 * @return {Promise<{ defaultPath: string, setLastPath: (lastPath: string) : void}>} The default path as well as a callback to set the last path.
 */
export async function rememberLastUsedPath(key: LastUsedSlot) {
  const defaultPath = await runtime.getAppPath(defaultLocations[key])
  const selectedPath = sessionStorage.getItem(key) || defaultPath

  const setLastPath = (lastPath: string) => {
    if (lastPath !== defaultPath) {
      sessionStorage.setItem(key, lastPath)
    }
  }

  return { defaultPath: selectedPath, setLastPath }
}
