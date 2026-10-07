import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' để mở được dist/ ở bất kỳ thư mục nào; router dùng hash nên không cần cấu hình máy chủ
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5180, open: false },
})
