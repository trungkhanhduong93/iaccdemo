// Ô chọn từ danh mục trong form chứng từ: xổ danh sách có ô tìm, chưa có thì thêm mới ngay tại form (T65).
// Mục thêm mới giữ trong phiên (bản mẫu chưa có backend) và hiện ở mọi ô cùng danh mục
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Popover } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'

export interface MucDm { v: string; t: string }

const daThem = new Map<string, MucDm[]>()
const nghe = new Set<() => void>()
let banSo = 0

/** Thêm một mục vào danh mục trong phiên */
export function themMucDanhMuc(dm: string, muc: MucDm) {
  daThem.set(dm, [...(daThem.get(dm) ?? []), muc])
  banSo++
  nghe.forEach(f => f())
}

/** Các mục người dùng đã thêm vào danh mục trong phiên */
export function useMucDaThem(dm: string): MucDm[] {
  useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => banSo)
  return daThem.get(dm) ?? []
}

export function ChonDanhMuc({ dm, nhan, value, onChange, ds, className = 'inp', style, coMa, trong }: {
  dm: string                         // khoá danh mục, vd ncc, kh, nhanVien, kho, hang
  nhan: string                       // tên danh mục hiện trên nút thêm mới, vd "nhà cung cấp"
  value: string
  onChange: (v: string, muc?: MucDm) => void   // muc: mục vừa chọn, kể cả mục vừa thêm chưa kịp có trong danh sách của ô cha
  ds: (string | MucDm)[]
  className?: string
  style?: CSSProperties
  coMa?: boolean                     // hộp thêm mới có ô Mã (mục dạng mã - tên, vd hàng hoá)
  trong?: string                     // nhãn khi chưa chọn, vd "—"
}) {
  const them = useMucDaThem(dm)
  const tatCa: MucDm[] = [...ds.map(x => typeof x === 'string' ? { v: x, t: x } : x), ...them]
  const cur = tatCa.find(x => x.v === value)
  const [mo, setMo] = useState(false)
  const [tim, setTim] = useState('')
  const [hop, setHop] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const oTim = useRef<HTMLInputElement>(null)
  const q = fold(tim.trim())
  const loc = q ? tatCa.filter(x => fold(x.t).includes(q)) : tatCa

  useEffect(() => { if (mo) { setTim(''); setTimeout(() => oTim.current?.focus(), 0) } }, [mo])

  const chon = (v: string) => { onChange(v, tatCa.find(x => x.v === v)); setMo(false); btn.current?.focus() }

  return (
    <>
      <button ref={btn} type="button" className={`sel ${className}${mo ? ' open' : ''}`} style={style} aria-haspopup="listbox" aria-expanded={mo}
        onClick={() => setMo(o => !o)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setMo(true) } }}>
        <span className="sel-v">{cur?.t ?? (value || trong || `Chọn ${nhan}`)}</span><Icon n="chevd" className="ic sm sel-c" />
      </button>
      <Popover anchor={btn} open={mo} onClose={() => setMo(false)} role="listbox" className="pop-sel pop-dm" width={Math.max(260, btn.current?.offsetWidth ?? 0)}>
        <div className="dm-tim">
          <Icon n="search" className="ic sm" />
          <input ref={oTim} value={tim} placeholder={`Tìm ${nhan}`} onChange={e => setTim(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (loc[0]) chon(loc[0].v); else if (tim.trim()) { setMo(false); setHop(true) } } }} />
        </div>
        <div className="dm-ds">
          {loc.map(o => (
            <button key={o.v} data-mi type="button" role="option" aria-selected={o.v === value} className={`mi${o.v === value ? ' on' : ''}`} onClick={() => chon(o.v)}>
              <span className="mi-t"><b>{o.t}</b></span>{o.v === value && <Icon n="check" className="ic sm mi-ok" />}
            </button>
          ))}
          {!loc.length && <div className="dm-trong">Chưa có {nhan} «{tim.trim()}»</div>}
        </div>
        <button type="button" className="dm-them" onClick={() => { setMo(false); setHop(true) }}>
          <Icon n="plus" className="ic sm" />{tim.trim() ? <>Thêm {nhan} «{tim.trim()}»</> : <>Thêm {nhan} mới</>}
        </button>
      </Popover>
      {hop && (
        <HopThem nhan={nhan} coMa={coMa} tenGoc={tim.trim()} onDong={() => setHop(false)}
          onLuu={(ma, ten) => {
            const muc = coMa ? { v: ma, t: `${ma} - ${ten}` } : { v: ten, t: ten }
            themMucDanhMuc(dm, muc)
            onChange(muc.v, muc)
            setHop(false)
          }} />
      )}
    </>
  )
}

/** Hộp thêm nhanh một mục danh mục ngay tại form */
function HopThem({ nhan, coMa, tenGoc, onDong, onLuu }: { nhan: string; coMa?: boolean; tenGoc: string; onDong: () => void; onLuu: (ma: string, ten: string) => void }) {
  const [ma, setMa] = useState('')
  const [ten, setTen] = useState(tenGoc)
  const duoc = ten.trim() && (!coMa || ma.trim())
  const luu = () => { if (duoc) onLuu(ma.trim(), ten.trim()) }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [onDong])
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop ds-hop-nho" role="dialog" aria-modal="true" aria-label={`Thêm ${nhan}`}>
        <div className="ds-hop-dau"><b>Thêm {nhan}</b></div>
        <div className="dm-hop-than">
          {coMa && (
            <div className="f">
              <label>Mã <em>*</em></label>
              <input className="inp code" value={ma} autoFocus onChange={e => setMa(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === 'Enter') luu() }} />
            </div>
          )}
          <div className="f">
            <label>Tên <em>*</em></label>
            <input className="inp" value={ten} autoFocus={!coMa} onChange={e => setTen(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') luu() }} />
          </div>
          <p className="muted">Mục mới lưu vào danh mục {nhan} và được chọn luôn cho ô này.</p>
        </div>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri" disabled={!duoc} onClick={luu}>Lưu</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
