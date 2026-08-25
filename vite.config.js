import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

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
