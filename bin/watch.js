var watch = require('glob-watcher')
var child = require('child_process')

watch([
  './src/',
  './_locales/*.json',
  './static',
  './conversations/build',
  '!./es5'
], function (done) {
  var p = child.spawn('npm', ['run', 'build-es5'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})

watch([
  './conversations',
  '!./conversations/build'
], function (done) {
  var p = child.spawn('npm', ['run', 'build-conversations'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})
