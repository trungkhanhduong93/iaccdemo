// Hàng lọc từng cột dưới tiêu đề bảng theo mẫu iPOS Inventory (T42):
// mỗi ô chỉ có phễu nhỏ căn phải (cột ngày có thêm ô dd/mm/yyyy + lịch). Bấm phễu mở khung lọc điều kiện.
import { useState, useRef, type ReactNode } from 'react'
import type { Col } from '../modules/types'
import { Popover, Select } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'

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

function toYmd(dmyStr: string): string {
  if (!dmyStr) return ''
  const m = dmyStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const dd = m[1].padStart(2, '0')
    const mm = m[2].padStart(2, '0')
    return `${m[3]}-${mm}-${dd}`
  }
  return ''
}

/** Ô lọc của một cột trong hàng lọc */
export function OLoc({ c, loc }: { c: Col; loc: LocCot }) {
  const kieu = loc.kieu(c)
  const g = loc.gt[c.k] ?? { op: kieu === 'chu' ? 'chua' : kieu === 'so' ? '=' : kieu === 'ngay' ? '=' : '', v: '' }
  const tatCaChon = loc.luaChon?.[c.k] ?? []
  const dang = dangLoc(g, kieu === 'chon' ? tatCaChon.length : undefined)
  const [mo, setMo] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const dong = () => setMo(false)

  const moPicker = () => {
    try {
      dateRef.current?.showPicker()
    } catch {
      dateRef.current?.focus()
    }
  }

  // Cột ngày: ô nhập nhỏ + biểu tượng lịch + phễu
  if (kieu === 'ngay') {
    return (
      <div className="loc-cell loc-cell-ngay" onClick={e => e.stopPropagation()}>
        <input
          className="loc-o-ngay"
          placeholder="dd/mm/yyyy"
          value={g.v}
          aria-label={`Lọc ngày cột ${c.t}`}
          onChange={e => loc.dat(c.k, { ...g, v: e.target.value, op: g.op || '=' })}
          onClick={moPicker}
        />
        <button
          type="button"
          className="loc-btn-lich"
          title="Chọn ngày"
          aria-label="Chọn ngày"
          onClick={moPicker}
        >
          <Icon n="calendar" className="ic sm" />
        </button>
        <input
          ref={dateRef}
          type="date"
          className="loc-inp-date-an"
          value={toYmd(g.v)}
          tabIndex={-1}
          aria-hidden="true"
          onChange={e => {
            if (!e.target.value) return
            const [yy, mm, dd] = e.target.value.split('-')
            loc.dat(c.k, { ...g, v: `${dd}/${mm}/${yy}`, op: g.op || '=' })
          }}
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
        onClick={() => setMo(true)}
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

/** Khung lọc hiển thị khi bấm phễu */
function KhungLoc({ c, kieu, g, loc, tatCaChon, onDong }: {
  c: Col
  kieu: KieuLoc
  g: GiaTriLoc
  loc: LocCot
  tatCaChon: string[]
  onDong: () => void
}) {
  const [moText, setMoText] = useState(Boolean(g.vText || g.opText))
  const [timKiem, setTimKiem] = useState('')

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
          <input
            className="loc-pop-inp"
            value={g.v}
            placeholder={g.op === 'khoang' ? 'Từ ngày dd/mm/yyyy' : 'dd/mm/yyyy'}
            aria-label="Giá trị ngày"
            onChange={e => loc.dat(c.k, { ...g, v: e.target.value })}
          />
          {g.op === 'khoang' && (
            <input
              className="loc-pop-inp"
              value={g.v2 || ''}
              placeholder="Đến ngày dd/mm/yyyy"
              aria-label="Đến ngày"
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

      {kieu === 'chon' && (
        <div className="loc-pop-form loc-pop-chon">
          {/* Bộ lọc văn bản thu gọn được */}
          <div className="loc-pop-nhom-text">
            <button
              type="button"
              className="loc-pop-expand-btn"
              onClick={() => setMoText(o => !o)}
              aria-expanded={moText}
            >
              <Icon n={moText ? 'chevd' : 'chevr'} className="ic sm" />
              <span>Bộ lọc văn bản</span>
            </button>
            {moText && (
              <div className="loc-pop-text-box">
                <Select
                  className="loc-pop-sel"
                  value={g.opText || 'chua'}
                  onChange={e => loc.dat(c.k, { ...g, opText: e.target.value })}
                  aria-label="Điều kiện văn bản"
                >
                  {PHEP_CHU.map(([op, nhan]) => (
                    <option key={op} value={op}>{nhan}</option>
                  ))}
                </Select>
                {g.opText !== 'trong' && g.opText !== 'khongtrong' && (
                  <input
                    className="loc-pop-inp"
                    value={g.vText || ''}
                    placeholder="Giá trị lọc..."
                    aria-label="Giá trị lọc văn bản"
                    onChange={e => loc.dat(c.k, { ...g, vText: e.target.value })}
                  />
                )}
              </div>
            )}
          </div>

          {/* Ô Tìm kiếm danh sách tick */}
          <input
            className="loc-pop-inp loc-pop-tim"
            value={timKiem}
            placeholder="Tìm kiếm..."
            aria-label="Tìm kiếm giá trị"
            onChange={e => setTimKiem(e.target.value)}
          />

          {/* Danh sách tick chọn */}
          <div className="loc-pop-ds-tick">
            {(() => {
              const dsHien = tatCaChon.filter(x => fold(x).includes(fold(timKiem.trim())))
              const curSelected = g.ds ?? tatCaChon
              const tatCaDaChon = dsHien.length > 0 && dsHien.every(x => curSelected.includes(x))
              const toggleTatCa = () => {
                if (tatCaDaChon) {
                  const moi = curSelected.filter(x => !dsHien.includes(x))
                  loc.dat(c.k, { ...g, ds: moi })
                } else {
                  const moi = [...new Set([...curSelected, ...dsHien])]
                  loc.dat(c.k, { ...g, ds: moi })
                }
              }
              const toggleMot = (x: string) => {
                const moi = curSelected.includes(x)
                  ? curSelected.filter(y => y !== x)
                  : [...curSelected, x]
                loc.dat(c.k, { ...g, ds: moi })
              }
              return (
                <>
                  <label className="loc-pop-item">
                    <input
                      type="checkbox"
                      checked={tatCaDaChon}
                      onChange={toggleTatCa}
                    />
                    <b>(Chọn Tất Cả)</b>
                  </label>
                  {dsHien.map(x => (
                    <label key={x} className="loc-pop-item">
                      <input
                        type="checkbox"
                        checked={curSelected.includes(x)}
                        onChange={() => toggleMot(x)}
                      />
                      <span>{x}</span>
                    </label>
                  ))}
                  {dsHien.length === 0 && (
                    <div className="loc-pop-trong">Không có mục khớp</div>
                  )}
                </>
              )
            })()}
          </div>

          <div className="loc-pop-chan">
            <button
              type="button"
              className="loc-pop-reset"
              onClick={() => {
                loc.dat(c.k, { op: '', v: '', ds: undefined, opText: 'chua', vText: '' })
                setTimKiem('')
                onDong()
              }}
            >
              Thiết lập lại
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
