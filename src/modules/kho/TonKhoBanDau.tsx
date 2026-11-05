// Tồn kho ban đầu sửa ngay trên bảng (T736): mỗi dòng chọn kho, mặt hàng, ĐVT (kể cả ĐVT quy đổi), gõ số lượng, đơn giá;
// một nút + xanh ở tiêu đề cột thêm dòng trống cuối bảng, nút thùng rác ở dòng xoá dòng; không có panel thêm, sửa. Dữ liệu giữ trong phiên làm việc
import { useMemo, useRef, useState } from 'react'
import type { ScreenProps } from '../types'
import { HANG, KHO, NVL } from '../../data/mock'
import { ChonCoTim, quyDoiTuDanhMuc, type MucTim } from '../danh-muc/QuyDoiDvt'
import { Select } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { NutExcel } from '../../ui/CongCuDs'
import { useSession } from '../../app/session'
import { tenMan } from '../../app/registry'
import { fold, money, nhapSoQT, soQT } from '../../ui/format'
import { tonBanDauMau } from './data'

// Mặt hàng có theo dõi tồn: nguyên vật liệu và hàng hoá có tồn kho
const MAT_HANG = [...NVL, ...HANG.filter(h => h.tonKho)]
const DS_HANG: MucTim[] = MAT_HANG.map(h => ({ v: h.ma, t: h.ten, phu: `${h.ma} · ${h.dvt}` }))
const DS_KHO = KHO.map(k => ({ v: k, t: k }))

interface Dong { id: number; kho: string; ma: string; dvt: string; sl: number; gia: number }

let soId = 0
// Giữ trong phiên: rời màn quay lại vẫn còn dòng đã sửa
let luuPhien: Dong[] | null = null
const dongMau = (): Dong[] => tonBanDauMau().map(r => ({ id: ++soId, kho: r.kho, ma: r.ma, dvt: r.dvt, sl: r.sl, gia: r.gia }))
const dongTrong = (kho: string): Dong => ({ id: ++soId, kho, ma: '', dvt: '', sl: 0, gia: 0 })

/** Số ĐVT chính trong 1 đơn vị dv của mặt hàng; ĐVT chính là 1 */
function heSo(ma: string, dv: string): number {
  const h = MAT_HANG.find(x => x.ma === ma)
  if (!h || !dv || dv === h.dvt) return 1
  const q = quyDoiTuDanhMuc(h.ten, h.dvt).find(x => x.dv === dv)
  return q ? (q.nguoc ? q.tl : 1 / q.tl) : 1
}

/** Ô số giữ chữ đang gõ (vd "1,") để gõ được số lẻ, báo số ra ngoài; số đổi từ ngoài thì đổi key để vẽ lại ô */
function OSoDong({ val, onDoi, nhan }: { val: number; onDoi: (n: number) => void; nhan: string }) {
  const [chu, setChu] = useState(val ? String(val) : '')
  return (
    <input className="inp sm tkbd-so" inputMode="decimal" aria-label={nhan} placeholder="0" value={soQT(chu)}
      onChange={e => { const t = nhapSoQT(e.target.value); setChu(t); onDoi(Number(t) || 0) }} />
  )
}

