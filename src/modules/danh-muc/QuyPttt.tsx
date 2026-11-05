// Khối "Phương thức thanh toán từ FABi" trong form Quỹ tiền (T264), như màn Thêm quỹ tiền của FABi:
// mỗi cửa hàng (cửa hàng áp dụng của quỹ) một nhóm, tick các PTTT mà phiếu thu, chi FABi trả bằng PTTT đó vào quỹ này.
// Một PTTT của một cửa hàng chỉ thuộc một quỹ: đã gán quỹ khác thì hiện tên quỹ đó, không tick được. Giá trị form _pttt là danh sách 'mã cửa hàng|mã PTTT'.
// Gói Standard, Plus: đầu mỗi nhóm cửa hàng có thêm ô số dư ban đầu chia theo cửa hàng, cuối khối là dòng tổng (T750).
import type { ChangeEvent } from 'react'
import { useSession } from '../../app/session'
import { money } from '../../ui/format'
import { DS_PTTT, DS_QUY_TIEN_112 } from './data'
import { chiaTheoForm, cnCuaQuy, docTien } from './ChiaSoDuQuy'
import { khoaMap, mapPtttCua } from '../tien/dong-bo-fabi'

export function KhoiPtttQuy({ v, doi, xem = false, soDu = false }: { v: Record<string, any>; doi: (k: string, val: unknown) => void; xem?: boolean; soDu?: boolean }) {
  const { s } = useSession()
  const map = mapPtttCua(s)
  const maQuy = String(v.ma ?? '')
  const chon: string[] = Array.isArray(v._pttt) ? v._pttt : []
  const dsCn = cnCuaQuy(v)
  const quyKhac = (k: string) => { const q = map[k]; return q && q !== maQuy ? q : undefined }
  const tenQuy = (ma: string) => DS_QUY_TIEN_112.find(q => q.ma === ma)?.ten ?? ma
  const dat = (ds: string[]) => doi('_pttt', ds)
  const doiMot = (k: string) => dat(chon.includes(k) ? chon.filter(x => x !== k) : [...chon, k])

  // Số dư ban đầu chia theo cửa hàng ở đầu mỗi nhóm (T750): chỉ khi quỹ dùng từ 2 cửa hàng
  const chia = soDu ? chiaTheoForm(v) : null
  // Gõ số một cửa hàng: giữ số mọi cửa hàng, ô tổng tự cộng lại (hook doi của danh mục 1.12)
  const goSd = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    if (chia) doi('_suaCn', { ...chia, [id]: docTien(e.target.value) })
  }

  if (!dsCn.length) return <div className="qp-trong">Chọn cửa hàng áp dụng để gán phương thức thanh toán.</div>
  return (
    <div className="qp">
      {chia && <p className="qp-goi-y"><b>Số dư:</b> nhập tổng ở trên thì tự chia đều; sửa số từng cửa hàng thì tổng tự cộng lại.</p>}
      <p className="qp-goi-y"><b>Phương thức thanh toán:</b> phiếu thu, chi FABi trả bằng phương thức đã tick sẽ vào quỹ này.</p>
      {dsCn.map(c => {
        const khoa = DS_PTTT.map(p => khoaMap(c.id, p.ma))
        const duoc = khoa.filter(k => !quyKhac(k))
        const tatCa = duoc.length > 0 && duoc.every(k => chon.includes(k))
        const dau = (
          <label className="qp-cn-dau">
            <input type="checkbox" checked={tatCa} disabled={!duoc.length}
              onChange={() => dat(tatCa ? chon.filter(k => !duoc.includes(k)) : [...new Set([...chon, ...duoc])])} />
            <span className="qp-cn-ten">
              <b>{c.ten}</b>
              <small>{khoa.filter(k => chon.includes(k)).length}/{DS_PTTT.length} phương thức</small>
            </span>
          </label>
        )
        return (
          <section key={c.id} className="qp-cn">
            {chia ? (
              <div className="qp-cn-hang">
                {dau}
                <div className="qp-sd">
                  <span>Số dư</span>
                  {xem ? <b>{money(chia[c.id])}</b>
                    : <input inputMode="numeric" value={money(chia[c.id])} onChange={goSd(c.id)} aria-label={`Số dư ban đầu ${c.ten}`} />}
                </div>
              </div>
            ) : dau}
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
