export function parseThemeMetaData(rawTheme: string): {
  name: string
  description: string
} {
  const meta_data_block =
    /.theme-meta ?{([^]*)}/gm.exec(rawTheme)?.[1].trim() || ''

  const regex = /--(\w*): ?['"]([^]*?)['"];?/gi

  const meta: { [key: string]: string } = {}

  let last_result: any = true

  while (last_result) {
    last_result = regex.exec(meta_data_block)
    if (last_result) {
      meta[last_result[1]] = last_result[2]
    }
  }

  // check if name and description are defined
  if (!meta.name || !meta.description) {
    throw new Error(
      'The meta variables meta.name and meta.description must be defined'
    )
  }

  return <any>meta
}

export const HIDDEN_THEME_PREFIX = 'dev_'
