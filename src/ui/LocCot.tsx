// Hàng lọc từng cột dưới tiêu đề bảng theo mẫu iPOS Inventory (T42):
// mỗi ô chỉ có phễu nhỏ căn phải (cột ngày có thêm ô dd/mm/yyyy + lịch). Bấm phễu mở khung lọc điều kiện.
import { useState, useRef, type ReactNode } from 'react'
import type { Col } from '../modules/types'
import { Popover, Select } from './Dropdown'
import { Icon } from './Icon'
import { IconFigmaSearch, IconFigmaCheck } from './IconFigma'
import { fold } from './format'
import { LichDon } from './ChonNgay'

/** chu: chữ; so: số tiền, số lượng; ngay: dd/mm/yyyy; chon: phân loại giá trị */
export type KieuLoc = 'chu' | 'so' | 'ngay' | 'chon'

/** op: điều kiện; v: giá trị gõ; v2: giá trị thứ hai (trong khoảng); ds: các giá trị tick; opText/vText: bộ lọc văn bản cho cột phân loại */
export interface GiaTriLoc {
  op: string
  v: string
  v2?: string
  ds?: string[]
  opText?: string
  vText?: string
}

export interface LocCot {
  gt: Record<string, GiaTriLoc>
  dat: (k: string, g: GiaTriLoc) => void
  bo?: Set<string>
  kieu: (c: Col) => KieuLoc
  luaChon?: Record<string, string[]>
  layLuaChon?: (k: string) => string[]   // giá trị để tích của cột kiểu chọn, chỉ tính khi cần (mở ô lọc, đang lọc) (T466)
}

/** Giá trị khác nhau của một cột để tích ở bộ lọc kiểu chọn, xếp theo chữ; ô trống là chuỗi rỗng, hiện "(Trống)" (T466) */
export function dsGiaTri<T>(rows: T[], lay: (r: T) => string): string[] {
  return [...new Set(rows.map(r => lay(r) ?? ''))].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b, 'vi', { numeric: true })))
}

/** Danh sách điều kiện cột chữ */
export const PHEP_CHU: [string, string][] = [
  ['chua', 'Chứa'],
  ['khong', 'Không chứa'],
  ['bang', 'Bằng'],
  ['khongbang', 'Không bằng'],
  ['dau', 'Bắt đầu với'],
  ['cuoi', 'Kết thúc với'],
  ['trong', 'Trống'],
  ['khongtrong', 'Không trống'],
]

/** Danh sách điều kiện cột số */
export const PHEP_SO: [string, string][] = [
  ['=', '='],
  ['!=', '≠'],
  ['>', '>'],
  ['>=', '≥'],
  ['<', '<'],
  ['<=', '≤'],
  ['khoang', 'Trong khoảng'],
  ['trong', 'Trống'],
]

/** Danh sách điều kiện cột ngày */
export const PHEP_NGAY: [string, string][] = [
  ['=', 'Đúng ngày'],
  ['<', 'Trước'],
  ['>', 'Sau'],
  ['khoang', 'Trong khoảng'],
]

/** Kiểm tra cột có đang áp dụng điều kiện lọc không */
export function dangLoc(g?: GiaTriLoc, tongChon?: number): boolean {
  if (!g) return false
  if (g.op === 'trong' || g.op === 'khongtrong') return true
  if (g.v && g.v.trim() !== '') return true
  if (g.v2 && g.v2.trim() !== '') return true
  if (g.vText && g.vText.trim() !== '') return true
  if (g.opText === 'trong' || g.opText === 'khongtrong') return true
  if (g.ds !== undefined) {
    if (tongChon !== undefined && g.ds.length < tongChon) return true
    if (tongChon === undefined && g.ds.length > 0) return true
  }
  return false
}

function parseSo(v: string | number | undefined): number | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'number') return isNaN(v) ? null : v
  const cleaned = String(v).replace(/\./g, '').replace(',', '.')
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

