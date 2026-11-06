// Bảng hàng bán gõ tay của chứng từ Bán hàng gói Plus (T753): cùng cột như chi tiết Xuất bán POS, thêm ô gõ
import type { Dong } from '../../ui/generic/gen'
import { HANG } from '../../data/mock'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { OSoGo } from '../../ui/OSoGo'
import { Icon } from '../../ui/Icon'
import { money } from '../../ui/format'

const tron = (v: number) => Math.round(v)
const phanTram = (v: number) => (v ? `${v}%` : '0%')

/** Doanh thu trước thuế của dòng = thành tiền − giảm giá − chiết khấu + phí dịch vụ, như Xuất bán POS */
export const dtDong = (d: Dong) => (d.tien || 0) - (d.giam || 0) - (d.ck || 0) + (d.phiDv || 0)

/** Tính lại một dòng: giảm giá tính trên thành tiền, chiết khấu trên tiền sau giảm giá, phí dịch vụ trên tiền sau chiết khấu */
export function tinhDong(d: Dong, sua: Partial<Dong> = {}): Dong {
  const x = { ...d, ...sua }
  const tien = tron((x.sl || 0) * (x.gia || 0))
  const giam = sua.giam !== undefined ? sua.giam : tron(tien * (x.pt || 0) / 100)
  const sauGiam = tien - giam
  const ck = sua.ck !== undefined ? sua.ck : tron(sauGiam * (x.ptCk || 0) / 100)
  const sauCk = sauGiam - ck
  const phiDv = sua.phiDv !== undefined ? sua.phiDv : tron(sauCk * (x.ptPhiDv || 0) / 100)
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
