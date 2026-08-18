import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// Configuração do Vite: builda o app React normalmente e, além disso,
// builda os arquivos electron/main.ts e electron/preload.ts e sobe o
// Electron automaticamente durante o `npm run dev`.
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
      // Habilita `window.electronAPI` com tipos/uso de Node no processo de preload
      renderer: {},
    }),
  ],
})
