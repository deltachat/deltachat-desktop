// this is not a module


(() => {
    const electron = require('electron')

    window.electron_functions = {
        ipcRenderer: electron.ipcRenderer,
        remote: electron.remote,
        shell: electron.shell,
        clipboard: electron.clipboard
    }

    console.log({ global })
})()
