// this is not a module

// make sure to also update src/renderer/global.d.ts
// when making changes to this file!

(() => {
    const electron = require('electron')
    const { basename, join } = require('path')

    window.electron_functions = {
        ipcRenderer: electron.ipcRenderer,
        remote: electron.remote,
        openExternal: electron.shell.openExternal,
        openItem: electron.shell.openItem,
    }

    window.native_dependency = {
        EventEmitter: require('events').EventEmitter
    }

    window.preload_functions = {
        downloadFile: (file) => {
            const defaultPath = join(electron.remote.app.getPath('downloads'), basename(file))
            electron.remote.dialog.showSaveDialog({
                defaultPath
            }, (filename) => {
                if (filename) electron.ipcRenderer.send('saveFile', file, filename)
            })
        }
    }

    console.log({ global })
})()