function parseNgay(v: string | Date | undefined): Date | null {
  if (!v) return null
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v
  const m = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    const d = new Date(+m[3], +m[2] - 1, +m[1])
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function soSanhNgay(d1: Date, d2: Date): number {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  return t1 === t2 ? 0 : t1 < t2 ? -1 : 1
}

function khopChu(op: string, v: string, chu: string): boolean {
  if (op === 'trong') return !chu || chu.trim() === '' || chu === '—'
  if (op === 'khongtrong') return Boolean(chu && chu.trim() !== '' && chu !== '—')
  const val = v.trim()
  if (!val) return true
  const a = fold(chu), b = fold(val)
  if (op === 'khong') return !a.includes(b)
  if (op === 'bang') return a === b
  if (op === 'khongbang') return a !== b
  if (op === 'dau') return a.startsWith(b)
  if (op === 'cuoi') return a.endsWith(b)
  return a.includes(b) // op === 'chua' hoặc mặc định
}

/** Dòng có khớp điều kiện lọc của cột không */
export function khopLoc(kieu: KieuLoc, g: GiaTriLoc, chu: string, so?: number, ngay?: Date): boolean {
  if (kieu === 'chon') {
    // 1. Kiểm tra bộ lọc văn bản nếu có
    if (g.vText?.trim() || g.opText === 'trong' || g.opText === 'khongtrong') {
      if (!khopChu(g.opText || 'chua', g.vText || '', chu)) return false
    }
    // 2. Kiểm tra danh sách tick
    if (g.ds !== undefined) {
      return g.ds.includes(chu)
    }
    return true
  }

  if (kieu === 'chu') {
    return khopChu(g.op || 'chua', g.v, chu)
  }

  if (kieu === 'so') {
    if (g.op === 'trong') {
      return so === undefined || isNaN(so) || !chu.trim() || chu === '—'
    }
    const n = parseSo(g.v)
    const val = so !== undefined ? so : parseSo(chu)
    if (g.op === 'khoang') {
      const n2 = parseSo(g.v2)
      if (val === null) return false
      if (n !== null && val < n) return false
      if (n2 !== null && val > n2) return false
      return true
    }
    if (n === null) return true
    if (val === null) return false
    if (g.op === '=') return val === n
    if (g.op === '!=') return val !== n
    if (g.op === '>') return val > n
    if (g.op === '>=') return val >= n
    if (g.op === '<') return val < n
    if (g.op === '<=') return val <= n
    return val === n
  }

  if (kieu === 'ngay') {
    const dVal = ngay ?? parseNgay(chu)
    const d1 = parseNgay(g.v)
    if (g.op === 'khoang') {
      const d2 = parseNgay(g.v2)
      if (!dVal) return false
      if (d1 && soSanhNgay(dVal, d1) < 0) return false
      if (d2 && soSanhNgay(dVal, d2) > 0) return false
      return true
    }
    if (!g.v.trim()) return true
    if (!d1 || !dVal) {
      return fold(chu).includes(fold(g.v.trim()))
    }
    const cmp = soSanhNgay(dVal, d1)
    if (g.op === '=') return cmp === 0
    if (g.op === '<') return cmp < 0
    if (g.op === '>') return cmp > 0
    if (g.op === '<=') return cmp <= 0
    if (g.op === '>=') return cmp >= 0
    return cmp === 0
  }

  return true
}

/** Ô lọc của một cột trong hàng lọc */
export function OLoc({ c, loc }: { c: Col; loc: LocCot }) {
  const kieu = loc.kieu(c)
  const g = loc.gt[c.k] ?? { op: kieu === 'chu' ? 'chua' : kieu === 'so' ? '=' : kieu === 'ngay' ? '=' : '', v: '' }
  const [mo, setMo] = useState(false)
  const tatCaChon = loc.luaChon?.[c.k] ?? (kieu === 'chon' && (mo || g.ds !== undefined) ? loc.layLuaChon?.(c.k) : undefined) ?? []
  const dang = dangLoc(g, kieu === 'chon' ? tatCaChon.length : undefined)
  const [moLich, setMoLich] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)
  const dong = () => setMo(false)

  // Cột ngày: ô nhập nhỏ + biểu tượng lịch + phễu
  if (kieu === 'ngay') {
    return (
      <div ref={cellRef} className="loc-cell loc-cell-ngay" onClick={e => e.stopPropagation()}>
        <input
          className="loc-o-ngay"
          placeholder="dd/mm/yy"
          value={g.v}
          aria-label={`Lọc ngày cột ${c.t}`}
          title="Bấm để chọn ngày hoặc nhập dd/mm/yyyy"
          onChange={e => loc.dat(c.k, { ...g, v: e.target.value, op: g.op || '=' })}
          onClick={() => setMoLich(true)}
        />
        <button
          type="button"
          className={`loc-btn-lich${moLich ? ' on' : ''}`}
          title="Chọn ngày"
          aria-label="Chọn ngày"
          onClick={() => setMoLich(o => !o)}
        >
          <Icon n="calendar" className="ic sm" />
        </button>
        <button
          ref={btnRef}
          type="button"
          className={`loc-pheu-btn${dang ? ' on' : ''}`}
          title={`Lọc cột ${c.t}`}
          aria-label={`Lọc cột ${c.t}`}
          onClick={() => setMo(o => !o)}
        >
          <Icon n="filter" className="ic sm" />
          {dang && <span className="loc-pheu-dot" />}
        </button>
        <Popover
          anchor={cellRef}
          open={moLich}
          onClose={() => setMoLich(false)}
          align="start"
          width={272}
          className="dp-pop"
        >
          <LichDon
            value={g.v}
            onChange={val => loc.dat(c.k, { ...g, v: val, op: g.op || '=' })}
            onDong={() => setMoLich(false)}
          />
        </Popover>
        <Popover anchor={btnRef} open={mo} onClose={dong} align="end" width={240} className="loc-cot-pop">
          <KhungLoc c={c} kieu={kieu} g={g} loc={loc} tatCaChon={tatCaChon} onDong={dong} />
        </Popover>
      </div>
    )
  }

  if (kieu === 'chu') {
    return (
      <div className="loc-cell" onClick={e => e.stopPropagation()}>
        <input
          className="loc-o-cot"
          placeholder=""
          value={g.v}
          aria-label={`Lọc cột ${c.t}`}
          onChange={e => loc.dat(c.k, { ...g, v: e.target.value, op: g.op || 'chua' })}
        />
        <button
          ref={btnRef}
          type="button"
          className={`loc-pheu-btn${dang ? ' on' : ''}`}
          title={`Lọc cột ${c.t}`}
          aria-label={`Lọc cột ${c.t}`}
          onClick={() => setMo(o => !o)}
        >
          <Icon n="filter" className="ic sm" />
          {dang && <span className="loc-pheu-dot" />}
        </button>
        <Popover anchor={btnRef} open={mo} onClose={dong} align="end" width={240} className="loc-cot-pop">
          <KhungLoc c={c} kieu={kieu} g={g} loc={loc} tatCaChon={tatCaChon} onDong={dong} />
        </Popover>
      </div>
    )
  }

  if (kieu === 'so') {
    return (
      <div className="loc-cell" onClick={e => e.stopPropagation()}>
        <input
          className="loc-o-cot loc-o-num"
          placeholder=""
          value={g.v}
          aria-label={`Lọc số cột ${c.t}`}
          onChange={e => loc.dat(c.k, { ...g, v: e.target.value, op: g.op || '=' })}
        />
        <button
          ref={btnRef}
          type="button"
          className={`loc-pheu-btn${dang ? ' on' : ''}`}
          title={`Lọc cột ${c.t}`}
          aria-label={`Lọc cột ${c.t}`}
          onClick={() => setMo(o => !o)}
        >
          <Icon n="filter" className="ic sm" />
          {dang && <span className="loc-pheu-dot" />}
        </button>
        <Popover anchor={btnRef} open={mo} onClose={dong} align="end" width={240} className="loc-cot-pop">
          <KhungLoc c={c} kieu={kieu} g={g} loc={loc} tatCaChon={tatCaChon} onDong={dong} />
        </Popover>
      </div>
    )
  }

  // Cột phân loại (chọn)
  return (
    <div className="loc-cell" onClick={e => e.stopPropagation()}>
      <input
        className="loc-o-cot"
        placeholder=""
        value={g.vText ?? ''}
        aria-label={`Lọc phân loại cột ${c.t}`}
        onChange={e => loc.dat(c.k, { ...g, vText: e.target.value, opText: 'chua' })}
      />
      <button
        ref={btnRef}
        type="button"
        className={`loc-pheu-btn${dang ? ' on' : ''}`}
        title={`Lọc cột ${c.t}`}
        aria-label={`Lọc cột ${c.t}`}
        onClick={() => setMo(o => !o)}
      >
        <Icon n="filter" className="ic sm" />
        {dang && <span className="loc-pheu-dot" />}
      </button>
      <Popover anchor={btnRef} open={mo} onClose={dong} align="end" width={280} className="loc-cot-figma-pop">
        <KhungLocChon c={c} g={g} loc={loc} tatCaChon={tatCaChon} onDong={dong} />
      </Popover>
    </div>
  )
}

