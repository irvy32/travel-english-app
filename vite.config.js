import { defineConfig } from 'vite'
import vue from '@vue/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/travel-english-app/', // 加上這一行，必須與您的儲存庫名稱一致
})