export function TonKhoBanDau({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [dong, setDong0] = useState<Dong[]>(() => luuPhien ?? (luuPhien = dongMau()))
  const setDong = (f: (d: Dong[]) => Dong[]) => setDong0(d => (luuPhien = f(d)))
  const [q, setQ] = useState('')
  const [kho, setKho] = useState('')
  const bang = useRef<HTMLTableSectionElement>(null)

  const hien = useMemo(() => dong.filter(d => {
    if (kho && d.kho !== kho) return false
    if (!q.trim()) return true
    const h = MAT_HANG.find(x => x.ma === d.ma)
    return fold(`${d.kho} ${d.ma} ${h?.ten ?? ''}`).includes(fold(q.trim()))
  }), [dong, q, kho])


  const sua = (id: number, p: Partial<Dong>) => setDong(d => d.map(x => x.id === id ? { ...x, ...p } : x))
  const chonHang = (d: Dong, ma: string) => {
    const h = MAT_HANG.find(x => x.ma === ma)
    if (!h) return
    if (dong.some(x => x.id !== d.id && x.kho === d.kho && x.ma === ma)) toast(`${h.ten} đã có ở ${d.kho}`)
    sua(d.id, { ma, dvt: h.dvt, gia: h.gia })
  }
  const doiDvt = (d: Dong, dv: string) => {
    // đơn giá đổi theo ĐVT: giá ĐVT chính nhân số ĐVT chính trong 1 đơn vị mới
    const giaChinh = d.gia / heSo(d.ma, d.dvt)
    sua(d.id, { dvt: dv, gia: Math.round(giaChinh * heSo(d.ma, dv)) })
  }
  const chen = (sau: Dong | null) => {
    const moi = dongTrong(sau?.kho ?? (kho || KHO[0]))
    setDong(d => {
      const i = sau ? d.findIndex(x => x.id === sau.id) : -1
      return i < 0 ? [...d, moi] : [...d.slice(0, i + 1), moi, ...d.slice(i + 1)]
    })
    setTimeout(() => bang.current?.querySelector<HTMLButtonElement>(`tr[data-id="${moi.id}"] [aria-label="Mặt hàng"]`)?.focus(), 0)
  }
  const xoa = (d: Dong) => setDong(ds => ds.filter(x => x.id !== d.id))

  const tongTien = hien.reduce((a, d) => a + d.sl * d.gia, 0)

  return (
    <div className="page page-voucher page-dm">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card dm-bang tkbd">
        <div className="ds-toolbar-figma">
          <div className="row" style={{ gap: 8 }}>
            <div className="ds-tim-figma">
              <IconFigmaSearch size={16} />
              <input value={q} placeholder="Tìm theo mã, tên" aria-label="Tìm kiếm" onChange={e => setQ(e.target.value)} />
            </div>
            <Select className="inp tkbd-loc-kho" value={kho} onChange={e => setKho(e.target.value)} aria-label="Lọc kho"
              ds={[{ v: '', t: 'Tất cả kho' }, ...DS_KHO]} />
          </div>
          <div className="ds-toolbar-phai">
            <span className="muted" style={{ fontSize: 12 }}>{hien.length}/{dong.length} dòng</span>
            <NutExcel onNhap={() => toast('Nhập tồn kho ban đầu từ Excel')} onXuat={() => toast(`Đã xuất ${hien.length} dòng ra Excel`)} />
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl bang-sua tkbd-bang">
            <thead>
              <tr>
                <th className="c" style={{ width: 44 }}>STT</th>
                <th style={{ width: 170 }}>Kho</th>
                <th style={{ width: 90 }}>Mã</th>
                <th>Tên hàng</th>
                <th style={{ width: 110 }}>ĐVT</th>
                <th className="num" style={{ width: 120 }}>Số lượng</th>
                <th className="num" style={{ width: 130 }}>Đơn giá</th>
                <th className="num" style={{ width: 140 }}>Thành tiền</th>
                <th className="c" style={{ width: 56 }}>
                  <button type="button" className="btn pri sm tkbd-them" title="Thêm dòng cuối bảng" aria-label="Thêm dòng" onClick={() => chen(dong[dong.length - 1] ?? null)}>
                    <Icon n="plus" className="ic sm" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody ref={bang}>
              {hien.map((d, i) => {
                const h = MAT_HANG.find(x => x.ma === d.ma)
                const dsDvt = h ? [h.dvt, ...quyDoiTuDanhMuc(h.ten, h.dvt).map(x => x.dv)] : []
                const hs = heSo(d.ma, d.dvt)
                return (
                  <tr key={d.id} data-id={d.id}>
                    <td className="c muted">{i + 1}</td>
                    <td><Select className="inp sm" value={d.kho} onChange={e => sua(d.id, { kho: e.target.value })} ds={DS_KHO} aria-label="Kho" /></td>
                    <td className="code muted">{d.ma}</td>
                    <td><ChonCoTim ds={DS_HANG} value={d.ma} onChange={v => chonHang(d, v)} nhan="Mặt hàng" className="inp sm tkbd-hang" /></td>
                    <td>
                      {h && dsDvt.length > 1
                        ? <Select className="inp sm" value={d.dvt} onChange={e => doiDvt(d, e.target.value)} ds={dsDvt.map(v => ({ v, t: v }))} aria-label="Đơn vị tính" />
                        : <span className="tkbd-dvt">{d.dvt}</span>}
                    </td>
                    <td className="num">
                      <OSoDong val={d.sl} onDoi={sl => sua(d.id, { sl })} nhan="Số lượng" />
                      {h && hs !== 1 && d.sl > 0 && <small className="muted tkbd-qd">= {soQT(Math.round(d.sl * hs * 1000) / 1000)} {h.dvt}</small>}
                    </td>
                    <td className="num"><OSoDong key={`${d.ma}|${d.dvt}`} val={d.gia} onDoi={gia => sua(d.id, { gia })} nhan="Đơn giá" /></td>
                    <td className="num">{d.sl && d.gia ? money(d.sl * d.gia) : ''}</td>
                    <td className="c">
                      <button type="button" className="icon-btn sm" title="Xoá dòng" aria-label="Xoá dòng" onClick={() => xoa(d)}>
                        <Icon n="trash" className="ic sm" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!hien.length && (
                <tr>
                  <td colSpan={9} className="c muted" style={{ padding: 16 }}>
                    {dong.length ? 'Không có dòng khớp bộ lọc. ' : 'Chưa có dòng tồn đầu. '}
                    <button type="button" className="btn sm ghost" onClick={() => chen(null)}><Icon n="plus" className="ic sm" />Thêm dòng</button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="sum">
                <td colSpan={7}>Tổng cộng ({hien.length} dòng)</td>
                <td className="num">{money(tongTien)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
