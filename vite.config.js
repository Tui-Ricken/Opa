import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// Terminais que rodam dentro de apps baseados em Electron (VS Code, por
// exemplo) costumam herdar ELECTRON_RUN_AS_NODE=1. Isso faz o processo do
// Electron subir como Node puro em vez de Electron de verdade, e módulos
// como `ipcMain`/`BrowserWindow` ficam undefined — o app quebra ao abrir.
// Removendo a variável aqui, antes do plugin subir o Electron, evitamos
// que esse "vazamento" do terminal derrube o app.
delete process.env.ELECTRON_RUN_AS_NODE

// Configuração do Vite: builda o app React normalmente e, além disso,
// builda os arquivos electron/main.js e electron/preload.js e sobe o
// Electron automaticamente durante o `npm run dev`.
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.js',
      },
      preload: {
        input: 'electron/preload.js',
      },
      // Habilita `window.electronAPI` com tipos/uso de Node no processo de preload
      renderer: {},
    }),
  ],
})
