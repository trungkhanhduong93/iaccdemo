// Ô chọn từ danh mục trong form chứng từ: xổ danh sách có ô tìm, chưa có thì thêm mới ngay tại form (T65).
// Mục thêm mới giữ trong phiên (bản mẫu chưa có backend) và hiện ở mọi ô cùng danh mục
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent as PhimReact } from 'react'
import { createPortal } from 'react-dom'
import { Popover, Select } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'
import { CatalogPanel } from './generic/CatalogScreen'
import { getDmMeta, addCatalogRow, useAddedCatalogRows, sinhMaKeTiep, type DmMeta } from './generic/danhMucStore'
import { DON_VI_TINH } from '../modules/danh-muc/data'
import { ngayDauNam, useSession } from '../app/session'
import type { Row } from '../modules/types'

export interface MucDm { v: string; t: string; dvt?: string }   // dvt: đơn vị tính của hàng vừa thêm tại form, để ô cha điền luôn (T419)

const daThem = new Map<string, MucDm[]>()
const nghe = new Set<() => void>()
let banSo = 0

/** Thêm một mục vào danh mục trong phiên */
export function themMucDanhMuc(dm: string, muc: MucDm) {
  if ((daThem.get(dm) ?? []).some(x => x.v === muc.v)) return   // đã có (vd ô NVL vừa thêm, rồi thêm lại vào nhóm hàng hoá) thì bỏ qua, khỏi trùng mã (T388)
  daThem.set(dm, [...(daThem.get(dm) ?? []), muc])
  banSo++
  nghe.forEach(f => f())
}

/** Các mục người dùng đã thêm vào danh mục trong phiên */
export function useMucDaThem(dm: string): MucDm[] {
  useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => banSo)
  return daThem.get(dm) ?? []
}

