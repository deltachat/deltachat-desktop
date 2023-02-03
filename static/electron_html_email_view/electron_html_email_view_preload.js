const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('htmlview', {
  getInfo: () => ipcRenderer.invoke('html_email:get_info'),
  setContentBounds: bounds =>
    ipcRenderer.invoke('html-view:resize-content', bounds),
  changeAllowNetwork: allow_network =>
    ipcRenderer.invoke('html-view:change-network', allow_network),
})

async function updateTheme() {
  window.document.getElementById(
    'theme-vars'
  ).innerText = await ipcRenderer.invoke('get-theme')
}
ipcRenderer.on('theme-update', updateTheme)
window.onload = updateTheme.bind(this)
