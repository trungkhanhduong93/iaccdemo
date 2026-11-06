// Bảng hàng bán gõ tay của chứng từ Bán hàng gói Plus (T753): cùng cột như chi tiết Xuất bán POS, thêm ô gõ
import { useEffect, useRef, useState } from 'react'
import type { Dong } from '../../ui/generic/gen'
import { Select } from '../../ui/Dropdown'
import { HANG } from '../../data/mock'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { OSoGo } from '../../ui/OSoGo'
import { Icon } from '../../ui/Icon'
import { dauThap, money } from '../../ui/format'

const tron = (v: number) => Math.round(v)
const phanTram = (v: number) => (v ? `${v}%` : '0%')

/** Doanh thu trước thuế của dòng = thành tiền − giảm giá − chiết khấu + phí dịch vụ, như Xuất bán POS */
export const dtDong = (d: Dong) => (d.tien || 0) - (d.giam || 0) - (d.ck || 0) + (d.phiDv || 0)

/** Tính lại một dòng: giảm giá tính trên thành tiền, chiết khấu trên tiền sau giảm giá, phí dịch vụ trên tiền sau chiết khấu */
export function tinhDong(d: Dong, sua: Partial<Dong> = {}): Dong {
  const x = { ...d, ...sua }
  const tien = tron((x.sl || 0) * (x.gia || 0))
  // Chỉ tính lại khoản có căn cứ đổi; đổi thuế suất, tên hàng thì giữ nguyên số tiền giảm giá, CK, phí dịch vụ (khỏi lệch vì % đã làm tròn)
  const doiGiam = 'sl' in sua || 'gia' in sua || 'pt' in sua || 'giam' in sua
  const doiCk = doiGiam || 'ptCk' in sua || 'ck' in sua
  const doiPhi = doiCk || 'ptPhiDv' in sua || 'phiDv' in sua
  const giam = sua.giam !== undefined ? sua.giam : doiGiam || d.giam === undefined ? tron(tien * (x.pt || 0) / 100) : d.giam
  const sauGiam = tien - giam
  const ck = sua.ck !== undefined ? sua.ck : doiCk || d.ck === undefined ? tron(sauGiam * (x.ptCk || 0) / 100) : d.ck
  const sauCk = sauGiam - ck
  const phiDv = sua.phiDv !== undefined ? sua.phiDv : doiPhi || d.phiDv === undefined ? tron(sauCk * (x.ptPhiDv || 0) / 100) : d.phiDv
  // gõ thẳng số tiền thì % tính ngược lại cho khớp
  const pt = sua.giam !== undefined ? (tien ? +(giam * 100 / tien).toFixed(2) : 0) : x.pt || 0
  const ptCk = sua.ck !== undefined ? (sauGiam ? +(ck * 100 / sauGiam).toFixed(2) : 0) : x.ptCk || 0
  const ptPhiDv = sua.phiDv !== undefined ? (sauCk ? +(phiDv * 100 / sauCk).toFixed(2) : 0) : x.ptPhiDv || 0
  const kq = { ...x, tien, giam, ck, phiDv, pt, ptCk, ptPhiDv }
  return { ...kq, thue: tron(dtDong(kq) * (x.ts || 0) / 100) }
}

/** Dòng mới từ một mặt hàng trong danh mục */
export function dongTuHang(h: (typeof HANG)[number], sl = 1): Dong {
  return tinhDong({ ma: h.ma, ten: h.ten, dvt: h.dvt, sl, gia: h.gia, tien: 0, ts: h.ts, thue: 0, pt: 0, giam: 0, ptCk: 0, ck: 0, ptPhiDv: 0, phiDv: 0 })
}

type KieuAp = 'pt' | 'tien'
type Khoan = 'ck' | 'phiDv'

