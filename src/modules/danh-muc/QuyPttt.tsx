// Khối "Phương thức thanh toán từ FABi" trong form Quỹ tiền (T264), như màn Thêm quỹ tiền của FABi:
// mỗi cửa hàng (cửa hàng áp dụng của quỹ) một nhóm, tick các PTTT mà phiếu thu, chi FABi trả bằng PTTT đó vào quỹ này.
// Một PTTT của một cửa hàng chỉ thuộc một quỹ: đã gán quỹ khác thì hiện tên quỹ đó, không tick được. Giá trị form _pttt là danh sách 'mã cửa hàng|mã PTTT'.
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { DS_PTTT, DS_QUY_TIEN_112 } from './data'
import { khoaMap, mapPtttCua } from '../tien/dong-bo-fabi'

export function KhoiPtttQuy({ v, doi }: { v: Record<string, any>; doi: (k: string, val: unknown) => void }) {
  const { s } = useSession()
  const map = mapPtttCua(s)
  const maQuy = String(v.ma ?? '')
  const chon: string[] = Array.isArray(v._pttt) ? v._pttt : []
  const apDung = String(v.cn ?? 'Tất cả')
  const dsCn = apDung === 'Tất cả' || !apDung.trim() ? CUA_HANG : CUA_HANG.filter(c => apDung.split(', ').includes(c.ten))
  const quyKhac = (k: string) => { const q = map[k]; return q && q !== maQuy ? q : undefined }
  const tenQuy = (ma: string) => DS_QUY_TIEN_112.find(q => q.ma === ma)?.ten ?? ma
  const dat = (ds: string[]) => doi('_pttt', ds)
  const doiMot = (k: string) => dat(chon.includes(k) ? chon.filter(x => x !== k) : [...chon, k])

  if (!dsCn.length) return <div className="qp-trong">Chọn cửa hàng áp dụng để gán phương thức thanh toán.</div>
  return (
    <div className="qp">
      <p className="qp-goi-y">Phiếu thu, chi lập trên FABi trả bằng phương thức đã tick sẽ vào quỹ này khi bật đồng bộ ở Cấu hình kế toán.</p>
      {dsCn.map(c => {
        const khoa = DS_PTTT.map(p => khoaMap(c.id, p.ma))
        const duoc = khoa.filter(k => !quyKhac(k))
        const tatCa = duoc.length > 0 && duoc.every(k => chon.includes(k))
        return (
          <section key={c.id} className="qp-cn">
            <label className="qp-cn-dau">
              <input type="checkbox" checked={tatCa} disabled={!duoc.length}
                onChange={() => dat(tatCa ? chon.filter(k => !duoc.includes(k)) : [...new Set([...chon, ...duoc])])} />
              <b>{c.ten}</b>
              <small>{khoa.filter(k => chon.includes(k)).length}/{DS_PTTT.length} phương thức</small>
            </label>
            <div className="qp-ds">
              {DS_PTTT.map(p => {
                const k = khoaMap(c.id, p.ma)
                const khac = quyKhac(k)
                return (
                  <label key={k} className={`qp-pt${khac ? ' khoa' : ''}`} title={khac ? `Đã gán vào ${tenQuy(khac)}` : undefined}>
                    <input type="checkbox" checked={!khac && chon.includes(k)} disabled={Boolean(khac)} onChange={() => doiMot(k)} />
                    <span>{p.ten}</span>
                    {khac && <small>{tenQuy(khac)}</small>}
                  </label>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