/** Khung lọc danh sách chọn theo Figma T496 (popover-loc-cot.png) */
function KhungLocChon({ c, g, loc, tatCaChon, onDong }: {
  c: Col
  g: GiaTriLoc
  loc: LocCot
  tatCaChon: string[]
  onDong: () => void
}) {
  const [timKiem, setTimKiem] = useState('')
  const [draftSelected, setDraftSelected] = useState<string[]>(() => g.ds ?? tatCaChon)

  const dsHien = tatCaChon.filter(x => fold(x).includes(fold(timKiem.trim())))
  const curSelected = draftSelected
  const soKhopChon = dsHien.filter(x => curSelected.includes(x)).length
  const tatCaDaChon = dsHien.length > 0 && soKhopChon === dsHien.length
  const motPhanDaChon = soKhopChon > 0 && soKhopChon < dsHien.length

  const toggleTatCa = () => {
    if (tatCaDaChon) {
      setDraftSelected(prev => prev.filter(x => !dsHien.includes(x)))
    } else {
      setDraftSelected(prev => [...new Set([...prev, ...dsHien])])
    }
  }

  const toggleMot = (x: string) => {
    setDraftSelected(prev =>
      prev.includes(x) ? prev.filter(y => y !== x) : [...prev, x]
    )
  }

  const handleXoaLoc = () => {
    loc.dat(c.k, { op: '', v: '', ds: undefined, opText: 'chua', vText: '' })
    setTimKiem('')
    onDong()
  }

  const handleApDung = () => {
    const moiDs = draftSelected.length === tatCaChon.length ? undefined : draftSelected
    loc.dat(c.k, { ...g, ds: moiDs })
    onDong()
  }

  const soLuong = draftSelected.length

  return (
    <div className="loc-cot-chon-wrap">
      <div className="loc-cot-tim-box">
        <IconFigmaSearch size={14} />
        <input
          value={timKiem}
          placeholder={`Tìm ${c.t.toLowerCase()}...`}
          aria-label={`Tìm ${c.t.toLowerCase()}`}
          onChange={e => setTimKiem(e.target.value)}
        />
      </div>

      <div className="loc-cot-ds">
        {dsHien.length > 0 && (
          <div
            className={`loc-cot-muc${tatCaDaChon || motPhanDaChon ? ' chon' : ''}`}
            onClick={toggleTatCa}
            role="checkbox"
            aria-checked={tatCaDaChon ? true : motPhanDaChon ? 'mixed' : false}
          >
            <div className={`loc-cot-chk${tatCaDaChon ? ' chon' : motPhanDaChon ? ' nua' : ''}`}>
              {tatCaDaChon && <IconFigmaCheck />}
              {motPhanDaChon && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 5H8" />
                </svg>
              )}
            </div>
            <span className={`loc-cot-txt${tatCaDaChon || motPhanDaChon ? ' chon' : ''}`} style={{ fontWeight: 600 }}>
              (Chọn tất cả)
            </span>
          </div>
        )}

        {/* Vẽ tối đa 300 giá trị, cột nhiều giá trị (số phiếu POS) gõ Tìm kiếm để thu hẹp (T466) */}
        {dsHien.slice(0, 300).map(x => {
          const chon = curSelected.includes(x)
          return (
            <div
              key={x}
              className={`loc-cot-muc${chon ? ' chon' : ''}`}
              onClick={() => toggleMot(x)}
              role="checkbox"
              aria-checked={chon}
            >
              <div className={`loc-cot-chk${chon ? ' chon' : ''}`}>
                {chon && <IconFigmaCheck />}
              </div>
              <span className={`loc-cot-txt${chon ? ' chon' : ''}`}>
                {x === '' ? '(Trống)' : x}
              </span>
            </div>
          )
        })}

        {dsHien.length > 300 && (
          <div className="loc-cot-nhac-gioi-han">
            Còn {dsHien.length - 300} giá trị, gõ Tìm kiếm để thu hẹp
          </div>
        )}

        {dsHien.length === 0 && (
          <div style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '12px', textAlign: 'center' }}>
            Không có mục khớp
          </div>
        )}
      </div>

      <div className="loc-cot-day">
        <button type="button" className="loc-cot-btn-xoa" onClick={handleXoaLoc}>
          Xoá lọc
        </button>
        <button type="button" className="loc-cot-btn-ap-dung" onClick={handleApDung}>
          Áp dụng ({soLuong})
        </button>
      </div>
    </div>
  )
}

