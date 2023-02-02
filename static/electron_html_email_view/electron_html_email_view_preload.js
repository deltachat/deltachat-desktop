const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('htmlview', {
  getInfo: () => ipcRenderer.invoke('html_email:get_info'),
  setContentBounds: bounds =>
    ipcRenderer.invoke('html-view:resize-content', bounds),
  changeAllowNetwork: allow_network =>
    ipcRenderer.invoke('html-view:change-network', allow_network),
})
