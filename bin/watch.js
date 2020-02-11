var watch = require('glob-watcher')
var child = require('child_process')

watch(['./_locales/*.xml'], function (done) {
  var p = child.spawn('npm', ['run', 'build-translations'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

var tsc = child.spawn('npx', 'tsc -b src/renderer -w --pretty'.split(' '))
tsc.stdout.pipe(process.stdout)
tsc.stderr.pipe(process.stderr)

var parcel = child.spawn('npx', 'parcel src/renderer/*.html --out-dir html-dist --public-url ./ --target electron'.split(' '))
parcel.stdout.pipe(process.stdout)
parcel.stderr.pipe(process.stderr)
