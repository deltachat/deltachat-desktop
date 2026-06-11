const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('htmlview', {
  getInfo: () => ipcRenderer.invoke('html_email:get_info'),
  getMenuLabels: () => ipcRenderer.invoke('html_email:get_menu_labels'),
  setContentBounds: bounds =>
    ipcRenderer.invoke('html-view:resize-content', bounds),
  triggerLoadRemoteContent: () =>
    ipcRenderer.invoke('html-view:load-remote-content'),
})

async function updateTheme() {
  window.document.getElementById('theme-vars').innerText =
    await ipcRenderer.invoke('get-theme')
}
ipcRenderer.on('theme-update', updateTheme)
window.onload = updateTheme.bind(this)
