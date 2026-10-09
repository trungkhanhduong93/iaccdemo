// Ô nhập số cho khung thiết kế: gõ tự do, chỉ nhận số trong khoảng; rời ô thì trả về số đang dùng. Dấu phẩy thập phân kiểu Việt
import { useEffect, useState } from 'react'

const hien = (v: number | undefined) => v === undefined ? '' : String(v).replace('.', ',')

export function OSo({ value, onChange, min, max, trong, className = 'inp', placeholder, 'aria-label': ariaLabel }: {
  value: number | undefined; onChange: (v: number | undefined) => void; min: number; max: number
  trong?: boolean           // cho để trống (onChange nhận undefined), vd độ rộng nhãn tự động
  className?: string; placeholder?: string; 'aria-label'?: string
}) {
  const [chu, setChu] = useState(hien(value))
  const [dangGo, setDangGo] = useState(false)
  useEffect(() => { if (!dangGo) setChu(hien(value)) }, [value, dangGo])
  const go = (t: string) => {
    setChu(t)
    if (!t.trim()) { if (trong) onChange(undefined); return }
    const v = Number(t.replace(',', '.'))
    if (Number.isFinite(v) && v >= min && v <= max) onChange(v)
  }
  return (
    <input className={className} inputMode="decimal" value={chu} placeholder={placeholder} aria-label={ariaLabel}
      onFocus={() => setDangGo(true)} onBlur={() => { setDangGo(false); setChu(hien(value)) }}
      onChange={e => go(e.target.value)} />
  )
}
