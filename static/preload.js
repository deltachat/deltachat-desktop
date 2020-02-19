// this is not a module


(() => {
    const electron = require('electron')
    const { basename, join } = require('path')

    window.electron_functions = {
        ipcRenderer: electron.ipcRenderer,
        remote: electron.remote,
        shell: electron.shell,
        clipboard: electron.clipboard
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
