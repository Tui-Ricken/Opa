import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import path from 'node:path'

// Em dev, o Vite expõe a URL do servidor de desenvolvimento nessa variável
// de ambiente (injetada pelo vite-plugin-electron). Em produção, carregamos
// o index.html já buildado.
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Recebe o pedido de notificação vindo do renderer (via preload/contextBridge)
// e dispara uma notificação nativa do sistema operacional.
ipcMain.on('notify', (_event, title, body) => {
  new Notification({ title, body }).show()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
