export const enum LastUsedSlot {
  Attachment = 'last_directory:attachment',
  ProfileImage = 'last_directory:profile_image',
  GroupImage = 'last_directory:group_image',
  Backup = 'last_directory:backup',
  BackgroundImage = 'last_directory:background_image',
  KeyImport = 'last_directory:keys_import',
  KeyExport = 'last_directory:keys_export',
}

export function rememberLastUsedPath(key: LastUsedSlot, defaultPath: string) {
  const selectedPath = sessionStorage.getItem(key) || defaultPath

  const setLastPath = (lastPath: string) => {
    if (lastPath !== defaultPath) {
      sessionStorage.setItem(key, lastPath)
    }
  }

  return { defaultPath: selectedPath, setLastPath }
}
