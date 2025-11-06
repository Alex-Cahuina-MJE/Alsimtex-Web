import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    esbuild: {
        target: 'es2020',
    },
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            css: {
                additionalData: `@import "./src/assets/css/variables.css";`
            }
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src',
                import.meta.url))
        }
    },
    build: {
        target: 'es2020',
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'esbuild'
    },
    server: {
        host: '0.0.0.0', // Permite conexiones desde cualquier IP
        port: 5174, // Puerto específico
        open: false // No abrir automáticamente el navegador
    }
})