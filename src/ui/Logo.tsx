// Logo Accounting Powered by iPOS.vn, xuất từ D:\trum\iPOS-ACC-Present\logo acc.png bằng tools/xuat_logo_acc.py
import type { CSSProperties } from 'react'
import mau from '../assets/acc-logo.webp'
import trang from '../assets/acc-logo-trang.webp'
import dau from '../assets/acc-dau.webp'

// Logo chữ. nen="toi" dùng bản chữ trắng cho sidebar, nền navy
export function Logo({ cao = 36, nen = 'sang' }: { cao?: number; nen?: 'sang' | 'toi' }) {
  return <img className="logo logo-chu" src={nen === 'toi' ? trang : mau} height={cao} width={Math.round(cao * 522 / 120)} alt="Accounting Powered by iPOS.vn" />
}

// Dấu chữ A, dùng khi chỗ hẹp
export function DauLogo({ size = 32, style }: { size?: number; style?: CSSProperties }) {
  return <img className="logo logo-dau" src={dau} width={size} height={size} alt="Accounting" style={style} />
}
