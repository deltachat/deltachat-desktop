const eval = (window.eval = function() {
  throw new Error(`Sorry, this app does not support window.eval().`)
})

try {
  global.eval = eval
} catch (error) {}
