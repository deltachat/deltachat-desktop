const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('htmlview', {
  getInfo: () => ipcRenderer.invoke('html_email:get_info'),
  setContentBounds: bounds =>
    ipcRenderer.invoke('html-view:resize-content', bounds),
  openMoreMenu: ({ x, y }) => {
    ipcRenderer.invoke('html-view:more-menu', { x, y })
  },
})

async function updateTheme() {
  window.document.getElementById('theme-vars').innerText =
    await ipcRenderer.invoke('get-theme')
}
ipcRenderer.on('theme-update', updateTheme)
window.onload = updateTheme.bind(this)
