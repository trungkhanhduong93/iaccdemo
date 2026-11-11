// Ô gõ số theo kiểu chữ số của đơn vị (T284, T710): đang gõ đã có dấu ngăn nghìn, dấu thập phân (Việt Nam 1.234,5; Quốc tế 1,234.5);
// mỗi lần gõ báo số mới ngay để tổng tiền đổi theo. Rời ô thì hiện theo hàm hien (vd money làm tròn tới đồng).
// Con trỏ giữ đúng chỗ sau khi chèn, bỏ dấu ngăn nghìn.
import { useEffect, useRef, useState } from 'react'
import { dauNgan, dauThap } from './format'

/** Chuỗi đang gõ: chỉ giữ chữ số và một dấu thập phân, phần nguyên chèn dấu ngăn nghìn */
export function goSoVN(s: string, thapPhan = true): string {
  const thap = dauThap()
  const sach = s.split('').filter(c => /\d/.test(c) || c === thap).join('')
  const [nguyen, ...sau] = sach.split(thap)
  const n = nguyen.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, dauNgan())
  return thapPhan && sau.length ? `${n || '0'}${thap}${sau.join('')}` : n
}
/** Đọc chuỗi đang gõ ra số: bỏ dấu ngăn nghìn, dấu thập phân thành chấm */
export const docSoVN = (s: string) => Number(s.split(dauNgan()).join('').replace(dauThap(), '.')) || 0
/** Số -> chuỗi để bắt đầu gõ (không làm tròn, giữ phần thập phân) */
const raChuoi = (v: number, am = false) => v ? (am && v < 0 ? '-' : '') + goSoVN(String(Math.abs(v)).replace('.', dauThap())) : ''

export function OSoGo({ val, onChange, hien, thapPhan = true, className = 'inp sm num', placeholder = '0', disabled, max, am = false }: {
  val: number
  onChange?: (v: number) => void
  hien: (v: number) => string          // cách hiện khi không gõ
  thapPhan?: boolean                    // cho gõ phần thập phân (số lượng); tiền đồng thì tắt cũng được
  className?: string
  placeholder?: string
  disabled?: boolean
  max?: number                          // gõ quá số này thì bỏ phím vừa gõ, vd % chiết khấu tối đa 100 (T492)
  am?: boolean                          // cho gõ dấu trừ đứng đầu, vd hoá đơn điều chỉnh giảm (T787)
}) {
  const [focus, setFocus] = useState(false)
  const [str, setStr] = useState(raChuoi(val, am))
  const o = useRef<HTMLInputElement>(null)
  const troSau = useRef<number | null>(null)   // số chữ số, dấu thập phân đứng trước con trỏ, để đặt lại con trỏ sau khi chèn dấu ngăn nghìn
  useEffect(() => { if (!focus) setStr(raChuoi(val, am)) }, [val, focus, am])
  useEffect(() => {
    const el = o.current, k = troSau.current
    if (!el || k === null || !focus) return
    let i = 0, dem = 0
    while (i < str.length && dem < k) { if (/\d/.test(str[i]) || str[i] === dauThap() || str[i] === '-') dem++; i++ }
    el.setSelectionRange(i, i)
    troSau.current = null
  }, [str, focus])
  return (
    <input ref={o} type="text" className={className} inputMode="decimal" placeholder={placeholder} disabled={disabled}
      value={focus ? str : hien(val)}
      onFocus={() => { setFocus(true); setStr(raChuoi(val, am)) }}
      onChange={e => {
        const t = e.target.value, c = e.target.selectionStart ?? t.length
        if (max !== undefined && docSoVN(goSoVN(t, thapPhan)) > max) return
        // Ô cho số âm (T787): có dấu trừ ở bất kỳ đâu là số âm, dấu trừ luôn đưa lên đầu; con trỏ tính cả dấu trừ để gõ tiếp đứng sau nó
        const tru = am && t.includes('-')
        troSau.current = t.slice(0, c).split('').filter(x => /\d/.test(x) || x === dauThap()).length + (tru && t.slice(0, c).includes('-') ? 1 : 0)
        const moi = (tru ? '-' : '') + goSoVN(t, thapPhan)
        setStr(moi)
        onChange?.(docSoVN(moi))
      }}
      onBlur={() => setFocus(false)} />
  )
}
