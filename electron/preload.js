import { contextBridge, ipcRenderer } from 'electron'

// Expõe uma API segura e mínima para o renderer (o app React) usar.
// O renderer nunca tem acesso direto ao Node/Electron: tudo passa por aqui.
contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title, body) => {
    ipcRenderer.send('notify', title, body)
  },
})