export function ChonDanhMuc({ dm, nhan, value, onChange, ds, className = 'inp', style, coMa, chiMa, trong, khongThem, gon }: {
  dm: string                         // khoá danh mục, vd ncc, kh, nhanVien, kho, hang
  nhan: string                       // tên danh mục hiện trên nút thêm mới, vd "nhà cung cấp"
  value: string
  onChange: (v: string, muc?: MucDm) => void   // muc: mục vừa chọn, kể cả mục vừa thêm chưa kịp có trong danh sách của ô cha
  ds: (string | MucDm)[]
  className?: string
  style?: CSSProperties
  coMa?: boolean                     // hộp thêm mới có ô Mã (mục dạng mã - tên, vd hàng hoá)
  trong?: string                     // nhãn khi chưa chọn, vd "—"
  chiMa?: boolean                    // ô đã chọn chỉ hiện mã, danh sách vẫn hiện mã - tên; dùng ở cột Mã hàng vì tên đã có cột riêng (T124)
  khongThem?: boolean                // không cho thêm mới tại form, vd quỹ tiền chỉ khai ở danh mục Quỹ tiền
  gon?: boolean                      // thêm hàng hoá bằng hộp nhỏ 4 ô Mã, Tên, ĐVT, Loại hàng hoá, vd phiếu mua hàng, kiểm kê (T388)
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
        <span className="sel-v">{(chiMa && value) || (cur?.t ?? (value || trong || `Chọn ${nhan}`))}</span><Icon n="chevd" className="ic sm sel-c" />
      </button>
      <Popover anchor={btn} open={mo} onClose={() => setMo(false)} role="listbox" className="pop-sel pop-dm" width={Math.max(260, btn.current?.offsetWidth ?? 0)}>
        <div className="dm-tim">
          <Icon n="search" className="ic sm" />
          <input ref={oTim} value={tim} placeholder={`Tìm ${nhan}`} onChange={e => setTim(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (loc[0]) chon(loc[0].v); else if (tim.trim() && !khongThem) { setMo(false); setHop(true) } } }} />
        </div>
        <div className="dm-ds">
          {loc.map(o => (
            <button key={o.v} data-mi type="button" role="option" aria-selected={o.v === value} className={`mi${o.v === value ? ' on' : ''}`} onClick={() => chon(o.v)}>
              <span className="mi-t"><b>{o.t}</b></span>{o.v === value && <Icon n="check" className="ic sm mi-ok" />}
            </button>
          ))}
          {!loc.length && <div className="dm-trong">Chưa có {nhan} «{tim.trim()}»</div>}
        </div>
        {!khongThem && (
          <button type="button" className="dm-them" onClick={() => { setMo(false); setHop(true) }}>
            <Icon n="plus" className="ic sm" />{tim.trim() ? <>Thêm {nhan} «{tim.trim()}»</> : <>Thêm {nhan} mới</>}
          </button>
        )}
      </Popover>
      {hop && !khongThem && (() => {
        const meta = getDmMeta(dm, nhan, tim.trim())
        // Lưu mục mới vào danh mục, chọn luôn cho ô này; danh mục chung (đối tượng, hàng hoá) thì có ở mọi ô cùng nhóm
        const luuMuc = (val: Record<string, any>, themTiep?: boolean) => {
          addCatalogRow(meta.catKey, val)
          const ma = String(val.ma ?? '').trim()
          const ten = String(val.ten ?? '').trim()
          const muc: MucDm = { ...(coMa ? { v: ma, t: `${ma} - ${ten}` } : { v: ten, t: ten }), ...(val.dvt ? { dvt: String(val.dvt) } : {}) }
          themMucDanhMuc(dm, muc)
          if (meta.catKey === '1.5') {
            themMucDanhMuc('doiTuong', muc)
            themMucDanhMuc('kh', muc)
            themMucDanhMuc('ncc', muc)
            themMucDanhMuc('nv', muc)
          } else if (meta.catKey === '1.2') {
            themMucDanhMuc('hang', muc)
            themMucDanhMuc('nvl', muc)
            themMucDanhMuc('ccdc', muc)
          }
          onChange(muc.v, muc)
          if (!themTiep) setHop(false)
        }
        if (meta.cauHinh && gon) return <HopThemHang meta={meta} nhan={nhan} onDong={() => setHop(false)} onLuu={v => luuMuc(v)} />
        if (meta.cauHinh) {
          return createPortal(
            <CatalogPanel
              cauHinh={meta.cauHinh}
              edit={{}}
              dienSan={meta.dienSan}
              all={meta.all}
              ten={meta.ten}
              tenNgan={meta.tenNgan}
              scSlug={meta.scSlug}
              onDong={() => setHop(false)}
              onLuu={luuMuc}
            />,
            document.body,
          )
        }
        return (
          <HopThem nhan={nhan} coMa={coMa} tenGoc={tim.trim()} onDong={() => setHop(false)}
            onLuu={(ma, ten) => {
              const muc = coMa ? { v: ma, t: `${ma} - ${ten}` } : { v: ten, t: ten }
              themMucDanhMuc(dm, muc)
              onChange(muc.v, muc)
              setHop(false)
            }} />
        )
      })()}
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

/** Hộp nhỏ thêm hàng hoá ngay tại form chứng từ (T388): Mã (tự sinh theo loại), Tên, Đơn vị tính, Loại hàng hoá;
 *  loại khoá theo màn (Mua hàng, Kiểm kê: Nguyên vật liệu; Chi phí trả trước: Khác (Công cụ dụng cụ)), các giá trị khác lấy theo giá trị sẵn (theo dõi tồn kho) */
function HopThemHang({ meta, nhan, onDong, onLuu }: { meta: DmMeta; nhan: string; onDong: () => void; onLuu: (v: Record<string, any>) => void }) {
  const { s } = useSession()
  // Giá trị sẵn khi thêm mới của danh mục, vd ngành nghề 301-5 của hàng hoá (T469), rồi tới giá trị điền từ phiếu
  const [v, setV] = useState<Row>(() => ({ ...meta.cauHinh?.moi?.(meta.all, { ngayDauNam: ngayDauNam(s) }), ...meta.dienSan, ten: meta.dienSan.ten ?? '' }))
  const [maTay, setMaTay] = useState('')
  const ma = maTay || sinhMaKeTiep(meta.catKey, v, meta.all)
  const duoc = String(v.ten).trim() && ma.trim()
  const doi = (k: string, gt: string) => setV(x => { const moi = { ...x, [k]: gt }; return { ...moi, ...meta.cauHinh?.doi?.(k, moi, meta.all, { goi: s.goi, cheDo: s.cheDo }) } })
  const luu = () => { if (duoc) onLuu({ ...v, ma: ma.trim(), ten: String(v.ten).trim() }) }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [onDong])
  const enter = (e: PhimReact<HTMLInputElement>) => { if (e.key === 'Enter') luu() }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop ds-hop-nho" role="dialog" aria-modal="true" aria-label={`Thêm ${nhan}`}>
        <div className="ds-hop-dau"><b>Thêm {nhan}</b></div>
        <div className="dm-hop-than">
          <div className="f">
            <label>Mã hàng <em>*</em></label>
            <input className="inp code" value={ma} onChange={e => setMaTay(e.target.value.toUpperCase())} onKeyDown={enter} />
          </div>
          <div className="f">
            <label>Tên hàng <em>*</em></label>
            <input className="inp" value={v.ten} autoFocus onChange={e => doi('ten', e.target.value)} onKeyDown={enter} />
          </div>
          <div className="f">
            <label>Đơn vị tính</label>
            <Select className="inp" value={v.dvt ?? ''} aria-label="Đơn vị tính" onChange={e => doi('dvt', e.target.value)}
              ds={[{ v: '', t: '(Chọn đơn vị tính)' }, ...DON_VI_TINH.map(d => ({ v: d[1], t: `${d[0]} - ${d[1]}` }))]} />
          </div>
          <div className="f">
            <label>Loại hàng hoá</label>
            <input className="inp" value={v.loai ?? ''} aria-label="Loại hàng hoá" readOnly disabled />
          </div>
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
