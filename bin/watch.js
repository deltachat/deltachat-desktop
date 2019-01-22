var watch = require('glob-watcher')
var child = require('child_process')

watch([ './src/main' ], function (done) {
  var p = child.spawn('npm', ['run', 'build-backend'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([ './src/renderer' ], function (done) {
  var p = child.spawn('npm', ['run', 'build-frontend'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([ './src/*' ], function (done) {
  var p = child.spawn('npm', ['run', 'build-frontend'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([ './src/*' ], function (done) {
  var p = child.spawn('npm', ['run', 'build-backend'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([
  './conversations/stylesheets'
], function (done) {
  var p = child.spawn('npm', ['run', 'build-css'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([ './_locales/*.xml' ], function (done) {
  var p = child.spawn('npm', ['run', 'build-translations'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})
