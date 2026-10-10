// Phân trang danh sách dữ liệu: chuyển trang gọn một hàng căn trái theo mẫu iPOS Inventory (T42)
import { useLayoutEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Select } from './Dropdown'
import { money } from './format'
import { heSoZoom } from './zoom'

export function PhanTrang({ tong, tongCong, trang, coTrang, onTrang, onCoTrang }: {
  tong: number
  tongCong?: Record<string, number>   // tổng mọi trang theo mã cột, số canh thẳng cột của bảng ngay trên (T48)
  trang: number
  coTrang: number
  onTrang: (trang: number) => void
  onCoTrang: (coTrang: number) => void
}) {
  const soTrang = Math.max(1, Math.ceil(tong / coTrang))

  // Danh sách trang rút gọn bằng dấu ba chấm "…"
  const taoDanhSachTrang = () => {
    if (soTrang <= 7) {
      return Array.from({ length: soTrang }, (_, i) => i + 1)
    }
    const pages: (number | string)[] = [1]
    if (trang <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i)
      pages.push('…', soTrang)
    } else if (trang >= soTrang - 3) {
      pages.push('…')
      for (let i = soTrang - 4; i <= soTrang; i++) pages.push(i)
    } else {
      pages.push('…', trang - 1, trang, trang + 1, '…', soTrang)
    }
    return pages
  }

  const danhSach = taoDanhSachTrang()

  // Đo mép phải từng cột trong bảng ngay trên để đặt số Tổng cộng thẳng cột; đo lại khi cuộn ngang, đổi cỡ, kéo giãn cột
  const bar = useRef<HTMLDivElement>(null)
  const [phai, setPhai] = useState<Record<string, number>>({})
  const khoa = tongCong ? Object.keys(tongCong).join() : ''
  useLayoutEffect(() => {
    const el = bar.current
    const wrap = el?.previousElementSibling as HTMLElement | null
    if (!el || !wrap || !khoa) return
    const tinh = () => {
      const z = heSoZoom()
      const br = el.getBoundingClientRect()
      const moi: Record<string, number> = {}
      // Số đi theo cột khi cuộn ngang: cột khuất hẳn (trái hoặc phải) thì không hiện số; cột khuất một phần bên phải thì số bám mép phải.
      // Bỏ số nào chồng lên số đã đặt ở bên phải nó
      const dat: number[] = []
      for (const k of khoa.split(',').reverse()) {
        const th = wrap.querySelector<HTMLElement>(`thead th[data-k="${k}"]`)
        if (!th) continue
        const r = th.getBoundingClientRect()
        if (r.right <= br.left || r.left >= br.right - 24) continue
        const x = Math.max(12, (br.right - r.right) / z + (parseFloat(getComputedStyle(th).paddingRight) || 0))
        if (dat.some(d => Math.abs(d - x) < 110)) continue
        dat.push(x)
        moi[k] = x
      }
      setPhai(x => JSON.stringify(x) === JSON.stringify(moi) ? x : moi)
    }
    tinh()
    wrap.addEventListener('scroll', tinh, { passive: true })
    const ro = new ResizeObserver(tinh)
    ro.observe(wrap)
    const bang = wrap.querySelector('table')
    if (bang) ro.observe(bang)
    return () => { wrap.removeEventListener('scroll', tinh); ro.disconnect() }
  }, [khoa])
  // Nhãn "Tổng cộng" đứng trước số của cột nằm xa trái nhất
  const dsSo = Object.entries(tongCong ?? {}).filter(([k]) => phai[k] !== undefined).sort((a, b) => phai[b[0]] - phai[a[0]])

  return (
    <div className="pt-bar" ref={bar}>
      <div className="pt-tong">Tổng <b>{tong}</b></div>
      <Select
        className="pt-sel"
        value={String(coTrang)}
        onChange={e => onCoTrang(Number(e.target.value))}
        aria-label="Số dòng mỗi trang"
      >
        <option value="20">20/trang</option>
        <option value="50">50/trang</option>
        <option value="100">100/trang</option>
      </Select>
      <div className="pt-nav">
        <button
          type="button"
          className="icon-btn sm pt-nav-btn"
          disabled={trang <= 1}
          onClick={() => onTrang(trang - 1)}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <Icon n="chevl" className="ic sm" />
        </button>
        {danhSach.map((p, idx) => (
          typeof p === 'number' ? (
            <button
              key={`page-${p}`}
              type="button"
              className={`pt-num${p === trang ? ' on' : ''}`}
              onClick={() => onTrang(p)}
              aria-current={p === trang ? 'page' : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="pt-cham" aria-hidden>…</span>
          )
        ))}
        <button
          type="button"
          className="icon-btn sm pt-nav-btn"
          disabled={trang >= soTrang}
          onClick={() => onTrang(trang + 1)}
          title="Trang sau"
          aria-label="Trang sau"
        >
          <Icon n="chevr" className="ic sm" />
        </button>
      </div>
      {dsSo.map(([k, v], i) => (
        <span key={k} className="pt-tc" style={{ right: phai[k] }}>
          {i === 0 && <span className="pt-tc-nhan">Tổng cộng</span>}<b>{money(v)}</b>
        </span>
      ))}
    </div>
  )
}
