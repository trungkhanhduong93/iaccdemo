import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' để mở được dist/ ở bất kỳ thư mục nào; router dùng hash nên không cần cấu hình máy chủ
export default defineConfig({
  base: './',
  plugins: [react()],
  // strictPort: cổng 5180 đang bận thì báo lỗi, không lặng lẽ sang 5181 (script kiểm sẽ thử nhầm bản cũ)
  server: { port: 5180, strictPort: true, open: false },
})
