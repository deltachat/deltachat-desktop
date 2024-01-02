import { runtime } from '../runtime'

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

export function rememberLastUsedPath(key: LastUsedSlot) {
  const defaultPath = runtime.getAppPath(defaultLocations[key])
  const selectedPath = sessionStorage.getItem(key) || defaultPath

  const setLastPath = (lastPath: string) => {
    if (lastPath !== defaultPath) {
      sessionStorage.setItem(key, lastPath)
    }
  }

  return { defaultPath: selectedPath, setLastPath }
}