/** Khung lọc hiển thị khi bấm phễu */
function KhungLoc({ c, kieu, g, loc, tatCaChon, onDong }: {
  c: Col
  kieu: KieuLoc
  g: GiaTriLoc
  loc: LocCot
  tatCaChon: string[]
  onDong: () => void
}) {
  if (kieu === 'chon') {
    return <KhungLocChon c={c} g={g} loc={loc} tatCaChon={tatCaChon} onDong={onDong} />
  }

  return (
    <div className="loc-pop-body">
      <div className="loc-pop-dau">
        <Icon n="filter" className="ic sm loc-pop-ic" />
        <div className="loc-pop-line" />
      </div>

      {kieu === 'chu' && (
        <div className="loc-pop-form">
          <Select
            className="loc-pop-sel"
            value={g.op || 'chua'}
            onChange={e => loc.dat(c.k, { ...g, op: e.target.value })}
            aria-label="Điều kiện lọc"
          >
            {PHEP_CHU.map(([op, nhan]) => (
              <option key={op} value={op}>{nhan}</option>
            ))}
          </Select>
          {g.op !== 'trong' && g.op !== 'khongtrong' && (
            <input
              className="loc-pop-inp"
              value={g.v}
              placeholder="Giá trị lọc..."
              aria-label="Giá trị lọc"
              onChange={e => loc.dat(c.k, { ...g, v: e.target.value })}
            />
          )}
          <div className="loc-pop-chan">
            <button
              type="button"
              className="loc-pop-reset"
              onClick={() => {
                loc.dat(c.k, { op: 'chua', v: '' })
                onDong()
              }}
            >
              Thiết lập lại
            </button>
          </div>
        </div>
      )}

      {kieu === 'so' && (
        <div className="loc-pop-form">
          <Select
            className="loc-pop-sel"
            value={g.op || '='}
            onChange={e => loc.dat(c.k, { ...g, op: e.target.value })}
            aria-label="Điều kiện lọc"
          >
            {PHEP_SO.map(([op, nhan]) => (
              <option key={op} value={op}>{nhan}</option>
            ))}
          </Select>
          {g.op !== 'trong' && (
            <input
              className="loc-pop-inp"
              value={g.v}
              placeholder={g.op === 'khoang' ? 'Từ giá trị...' : 'Giá trị số...'}
              aria-label="Giá trị lọc"
              onChange={e => loc.dat(c.k, { ...g, v: e.target.value })}
            />
          )}
          {g.op === 'khoang' && (
            <input
              className="loc-pop-inp"
              value={g.v2 || ''}
              placeholder="Đến giá trị..."
              aria-label="Đến giá trị"
              onChange={e => loc.dat(c.k, { ...g, v2: e.target.value })}
            />
          )}
          <div className="loc-pop-chan">
            <button
              type="button"
              className="loc-pop-reset"
              onClick={() => {
                loc.dat(c.k, { op: '=', v: '', v2: '' })
                onDong()
              }}
            >
              Thiết lập lại
            </button>
          </div>
        </div>
      )}

      {kieu === 'ngay' && (
        <KhungLocNgay c={c} g={g} loc={loc} onDong={onDong} />
      )}
    </div>
  )
}

