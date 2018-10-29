var watch = require('glob-watcher')
var child = require('child_process')

watch([
  './src',
  './_locales/*.json',
  './static',
  '!./es5'
], function (done) {
  var p = child.spawn('npm', ['run', 'build'])
  p.stdout.pipe(process.stdout)
  p.stderr.pipe(process.stderr)
  p.on('close', done)
})
