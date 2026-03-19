import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-react-components/vite'
import { defineConfig } from 'vite'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))
const isAnalyze = process.env.ANALYZE === 'true'

const isProduction = process.env.NODE_ENV === 'production'
const isCapacitor = process.env.CAPACITOR === 'true'

export default defineConfig({
  base: isCapacitor ? '/' : isProduction ? '/fit-quest-v2/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/@ionic/')) {
              return 'vendor-ionic'
            }

            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
              return 'vendor-react'
            }

            if (id.includes('/@radix-ui/')) {
              return 'vendor-radix'
            }

            return 'vendor-misc'
          }

          if (id.includes('/src/app/pages/experience/')) {
            return 'feature-landing'
          }

          if (id.includes('/src/features/student/nutrition/')) {
            return 'feature-nutrition'
          }

          if (id.includes('/src/features/student/workouts/')) {
            return 'feature-workouts'
          }
        },
      },
    },
  },
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
    isAnalyze
      ? visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        })
      : null,
  ],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
})
