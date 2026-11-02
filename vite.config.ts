import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

function layPhienBan(): string {
  if (process.env.GITHUB_REF_TYPE === 'tag') {
    return `Phiên bản ${process.env.GITHUB_REF_NAME ?? ''}`
  }
  if (process.env.GITHUB_SHA) {
    const sha = process.env.GITHUB_SHA.slice(0, 7)
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
    })
    const ngay = formatter.format(new Date())
    return `Bản thử ${ngay} · ${sha}`
  }
  return 'Bản máy dev'
}

function layThayDoiMoi(): { ngay: string; dong: string[] }[] {
  const changelogUrl = new URL('./CHANGELOG.md', import.meta.url)
  const content = fs.readFileSync(changelogUrl, 'utf-8')
  const lines = content.split(/\r?\n/)
  const ketQua: { ngay: string; dong: string[] }[] = []
  let hienTai: { ngay: string; dong: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (ketQua.length === 3) break
      const ngay = line.slice(3).trim()
      hienTai = { ngay, dong: [] }
      ketQua.push(hienTai)
    } else if (hienTai && line.startsWith('- ')) {
      hienTai.dong.push(line.slice(2).trim())
    }
  }
  return ketQua
}

// base './' để mở được dist/ ở bất kỳ thư mục nào; router dùng hash nên không cần cấu hình máy chủ
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __PHIEN_BAN__: JSON.stringify(layPhienBan()),
    __THAY_DOI_MOI__: JSON.stringify(layThayDoiMoi()),
  },
  // strictPort: cổng 5180 đang bận thì báo lỗi, không lặng lẽ sang 5181 (script kiểm sẽ thử nhầm bản cũ)
  server: { port: 5180, strictPort: true, open: false },
})
