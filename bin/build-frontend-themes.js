//@ts-check
import { readdir, readFile, writeFile, rm } from 'fs/promises'
import { render } from 'sass'
import { join, dirname } from 'path'

import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dc_theme_dir = join(__dirname, '../themes')
;(async () => {
  const files = await readdir(dc_theme_dir)

  // remove old files
  await Promise.all(
    files
      .filter(f => f.includes('.css'))
      .map(file => rm(join(dc_theme_dir, file)))
  )

  const themes = files.filter(f => f.includes('.scss') && f.charAt(0) !== '_')
  try {
    const result = await Promise.all(
      themes.map(async theme => {
        const theme_data = await readFile(join(dc_theme_dir, theme), 'utf-8')

        return new Promise((res, rej) => {
          render(
            {
              outputStyle: 'compressed',
              data: theme_data,
              includePaths: [dc_theme_dir],
              sourceMap: false,
            },
            async (err, result) => {
              if (err) return rej(err)
              try {
                const resulting_filename = theme.replace('.scss', '.css')
                await writeFile(
                  join(dc_theme_dir, resulting_filename),
                  result.css
                )
                res([theme, result.stats.duration])
              } catch (error) {
                rej(err)
              }
            }
          )
        })
      })
    )
    // result.forEach(([theme, duration]) => {
    //   console.log(theme, 'took', duration)
    // })
  } catch (error) {
    console.error(error)
  }
})()
