// Phiếu chi, UNC gói Standard lý do Thanh toán công nợ nhà cung cấp (T718): tab Chi tiết là danh sách phiếu mua còn nợ của nhà cung cấp
// ở cửa hàng lập phiếu. Tích phiếu nào thì trả phiếu đó, số Thanh toán mặc định bằng công nợ, sửa được nhưng không vượt công nợ
import type { Row } from '../../modules/types'
import { PHIEU_MUA } from '../../modules/mua-hang/bao-cao'
import { money } from '../format'
import { apKhoPhieu, ghiNhatKy, soDaTra, suaPhieu, type CtTt, type PhieuTt } from './daXoa'
import { chungTu } from './gen'

export const MAN_MUA = 'mua-hang/4-1-1'

/** Một phiếu mua được chọn trả trong phiếu chi, lưu ở _traNo của phiếu chi */
export interface TraNo { id: string; so: string; ngay: string; tong: number; da: number; tien: number }

const ngaySo = (d: string) => d.split(/[/ ]/).slice(0, 3).reverse().join('')

/** Phiếu mua của nhà cung cấp ở cửa hàng còn nợ, cũ trước mới sau. Số đã trả không tính phần phiếu chi đang mở đã trả (idChi) */
export function phieuMuaConNo(ncc: string, cn: string, idChi?: string): TraNo[] {
  if (!ncc) return []
  return apKhoPhieu(MAN_MUA, chungTu(PHIEU_MUA, '4.1.1'))
    .filter(r => r.doiTuong === ncc && r.cn === cn)
    .map((r: Row) => {
      const tong = Number(r.tong) || 0
      const cuaChi = ((r._dsTt as PhieuTt[] | undefined) ?? []).filter(c => c.id === idChi).reduce((a, c) => a + c.tien, 0)
      const da = Math.max(0, soDaTra(r) - cuaChi)
      return { id: String(r.id), so: String(r.so), ngay: String(r.ngay).split(' ')[0], tong, da, tien: 0 }
    })
    .filter(x => x.tong - x.da > 0)
    .sort((a, b) => ngaySo(a.ngay).localeCompare(ngaySo(b.ngay)) || a.so.localeCompare(b.so))
}

/** Lưu phiếu chi: mỗi phiếu mua đã chọn ghi phiếu chi vào _dsTt (thay phần cũ của chính phiếu chi), phiếu mua bỏ chọn thì gỡ ra */
export function ghiTraNo(chi: CtTt, cu: TraNo[], moi: TraNo[], ai: string) {
  const ds = apKhoPhieu(MAN_MUA, chungTu(PHIEU_MUA, '4.1.1'))
  for (const id of new Set([...cu, ...moi].map(x => x.id))) {
    const r = ds.find(x => String(x.id) === id)
    if (!r) continue
    const m = moi.find(x => x.id === id)
    const khac = ((r._dsTt as PhieuTt[] | undefined) ?? []).filter(c => c.id !== chi.id)
    suaPhieu(MAN_MUA, id, { _dsTt: m ? [...khac, { ...chi, tien: m.tien }] : khac })
    if (m && cu.find(x => x.id === id)?.tien !== m.tien) ghiNhatKy(MAN_MUA, id, String(r.so), ai, `Thanh toán ${money(m.tien)} bằng ${chi.so}`)
  }
}

export function BangTraNoNcc({ ncc, ds, chon, onChange, cheDo }: {
  ncc: string; ds: TraNo[]; chon: TraNo[]; onChange: (v: TraNo[]) => void; cheDo: 'sua' | 'xem'
}) {
  const sua = cheDo === 'sua'
  // Xem phiếu đã lưu: chỉ các phiếu đã trả, số liệu lúc lưu. Sửa: mọi phiếu còn nợ, phiếu đã chọn giữ số đang nhập
  const dong = sua ? ds.map(x => chon.find(c => c.id === x.id) ?? x) : chon
  const daChon = (id: string) => chon.some(c => c.id === id)
  const doi = (x: TraNo, tien: number | null) => {
    const ngoai = chon.filter(c => c.id !== x.id)
    if (tien === null) { onChange(ngoai); return }
    const moi = { ...x, tien: Math.min(Math.max(0, tien), x.tong - x.da) }
    onChange(ds.filter(d => d.id === x.id || daChon(d.id)).map(d => d.id === x.id ? moi : ngoai.find(c => c.id === d.id)!))
  }
  const tatCa = sua && ds.length > 0 && ds.every(x => daChon(x.id))
  const tong = (f: (x: TraNo) => number) => dong.reduce((a, x) => a + f(x), 0)

  if (!ncc) return <div className="empty tra-no-trong">Chọn nhà cung cấp ở phần trên để hiện các phiếu mua còn nợ</div>
  if (!dong.length) return <div className="empty tra-no-trong">{sua ? `${ncc} không còn phiếu mua nào chưa thanh toán ở cửa hàng này` : 'Phiếu chưa chọn phiếu mua nào'}</div>
  return (
    <div className="tbl-wrap tra-no" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            {sua && (
              <th className="tra-no-chon">
                <input type="checkbox" checked={tatCa} aria-label="Chọn tất cả phiếu mua"
                  onChange={e => onChange(e.target.checked ? ds.map(x => daChon(x.id) ? chon.find(c => c.id === x.id)! : { ...x, tien: x.tong - x.da }) : [])} />
              </th>
            )}
            <th>Mã chứng từ</th>
            <th>Ngày chứng từ</th>
            <th className="num">Giá trị đơn</th>
            <th className="num">Đã thanh toán</th>
            <th className="num">Công nợ</th>
            <th className="num tra-no-tt">Thanh toán</th>
          </tr>
        </thead>
        <tbody>
          {dong.map(x => {
            const co = daChon(x.id)
            return (
              <tr key={x.id} className={co && sua ? 'on' : undefined}>
                {sua && (
                  <td className="tra-no-chon">
                    <input type="checkbox" checked={co} aria-label={`Chọn ${x.so}`} onChange={e => doi(x, e.target.checked ? x.tong - x.da : null)} />
                  </td>
                )}
                <td className="code">{x.so}</td>
                <td>{x.ngay}</td>
                <td className="num">{money(x.tong)}</td>
                <td className="num">{money(x.da)}</td>
                <td className="num">{money(x.tong - x.da)}</td>
                <td className="num tra-no-tt">
                  {sua
                    ? <input className="inp num" value={co ? money(x.tien) : ''} placeholder="0" aria-label={`Thanh toán ${x.so}`}
                        onChange={e => { const v = Number(e.target.value.replace(/\D/g, '')) || 0; doi(x, v > 0 ? v : null) }} />
                    : money(x.tien)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="sum">
            {sua && <td />}
            <td colSpan={2}>Tổng</td>
            <td className="num">{money(tong(x => x.tong))}</td>
            <td className="num">{money(tong(x => x.da))}</td>
            <td className="num">{money(tong(x => x.tong - x.da))}</td>
            <td className="num tra-no-tt">{money(chon.reduce((a, x) => a + x.tien, 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
