//@ts-check
import { readdir, readFile, writeFile, rm, mkdir } from 'fs/promises'
import { compile, compileString, renderSync } from 'sass'
import { join, dirname } from 'path'

import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dc_theme_in_dir = join(__dirname, '../themes')
const dc_theme_out_dir = join(__dirname, '../html-dist/themes')

;(async () => {
  const files = await readdir(dc_theme_in_dir)

  await mkdir(dc_theme_out_dir, { recursive: true })

  // remove old files
  await Promise.all(
    files
      .filter(f => f.includes('.css'))
      .map(file => rm(join(dc_theme_out_dir, file)))
  )

  const themes = files.filter(f => f.includes('.scss') && f.charAt(0) !== '_')
  try {
    const result = await Promise.all(
      themes.map(async theme => {
        const start = performance.now()
        const theme_data = await readFile(join(dc_theme_in_dir, theme), 'utf-8')

        const result = compileString(theme_data, {
          style: 'compressed',
          loadPaths: [dc_theme_in_dir],
          sourceMap: false,
        })
        const resulting_filename = theme.replace('.scss', '.css')
        await writeFile(join(dc_theme_out_dir, resulting_filename), result.css)
        const end = performance.now()
        return [theme, end - start]
      })
    )
    // result.forEach(([theme, duration]) => {
    //   console.log(theme, 'took', duration)
    // })
  } catch (error) {
    console.error(error)
  }
})()