function KhungLocNgay({ c, g, loc, onDong }: { c: Col; g: GiaTriLoc; loc: LocCot; onDong: () => void }) {
  const [moLich1, setMoLich1] = useState(false)
  const [moLich2, setMoLich2] = useState(false)
  const inp1Ref = useRef<HTMLDivElement>(null)
  const inp2Ref = useRef<HTMLDivElement>(null)

  return (
    <div className="loc-pop-form">
      <Select
        className="loc-pop-sel"
        value={g.op || '='}
        onChange={e => loc.dat(c.k, { ...g, op: e.target.value })}
        aria-label="Điều kiện lọc"
      >
        {PHEP_NGAY.map(([op, nhan]) => (
          <option key={op} value={op}>{nhan}</option>
        ))}
      </Select>
      <div ref={inp1Ref} className="loc-pop-ngay-box">
        <input
          className="loc-pop-inp"
          value={g.v}
          placeholder={g.op === 'khoang' ? 'Từ ngày dd/mm/yyyy' : 'dd/mm/yyyy'}
          aria-label="Giá trị ngày"
          onChange={e => loc.dat(c.k, { ...g, v: e.target.value })}
          onClick={() => setMoLich1(true)}
        />
        <button
          type="button"
          className={`loc-pop-btn-lich${moLich1 ? ' on' : ''}`}
          title="Chọn ngày"
          aria-label="Chọn ngày"
          onClick={() => setMoLich1(o => !o)}
        >
          <Icon n="calendar" className="ic sm" />
        </button>
        <Popover
          anchor={inp1Ref}
          open={moLich1}
          onClose={() => setMoLich1(false)}
          align="start"
          width={260}
          className="dp-pop"
        >
          <LichDon
            value={g.v}
            onChange={val => loc.dat(c.k, { ...g, v: val })}
            onDong={() => setMoLich1(false)}
          />
        </Popover>
      </div>
      {g.op === 'khoang' && (
        <div ref={inp2Ref} className="loc-pop-ngay-box">
          <input
            className="loc-pop-inp"
            value={g.v2 || ''}
            placeholder="Đến ngày dd/mm/yyyy"
            aria-label="Đến ngày"
            onChange={e => loc.dat(c.k, { ...g, v2: e.target.value })}
            onClick={() => setMoLich2(true)}
          />
          <button
            type="button"
            className={`loc-pop-btn-lich${moLich2 ? ' on' : ''}`}
            title="Chọn ngày"
            aria-label="Chọn ngày"
            onClick={() => setMoLich2(o => !o)}
          >
            <Icon n="calendar" className="ic sm" />
          </button>
          <Popover
            anchor={inp2Ref}
            open={moLich2}
            onClose={() => setMoLich2(false)}
            align="start"
            width={260}
            className="dp-pop"
          >
            <LichDon
              value={g.v2 || ''}
              onChange={val => loc.dat(c.k, { ...g, v2: val })}
              onDong={() => setMoLich2(false)}
            />
          </Popover>
        </div>
      )}
      <div className="loc-pop-chan">
        <button
          type="button"
          className="loc-pop-reset"
          onClick={() => {
            loc.dat(c.k, { op: '=', v: '', v2: '' })
            onDong()
          }}
        >
          Thiết lập lại
        </button>
      </div>
    </div>
  )
}

