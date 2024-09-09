// this is not a module

// make sure to also update src/renderer/global.d.ts
// when making changes to this file!
// @ts-check
;(() => {
  const electron = require('electron')

  let is_first_time = true
  //@ts-ignore
  window.get_electron_functions = () => {
    // this function is only usable one time, as it shall only be used by the runtime
    if (!is_first_time) {
      console.warn(
        'tried to get get_electron_functions multiple times, this is not expected'
      )
      throw new Error(
        'get_electron_functions was accessed previously, it can only be accessed one time'
      )
    }
    is_first_time = false
    //@ts-ignore
    delete window.get_electron_functions
    return {
      ipcRenderer: electron.ipcRenderer,
      app_getPath: p => electron.ipcRenderer.sendSync('app-get-path', p),
      getPathForFile: electron.webUtils.getPathForFile,
    }
  }

  console.log({ global })
})()
