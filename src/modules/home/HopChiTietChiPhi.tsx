// Hộp chi tiết khi bấm dòng ở màn Chi phí NVL, Chi phí hoạt động gói Standard (T953):
// ô tóm tắt, lọc từng cột dưới tiêu đề như danh sách chứng từ, phân trang, xuất Excel đúng các dòng đang lọc.
// Tổng tiền đã nằm ở ô tóm tắt nên dòng chân chỉ đếm số dòng.
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Col, Row } from '../types'
import { Icon } from '../../ui/Icon'
import { Table } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { docNgay } from '../../ui/ChonNgay'
import { money } from '../../ui/format'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'

export interface OTomTat { nhan: string; so: ReactNode; phu?: ReactNode; cam?: boolean }

const kieuCot = (c: Col): KieuLoc => (c.k === 'ngay' ? 'ngay' : c.num ? 'so' : 'chon')

export function HopChiTietChiPhi({ tieuDe, phu, o, ghiChu, cols: cot, rows, onXuat, onDong }: {
  tieuDe: string
  phu: string
  o: OTomTat[]
  ghiChu: string
  cols: Col[]
  rows: Row[]
  onXuat: (rowsLoc: Row[]) => void
  onDong: () => void
}) {
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onDong])

  // ô rỗng của dòng chân không chạy hàm hiện của cột (soLuong('') ra 0, Link rỗng)
  const cols: Col[] = [{ k: 'stt', t: '#', c: true }, ...cot.map(c => { const r0 = c.r; return r0 ? { ...c, r: (x: Row) => x[c.k] === '' ? '' : r0(x) } : c })]
  const kieu = new Map(cot.map(c => [c.k, kieuCot(c)]))
  const list = rows.filter(r => Object.entries(locCot).every(([k, g]) => {
    const v = r[k]
    return !dangLoc(g) || khopLoc(kieu.get(k) ?? 'chu', g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''),
      typeof v === 'number' ? v : undefined, k === 'ngay' ? docNgay(String(v ?? '')) : undefined)
  }))
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const batDau = (Math.min(trang, soTrang) - 1) * coTrang
  const rowsTrang = list.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  // ô chân rỗng ở mọi cột để số dòng đứng riêng dưới cột #, không trải sang cột bên cạnh
  const sum: Row = Object.fromEntries(cols.map(c => [c.k, c.k === 'stt' ? String(list.length) : '']))

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop hct-hop" role="dialog" aria-modal="true" aria-label={tieuDe}>
        <div className="ds-hop-dau">
          <div className="hct-dau">
            <span className="hct-tieu-de">{tieuDe}</span>
            <b>{phu}</b>
          </div>
          <span className="grow" />
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}>
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        <div className="hct-than">
          <div className="hct-o-luoi" style={{ gridTemplateColumns: `repeat(${o.length}, minmax(0, 1fr))` }}>
            {o.map(x => (
              <div key={x.nhan} className={`hct-o${x.cam ? ' cam' : ''}`}>
                <span className="hct-o-nhan">{x.nhan}</span>
                <b className="hct-o-so">{x.so}</b>
                {x.phu && <span className="hct-o-phu">{x.phu}</span>}
              </div>
            ))}
          </div>
          <div className="hct-thanh">
            <span className="muted">{ghiChu}</span>
            <span className="grow" />
            <NutXuatExcel onXuat={() => onXuat(list)} />
          </div>
          <Table cols={cols} rows={rowsTrang} sum={sum}
            loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt']), kieu: kieuCot,
              layLuaChon: k => dsGiaTri(rows, r => String(r[k] ?? '')) }} />
          <PhanTrang tong={list.length} trang={Math.min(trang, soTrang)} coTrang={coTrang} dsCoTrang={[50, 100, 200]}
            onTrang={setTrang} onCoTrang={n => { setCoTrang(n); setTrang(1) }} />
        </div>
        <div className="hct-chan">
          <button type="button" className="btn" onClick={onDong}>Đóng</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