/** Áp chiết khấu hoặc phí dịch vụ cả bill xuống mọi dòng: % áp nguyên; số tiền chia theo tiền làm căn cứ của dòng, dòng cuối nhận phần lẻ */
function apKhoan(dong: Dong[], k: Khoan, kieu: KieuAp, gt: number): Dong[] {
  if (kieu === 'pt') return dong.map(d => tinhDong(d, k === 'ck' ? { ptCk: gt } : { ptPhiDv: gt }))
  const can = (d: Dong) => (d.tien || 0) - (d.giam || 0) - (k === 'phiDv' ? d.ck || 0 : 0)
  const tong = dong.reduce((a, d) => a + Math.max(can(d), 0), 0)
  const tran = k === 'ck' ? Math.min(gt, tong) : gt
  const cuoi = dong.reduce((j, d, i) => (can(d) > 0 ? i : j), -1)
  let daChia = 0
  return dong.map((d, i) => {
    const c = Math.max(can(d), 0)
    const v = tong <= 0 || c <= 0 ? 0 : i === cuoi ? tran - daChia : tron(tran * c / tong)
    daChia += v
    return tinhDong(d, k === 'ck' ? { ck: v } : { phiDv: v })
  })
}

function OApKhoan({ ten, kieu, gt, onDoi }: { ten: string; kieu: KieuAp; gt: number; onDoi: (k: KieuAp, v: number) => void }) {
  return (
    <div className="ct-ap-o">
      <span>{ten}</span>
      <div className="ct-ap-kieu" role="group" aria-label={`Cách nhập ${ten.toLowerCase()}`}>
        <button type="button" className={kieu === 'pt' ? 'on' : ''} aria-pressed={kieu === 'pt'} title={`${ten} theo %`} aria-label={`${ten} theo %`} onClick={() => kieu !== 'pt' && onDoi('pt', 0)}>%</button>
        <button type="button" className={kieu === 'tien' ? 'on' : ''} aria-pressed={kieu === 'tien'} title={`${ten} theo số tiền`} aria-label={`${ten} theo số tiền`} onClick={() => kieu !== 'tien' && onDoi('tien', 0)}>đ</button>
      </div>
      <OSoGo key={kieu} val={gt} onChange={v => onDoi(kieu, v)} hien={kieu === 'pt' ? v => String(v).replace('.', dauThap()) : money}
        thapPhan={kieu === 'pt'} max={kieu === 'pt' ? 100 : undefined} className={`inp sm num ${kieu === 'pt' ? 'ct-ap-pt' : 'ct-ap-tien'}`} />
      <span className="ct-ap-dv">{kieu === 'pt' ? '%' : 'đ'}</span>
    </div>
  )
}

/** Ô Chiết khấu, Phí dịch vụ, Thuế GTGT cho cả bill trên thanh tab, áp xuống mọi dòng; như phiếu mua hàng (T492), thêm Phí dịch vụ (T753) */
export function ApDauBangBan({ dong, onChange, an, coThue }: { dong: Dong[]; onChange: (d: Dong[]) => void; an?: boolean; coThue: boolean }) {
  const [ck, setCk] = useState<{ kieu: KieuAp; gt: number }>({ kieu: 'pt', gt: 0 })
  const [phi, setPhi] = useState<{ kieu: KieuAp; gt: number }>({ kieu: 'pt', gt: 0 })
  const [tsDau, setTsDau] = useState<number | null>(null)
  const soDong = useRef(dong.length)
  const tsChung = dong.length && dong.every(d => (d.ts ?? 0) === (dong[0].ts ?? 0)) ? String(dong[0].ts ?? 0) : ''
  const apHet = (ds: Dong[], c = ck, p = phi) => {
    let kq = ds
    if (c.gt) kq = apKhoan(kq, 'ck', c.kieu, c.gt)
    if (p.gt) kq = apKhoan(kq, 'phiDv', p.kieu, p.gt)
    return kq
  }
  const doiCk = (kieu: KieuAp, v: number) => {
    const c = { kieu, gt: kieu === 'pt' ? Math.min(Math.max(v, 0), 100) : Math.max(v, 0) }
    setCk(c)
    onChange(apHet(dong, c))
  }
  const doiPhi = (kieu: KieuAp, v: number) => {
    const p = { kieu, gt: kieu === 'pt' ? Math.min(Math.max(v, 0), 100) : Math.max(v, 0) }
    setPhi(p)
    onChange(apKhoan(dong, 'phiDv', p.kieu, p.gt))
  }
  const apThue = (v: string) => {
    if (v === '') return
    const ts = Number(v)
    setTsDau(ts)
    onChange(dong.map(d => tinhDong(d, { ts })))
  }
  // Thêm, xoá dòng hoặc đổi thành tiền, giảm giá: dòng mới lấy thuế suất đầu bảng, áp lại chiết khấu, phí dịch vụ cả bill cho tổng vẫn đúng
  const khoa = dong.map(d => `${d.tien || 0}-${d.giam || 0}`).join(',')
  useEffect(() => {
    const truoc = soDong.current
    soDong.current = dong.length
    const moi = apHet(tsDau === null || dong.length <= truoc ? dong : dong.map((d, i) => (i < truoc ? d : tinhDong(d, { ts: tsDau }))))
    if (moi.some((d, i) => d.ck !== dong[i].ck || d.phiDv !== dong[i].phiDv || d.ts !== dong[i].ts || d.thue !== dong[i].thue)) onChange(moi)
  }, [khoa])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ct-ap-dau" hidden={an}>
      <OApKhoan ten="Chiết khấu" kieu={ck.kieu} gt={ck.gt} onDoi={doiCk} />
      <OApKhoan ten="Phí dịch vụ" kieu={phi.kieu} gt={phi.gt} onDoi={doiPhi} />
      {coThue && (
        <div className="ct-ap-o">
          <span>Thuế GTGT</span>
          <Select className="inp sm ct-ap-ts" value={tsChung} aria-label="Thuế GTGT áp cho mọi dòng" onChange={e => apThue(e.target.value)}
            ds={[...(tsChung === '' ? [{ v: '', t: 'Nhiều mức' }] : []), { v: '0', t: '0%' }, { v: '5', t: '5%' }, { v: '8', t: '8%' }, { v: '10', t: '10%' }]} />
        </div>
      )}
    </div>
  )
}

