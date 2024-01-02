export function cachedLastUsedPath(
export function rememberLastUsedPath(
  key: `last_directory:${string}`,
  defaultPath: string
) {
  const selectedPath = sessionStorage.getItem(key) || defaultPath

  const setLastPath = (lastPath: string) => {
    if (lastPath !== defaultPath) {
      sessionStorage.setItem(key, lastPath)
    }
  }

  return { defaultPath: selectedPath, setLastPath }
}
