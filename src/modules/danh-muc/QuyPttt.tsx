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
  const sua: Record<string, number> = v._suaCn ?? {}
  const tong = docTien(v.soDu)
  const daChia = chia ? Object.values(chia).reduce((a, x) => a + x, 0) : 0
  const goSd = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d-]/g, '')
    if (raw === '' || raw === '-') { const { [id]: _, ...con } = sua; doi('_suaCn', con); return }
    doi('_suaCn', { ...sua, [id]: Number(raw) })
  }

  if (!dsCn.length) return <div className="qp-trong">Chọn cửa hàng áp dụng để gán phương thức thanh toán.</div>
  return (
    <div className="qp">
      <p className="qp-goi-y">
        {chia && 'Số dư ban đầu tự chia đều cho các cửa hàng; sửa số dư cửa hàng nào thì phần còn lại chia cho các cửa hàng khác. '}
        Phiếu thu, chi lập trên FABi trả bằng phương thức đã tick sẽ vào quỹ này khi bật đồng bộ ở Cấu hình kế toán.
      </p>
      {dsCn.map(c => {
        const khoa = DS_PTTT.map(p => khoaMap(c.id, p.ma))
        const duoc = khoa.filter(k => !quyKhac(k))
        const tatCa = duoc.length > 0 && duoc.every(k => chon.includes(k))
        const dau = (
          <label className="qp-cn-dau">
            <input type="checkbox" checked={tatCa} disabled={!duoc.length}
              onChange={() => dat(tatCa ? chon.filter(k => !duoc.includes(k)) : [...new Set([...chon, ...duoc])])} />
            <b>{c.ten}</b>
            <small>{khoa.filter(k => chon.includes(k)).length}/{DS_PTTT.length} phương thức</small>
          </label>
        )
        return (
          <section key={c.id} className="qp-cn">
            {chia ? (
              <div className="qp-cn-hang">
                {dau}
                <div className={`qp-sd${sua[c.id] !== undefined ? ' da-sua' : ''}`}>
                  <span>{sua[c.id] !== undefined ? 'Số dư (đã sửa)' : 'Số dư'}</span>
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
      {chia && (
        <div className={`qp-sd-tong${daChia !== tong ? ' lech' : ''}`}>
          <span>Tổng số dư đã chia <b>{money(daChia)}</b>{daChia !== tong && ` · lệch ${money(daChia - tong)} đ so với số dư ban đầu`}</span>
          {!xem && Object.keys(sua).length > 0 && <button type="button" className="qp-chia-lai" onClick={() => doi('_suaCn', {})}>Chia đều lại</button>}
        </div>
      )}
    </div>
  )
}
