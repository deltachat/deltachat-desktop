// this is not a module
// this file is used to provide access to specific electron apis to the call window

;(() => {
  const electron = require('electron')

  window.x_extended = {
    close: () => {
      electron.ipcRenderer.send('call-close')
    },
    desktopCapturer: electron.desktopCapturer,
  }
  console.log({ global })
})()
