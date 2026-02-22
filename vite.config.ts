import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-react-components/vite'
import { defineConfig } from 'vite'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['react'],
      dts: fileURLToPath(new URL('./src/auto-imports.d.ts', import.meta.url)),
      include: [/\.[jt]sx$/],
    }),
    Components({
      rootDir: srcPath,
      dts: {
        rootPath: srcPath,
        filename: 'components',
      },
      include: [/\.[jt]sx$/],
      local: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
})
