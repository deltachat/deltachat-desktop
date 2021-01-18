// this is not a module

// make sure to also update src/renderer/global.d.ts
// when making changes to this file!
// @ts-check
(() => {
  const electron = require('electron')
  const { basename, join } = require('path')

  console.log(electron.app, electron.remote,electron)

  //@ts-ignore
  window.electron_functions = {
    ipcRenderer: electron.ipcRenderer,
    openExternal: electron.shell.openExternal,
    openPath: electron.shell.openPath,
    app_getPath: (p) => electron.ipcRenderer.sendSync('app-get-path', p),
    read_clipboard_text: electron.clipboard.readText,
    write_clipboard_text: electron.clipboard.writeText,
  }

  //@ts-ignore
  window.preload_functions = {
    downloadFile: (file) => {//TODO
      const defaultPath = join(electron.remote.app.getPath('downloads'), basename(file))
      electron.remote.dialog.showSaveDialog(
        electron.remote.getCurrentWindow(),{
        defaultPath
      }, (filename) => {
        if (filename) electron.ipcRenderer.send('saveFile', file, filename)
      })
    }
  }

  console.log({ global })
})()
