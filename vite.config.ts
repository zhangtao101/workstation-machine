import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'




export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    })
  ],
  server: {
    proxy: {
      '/ht': {
        // target: 'http://192.168.0.102:8050',
        // target: 'http://192.168.31.58:8050',
        target: 'https://v507z46671.yicp.fun',
        // target: 'http://271z43k730.zicp.vip',
        // target: 'http://192.168.7.131:8050',
        // target: 'http://192.168.6.107:8050',
        // target: 'http://192.168.199.205:8050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ht/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
