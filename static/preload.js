// this is not a module

// make sure to also update src/renderer/global.d.ts
// when making changes to this file!
// @ts-check
;(() => {
  const electron = require('electron')

  //@ts-ignore
  window.electron_functions = {
    ipcRenderer: electron.ipcRenderer,
    app_getPath: p => electron.ipcRenderer.sendSync('app-get-path', p),
  }

  console.log({ global })
})()
