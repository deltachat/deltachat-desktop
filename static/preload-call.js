// this is not a module

// make sure to also update src/renderer/global.d.ts
// when making changes to this file!

(() => {
  const electron = require('electron')

  window.x_extended = {
    close: ()=> {
      electron.ipcRenderer.send('call-close')
    }
  }
  console.log({ global })
})()
