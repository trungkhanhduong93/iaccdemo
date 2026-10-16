// Ô gõ số kiểu Việt Nam (T284): đang gõ đã có chấm ngăn nghìn, phẩy thập phân; mỗi lần gõ báo số mới ngay để tổng tiền đổi theo.
// Rời ô thì hiện theo hàm hien (vd money làm tròn tới đồng). Con trỏ giữ đúng chỗ sau khi chèn, bỏ dấu chấm.
import { useEffect, useRef, useState } from 'react'

/** Chuỗi đang gõ: chỉ giữ chữ số và một dấu phẩy thập phân, phần nguyên chèn chấm ngăn nghìn */
export function goSoVN(s: string, thapPhan = true): string {
  const sach = s.replace(/[^\d,]/g, '')
  const [nguyen, ...sau] = sach.split(',')
  const n = nguyen.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return thapPhan && sau.length ? `${n || '0'},${sau.join('')}` : n
}
/** Đọc chuỗi kiểu Việt Nam ra số: bỏ chấm ngăn nghìn, phẩy thành chấm thập phân */
export const docSoVN = (s: string) => Number(s.replace(/\./g, '').replace(',', '.')) || 0
/** Số -> chuỗi để bắt đầu gõ (không làm tròn, giữ phần thập phân) */
const raChuoi = (v: number) => v ? goSoVN(String(v).replace('.', ',')) : ''

export function OSoGo({ val, onChange, hien, thapPhan = true, className = 'inp sm num', placeholder = '0', disabled }: {
  val: number
  onChange?: (v: number) => void
  hien: (v: number) => string          // cách hiện khi không gõ
  thapPhan?: boolean                    // cho gõ phần thập phân (số lượng); tiền đồng thì tắt cũng được
  className?: string
  placeholder?: string
  disabled?: boolean
}) {
  const [focus, setFocus] = useState(false)
  const [str, setStr] = useState(raChuoi(val))
  const o = useRef<HTMLInputElement>(null)
  const troSau = useRef<number | null>(null)   // số chữ số, dấu phẩy đứng trước con trỏ, để đặt lại con trỏ sau khi chèn chấm
  useEffect(() => { if (!focus) setStr(raChuoi(val)) }, [val, focus])
  useEffect(() => {
    const el = o.current, k = troSau.current
    if (!el || k === null || !focus) return
    let i = 0, dem = 0
    while (i < str.length && dem < k) { if (/[\d,]/.test(str[i])) dem++; i++ }
    el.setSelectionRange(i, i)
    troSau.current = null
  }, [str, focus])
  return (
    <input ref={o} type="text" className={className} inputMode="decimal" placeholder={placeholder} disabled={disabled}
      value={focus ? str : hien(val)}
      onFocus={() => { setFocus(true); setStr(raChuoi(val)) }}
      onChange={e => {
        const t = e.target.value, c = e.target.selectionStart ?? t.length
        troSau.current = t.slice(0, c).replace(/[^\d,]/g, '').length
        const moi = goSoVN(t, thapPhan)
        setStr(moi)
        onChange?.(docSoVN(moi))
      }}
      onBlur={() => setFocus(false)} />
  )
}
