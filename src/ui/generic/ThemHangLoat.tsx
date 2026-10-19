// Hộp Thêm hàng loạt (T465): tích nhiều hàng hoá một lần rồi đổ thành dòng chi tiết của phiếu mua hàng, phiếu kiểm kê.
// Bảng như iFaster: ô tích, #, Hàng hoá (tên - mã), Đơn vị tính, Nhóm hàng hoá, Loại; mỗi cột có ô lọc; phân trang; Đóng, Xác nhận
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { OLoc, dangLoc, khopLoc, type GiaTriLoc, type LocCot } from '../LocCot'

export interface HangChon { ma: string; ten: string; dvt: string; nhom?: string; loai: string }

const COT: [keyof HangChon | 'hang', string, (h: HangChon) => string][] = [
  ['hang', 'Hàng hoá', h => `${h.ten} - ${h.ma}`],
  ['dvt', 'Đơn vị tính', h => h.dvt],
  ['nhom', 'Nhóm hàng hoá', h => h.nhom ?? ''],
  ['loai', 'Loại', h => h.loai],
]

export function ThemHangLoat({ ds, daCo, onDong, onXacNhan }: {
  ds: HangChon[]
  daCo: string[]                         // mã hàng đã có trong phiếu: tích sẵn, mờ, không chọn lại để khỏi trùng dòng
  onDong: () => void
  onXacNhan: (ds: HangChon[]) => void
}) {
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  const [coTrang, setCoTrang] = useState(100)
  const [trang, setTrang] = useState(1)
  const loc: LocCot = { gt: gtLoc, dat: (k, g) => { setGtLoc(t => ({ ...t, [k]: g })); setTrang(1) }, kieu: () => 'chu' }

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onDong])

  const dsLoc = useMemo(() => ds.filter(h => COT.every(([k, , lay]) => !dangLoc(gtLoc[k]) || khopLoc('chu', gtLoc[k], lay(h)))), [ds, gtLoc])
  const soTrang = Math.max(1, Math.ceil(dsLoc.length / coTrang))
  const trangHien = Math.min(trang, soTrang)
  const dau = (trangHien - 1) * coTrang
  const dsTrang = dsLoc.slice(dau, dau + coTrang)
  const chonDuoc = dsTrang.filter(h => !daCo.includes(h.ma))
  const tatCa = chonDuoc.length > 0 && chonDuoc.every(h => chon.has(h.ma))

  const bat = (ma: string, v: boolean) => setChon(c => { const n = new Set(c); if (v) n.add(ma); else n.delete(ma); return n })
  const batTatCa = (v: boolean) => setChon(c => { const n = new Set(c); for (const h of chonDuoc) { if (v) n.add(h.ma); else n.delete(h.ma) } return n })

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop thl-hop" role="dialog" aria-modal="true" aria-label="Thêm hàng loạt">
        <div className="ds-hop-dau">
          <b className="thl-tieu-de">Thêm hàng loạt</b>
          <span className="grow" />
          <button type="button" className="icon-btn sm" onClick={onDong} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="thl-than">
          <div className="thl-bang">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 44 }}><input type="checkbox" checked={tatCa} onChange={e => batTatCa(e.target.checked)} aria-label="Chọn tất cả hàng đang hiện" /></th>
                  <th className="dim" style={{ width: 50 }}>#</th>
                  {COT.map(([k, t]) => <th key={k}>{t}</th>)}
                </tr>
                <tr className="loc-hang">
                  <th /><th />
                  {COT.map(([k, t]) => <th key={k}><OLoc c={{ k, t }} loc={loc} /></th>)}
                </tr>
              </thead>
              <tbody>
                {dsTrang.map((h, i) => {
                  const co = daCo.includes(h.ma)
                  return (
                    <tr key={h.ma} className={co ? 'thl-co' : chon.has(h.ma) ? 'thl-on' : ''} onClick={() => { if (!co) bat(h.ma, !chon.has(h.ma)) }}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={co || chon.has(h.ma)} disabled={co} onChange={e => bat(h.ma, e.target.checked)} aria-label={`Chọn ${h.ten}`} />
                      </td>
                      <td className="dim">{dau + i + 1}</td>
                      <td>{h.ten} <span className="muted">- {h.ma}</span>{co && <span className="thl-nhan">Đã có trong phiếu</span>}</td>
                      <td>{h.dvt}</td>
                      <td>{h.nhom}</td>
                      <td>{h.loai}</td>
                    </tr>
                  )
                })}
                {dsTrang.length === 0 && <tr><td colSpan={6} className="muted thl-trong">Không có hàng hoá khớp bộ lọc</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="thl-trang">
            <span className="muted">Kích cỡ trang:</span>
            <Select className="inp sm thl-co-trang" value={String(coTrang)} onChange={e => { setCoTrang(Number(e.target.value)); setTrang(1) }}>
              {[50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
            </Select>
            <span><b>{dsLoc.length ? dau + 1 : 0}</b> đến <b>{Math.min(dau + coTrang, dsLoc.length)}</b> trong <b>{dsLoc.length}</b></span>
            <button type="button" className="icon-btn sm" disabled={trangHien === 1} onClick={() => setTrang(1)} aria-label="Trang đầu"><Icon n="chevl" className="ic sm" /><Icon n="chevl" className="ic sm" /></button>
            <button type="button" className="icon-btn sm" disabled={trangHien === 1} onClick={() => setTrang(trangHien - 1)} aria-label="Trang trước"><Icon n="chevl" className="ic sm" /></button>
            <span>Trang <b>{trangHien}</b> trong <b>{soTrang}</b></span>
            <button type="button" className="icon-btn sm" disabled={trangHien === soTrang} onClick={() => setTrang(trangHien + 1)} aria-label="Trang sau"><Icon n="chevr" className="ic sm" /></button>
            <button type="button" className="icon-btn sm" disabled={trangHien === soTrang} onClick={() => setTrang(soTrang)} aria-label="Trang cuối"><Icon n="chevr" className="ic sm" /><Icon n="chevr" className="ic sm" /></button>
            <span className="grow" />
            <span className="muted">Đã chọn <b>{chon.size}</b></span>
          </div>
        </div>
        <div className="thl-chan">
          <button type="button" className="btn" onClick={onDong}>Đóng</button>
          <button type="button" className="btn pri" onClick={() => { onXacNhan(ds.filter(h => chon.has(h.ma))); onDong() }}>
            Xác nhận{chon.size > 0 ? ` (${chon.size})` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
