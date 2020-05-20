const globWatch = require('glob-watcher')
const fs = require('fs-extra')

async function main(watch=false) {
  const copy = async () => {
    await fs.copy('./static/', './html-dist/')
    console.log('- copied files from static folder')
  }
  await copy()

  if (watch) {
    // (whats the usecase of this? live update after pulling in translations??)
    globWatch(['./static/*'], (done) => {
      copyAction.then(done)
    })
  }
}

main()
