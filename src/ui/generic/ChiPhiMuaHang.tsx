// Phiếu mua hàng: tab Chi phí mua hàng, nút Phân bổ chia vào từng mặt hàng theo giá trị hàng (T757)
import { Icon } from '../Icon'
import { money } from '../format'
import { OSoGo } from '../OSoGo'
import type { Dong } from './gen'

export type KhoanCp = { ten: string; ncc: string; tien: number; thue: number }

const giaTri = (d: Dong) => Math.max((d.tien || 0) - (d.ck || 0), 0)

/** Chia tổng chi phí theo giá trị hàng (thành tiền trừ chiết khấu); phần lẻ do làm tròn dồn vào dòng giá trị lớn nhất */
export function phanBoCp(dong: Dong[], tong: number): Dong[] {
  const tongGt = dong.reduce((a, d) => a + giaTri(d), 0)
  if (tongGt <= 0) return dong.map(d => ({ ...d, cpMua: 0 }))
  const moi = dong.map(d => ({ ...d, cpMua: Math.round(tong * giaTri(d) / tongGt) }))
  const lon = dong.reduce((k, d, i) => giaTri(d) > giaTri(dong[k]) ? i : k, 0)
  moi[lon].cpMua += tong - moi.reduce((a, d) => a + d.cpMua, 0)
  return moi
}

export function ChiPhiMuaHang({ ds, onChange, dong, onPhanBo, cheDo }: {
  ds: KhoanCp[]
  onChange: (ds: KhoanCp[]) => void
  dong: Dong[]
  onPhanBo: (dong: Dong[]) => void
  cheDo: 'xem' | 'sua'
}) {
  const sua = cheDo === 'sua'
  const tong = ds.reduce((a, c) => a + (c.tien || 0), 0)
  const daChia = dong.reduce((a, d) => a + (d.cpMua || 0), 0)
  // So số đang có với số chia lại: khác nhau là hàng hoặc chi phí đã đổi sau lần phân bổ trước
  const khop = phanBoCp(dong, tong).every((d, i) => d.cpMua === (dong[i].cpMua || 0))
  const trangThai = !tong && !daChia ? '' : khop ? 'Đã phân bổ theo giá trị hàng.'
    : daChia ? 'Hàng hoặc chi phí đã đổi, ấn Phân bổ để chia lại.' : 'Chưa phân bổ, ấn Phân bổ để chia vào từng mặt hàng.'
  const doi = (i: number, patch: Partial<KhoanCp>) => onChange(ds.map((c, k) => k === i ? { ...c, ...patch } : c))

  if (!sua && !ds.length) return <div className="empty" style={{ padding: 32 }}>Phiếu không có chi phí mua hàng</div>
  return (
    <div className="ct-cpm">
      <div className="ct-cpm-dau">Vận chuyển, bốc xếp… ấn Phân bổ để chia vào giá trị nhập kho từng mặt hàng ở tab Chi tiết.</div>
      {ds.length > 0 && (
        <div className="tbl-wrap">
          <table className={`tbl${sua ? ' bang-sua' : ''}`}>
            <thead>
              <tr>
                <th className="dim" style={{ width: 36 }}>#</th>
                <th>Khoản chi phí</th>
                <th style={{ width: 260 }}>Nhà cung cấp dịch vụ</th>
                <th className="num" style={{ width: 140 }}>Số tiền</th>
                <th className="num" style={{ width: 120 }}>Thuế GTGT</th>
                {sua && <th style={{ width: 44 }} />}
              </tr>
            </thead>
            <tbody>
              {ds.map((c, i) => (
                <tr key={i}>
                  <td className="dim c">{i + 1}</td>
                  <td>{sua ? <input className="inp sm" value={c.ten} placeholder="Vd Phí vận chuyển" aria-label="Khoản chi phí" onChange={e => doi(i, { ten: e.target.value })} /> : c.ten}</td>
                  <td>{sua ? <input className="inp sm" value={c.ncc} placeholder="Tên nhà cung cấp dịch vụ" aria-label="Nhà cung cấp dịch vụ" onChange={e => doi(i, { ncc: e.target.value })} /> : c.ncc || '—'}</td>
                  <td className="num">{sua ? <OSoGo val={c.tien} onChange={tien => doi(i, { tien })} hien={money} /> : money(c.tien)}</td>
                  <td className="num">{sua ? <OSoGo val={c.thue} onChange={thue => doi(i, { thue })} hien={money} /> : money(c.thue)}</td>
                  {sua && (
                    <td className="c">
                      <button type="button" className="icon-btn sm" title="Xoá khoản chi phí" aria-label="Xoá khoản chi phí" onClick={() => onChange(ds.filter((_, k) => k !== i))}>
                        <Icon n="trash" className="ic sm" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="ct-cpm-chan">
        {sua && (
          <button type="button" className="btn sm ghost" onClick={() => onChange([...ds, { ten: '', ncc: '', tien: 0, thue: 0 }])}>
            <Icon n="plus" className="ic sm" />Thêm chi phí
          </button>
        )}
        <span className="ct-cpm-tong">Tổng chi phí <b>{money(tong)}</b></span>
        {sua && (
          <button type="button" className="btn sm pri" disabled={!dong.length || (!tong && !daChia)} onClick={() => onPhanBo(phanBoCp(dong, tong))}>
            Phân bổ
          </button>
        )}
      </div>
      {trangThai && <div className={`ct-cpm-tt${khop ? '' : ' lech'}`}>{trangThai}</div>}
    </div>
  )
}
