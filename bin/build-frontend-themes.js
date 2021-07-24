const { readdir, readFile, writeFile } = require('fs/promises')
const sass = require('sass')
const { join } = require('path')

const dc_theme_dir = join(__dirname, '../themes')
;(async () => {
  const files = await readdir(dc_theme_dir)
  const themes = files.filter(f => f.includes('.scss') && f.charAt(0) !== '_')
  try {
    const result = await Promise.all(
      themes.map(async theme => {
        const theme_data = await readFile(join(dc_theme_dir, theme), 'utf-8')

        return new Promise((res, rej) => {
          sass.render(
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