export function BangHangBan({ dong, onChange, cheDo, tyLe, giamThue }: {
  dong: Dong[]
  onChange?: (d: Dong[]) => void
  cheDo: 'sua' | 'xem'
  tyLe: boolean                          // GTGT theo % doanh thu: bỏ Thuế suất, Tiền thuế; hiện Giảm thuế GTGT
  giamThue?: (dt: number) => number
}) {
  const sua = cheDo === 'sua' && Boolean(onChange)
  const dat = (i: number, p: Partial<Dong>) => onChange?.(dong.map((d, j) => (j === i ? tinhDong(d, p) : d)))
  const chonHang = (i: number, ma: string) => {
    const h = HANG.find(x => x.ma === ma)
    if (!h) { dat(i, { ma }); return }
    dat(i, { ma: h.ma, ten: h.ten, dvt: h.dvt, gia: h.gia, ts: h.ts })
  }
  const them = () => onChange?.([...dong, dongTuHang(HANG[0])])
  const xoa = (i: number) => onChange?.(dong.filter((_, j) => j !== i))
  const tonKho = (ma: string) => Boolean(HANG.find(h => h.ma === ma)?.tonKho)
  const gt = (d: Dong) => (tyLe && giamThue ? giamThue(dtDong(d)) : 0)

  const o = (v: number, f: (x: number) => void, laPt = false) => sua
    ? <OSoGo val={v} onChange={f} hien={laPt ? String : money} max={laPt ? 100 : undefined} />
    : <span className="num">{laPt ? phanTram(v) : money(v)}</span>
  const tong = (f: (d: Dong) => number) => dong.reduce((a, d) => a + f(d), 0)

  return (
    <div className="bang-sua-wrap bhb">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className="tbl bang-sua">
          <thead>
            <tr>
              <th className="dim" style={{ width: 36 }}>#</th>
              <th style={{ width: 110 }}>Mã hàng</th>
              <th style={{ minWidth: 180 }}>Hàng hoá</th>
              <th style={{ width: 65 }}>ĐVT</th>
              <th className="num" style={{ width: 85 }}>Số lượng</th>
              <th className="num" style={{ width: 105 }}>Đơn giá</th>
              <th className="num" style={{ width: 115 }}>Thành tiền</th>
              <th className="num" style={{ width: 90 }}>Giảm giá (%)</th>
              <th className="num" style={{ width: 110 }}>Tiền giảm giá</th>
              <th className="num" style={{ width: 70 }}>% CK</th>
              <th className="num" style={{ width: 105 }}>Tiền CK</th>
              <th className="num" style={{ width: 105 }}>% Phí dịch vụ</th>
              <th className="num" style={{ width: 105 }}>Phí dịch vụ</th>
              {tyLe && <th className="num" style={{ width: 120 }}>Giảm thuế GTGT</th>}
              <th className="num" style={{ width: 140 }}>Doanh thu trước thuế</th>
              {!tyLe && <th className="num" style={{ width: 80 }}>Thuế suất</th>}
              {!tyLe && <th className="num" style={{ width: 105 }}>Tiền thuế</th>}
              <th className="c" style={{ width: 110 }}>Theo dõi tồn kho</th>
              {sua && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {dong.map((d, i) => (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                <td className="code">
                  {sua ? (
                    <ChonDanhMuc dm="hang" nhan="hàng hoá" coMa chiMa className="inp sm" trong="Chọn" value={d.ma}
                      onChange={v => chonHang(i, v)} ds={HANG.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}` }))} />
                  ) : d.ma}
                </td>
                <td>{sua ? <input className="inp sm" value={d.ten} placeholder="Tên hàng" onChange={e => dat(i, { ten: e.target.value })} /> : d.ten}</td>
                <td>{d.dvt}</td>
                <td className="num">{o(d.sl, sl => dat(i, { sl }))}</td>
                <td className="num">{o(d.gia, gia => dat(i, { gia }))}</td>
                <td className="num">{money(d.tien)}</td>
                <td className="num">{o(d.pt || 0, pt => dat(i, { pt }), true)}</td>
                <td className="num">{o(d.giam || 0, giam => dat(i, { giam }))}</td>
                <td className="num">{o(d.ptCk || 0, ptCk => dat(i, { ptCk }), true)}</td>
                <td className="num">{o(d.ck || 0, ck => dat(i, { ck }))}</td>
                <td className="num">{o(d.ptPhiDv || 0, ptPhiDv => dat(i, { ptPhiDv }), true)}</td>
                <td className="num">{o(d.phiDv || 0, phiDv => dat(i, { phiDv }))}</td>
                {tyLe && <td className="num">{money(gt(d))}</td>}
                <td className="num">{money(dtDong(d))}</td>
                {!tyLe && <td className="num">{d.ts}%</td>}
                {!tyLe && <td className="num">{money(d.thue)}</td>}
                <td className="c"><input type="checkbox" className="o-tich-xem" checked={tonKho(d.ma)} readOnly tabIndex={-1} aria-label="Theo dõi tồn kho" /></td>
                {sua && (
                  <td className="c">
                    <button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => xoa(i)}><Icon n="trash" className="ic sm" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="sum">
              <td colSpan={4}>Tổng cộng ({dong.length} dòng)</td>
              <td className="num">{money(tong(d => d.sl || 0))}</td>
              <td />
              <td className="num">{money(tong(d => d.tien || 0))}</td>
              <td />
              <td className="num">{money(tong(d => d.giam || 0))}</td>
              <td />
              <td className="num">{money(tong(d => d.ck || 0))}</td>
              <td />
              <td className="num">{money(tong(d => d.phiDv || 0))}</td>
              {tyLe && <td className="num">{money(tong(gt))}</td>}
              <td className="num">{money(tong(dtDong))}</td>
              {!tyLe && <td />}
              {!tyLe && <td className="num">{money(tong(d => d.thue || 0))}</td>}
              <td />
              {sua && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
      {sua && (
        <div className="row" style={{ padding: '8px 12px', gap: 10 }}>
          <button type="button" className="btn sm ghost" onClick={them}><Icon n="plus" className="ic sm" />Thêm dòng</button>
          {dong.length > 0 && (
            <button type="button" className="btn sm ghost" onClick={() => onChange?.([])} style={{ color: 'var(--red)' }}>
              <Icon n="trash" className="ic sm" />Xoá hết
            </button>
          )}
        </div>
      )}
    </div>
  )
}
