// Thẻ tổng dùng chung màn Chi phí NVL, Chi phí hoạt động mở từ Trang chủ (T945, QD118): số to, % trên doanh thu,
// mục Cách tính gồm vài ô cố định. Máy tính xếp ô ngang; điện thoại (.m-standard-cpt) xếp dòng, dấu + − một cột riêng cho thẳng hàng.
import type { ReactNode } from 'react'
import { moneyD, pct } from '../../ui/format'

/** Một ô của mục Cách tính.
 *  so bỏ trống: ô chỉ có mô tả (phu), vd mô tả phương pháp tổng mua trong tháng.
 *  vien: ô phụ viền đứt; rong: chiếm 2 cột trên máy tính; anDt: ẩn trên điện thoại (vd Số lý do chi) */
export interface OCachTinh { dau?: '+' | '−'; nhan: string; so?: ReactNode; phu?: ReactNode; vien?: boolean; rong?: boolean; anDt?: boolean }

export function TheTongChiPhi({ nhan, tien, phu, tyLe, dt, cachTinh }: {
  nhan: string; tien: number; phu: ReactNode; tyLe: number; dt: number; cachTinh: OCachTinh[]
}) {
  return (
    <section className="ttcp">
      <div className="ttcp-dau">
        <div className="ttcp-trai">
          <span className="ttcp-nhan">{nhan}</span>
          <b className="ttcp-so">{moneyD(tien)}</b>
          <span className="ttcp-phu">{phu}</span>
        </div>
        <div className="ttcp-phai"><b>{pct(tyLe)}</b><span>trên doanh thu {moneyD(dt)}</span></div>
      </div>
      <div className="ttcp-cach">
        <span className="ttcp-tieu">Cách tính</span>
        <div className="ttcp-hang">
          {cachTinh.map((o, i) => (
            <div key={i} className={['ttcp-o', o.vien && 'vien', o.rong && 'rong', o.anDt && 'an-dt', o.so == null && 'mota'].filter(Boolean).join(' ')}>
              <i className={o.dau === '+' ? 'cong' : o.dau === '−' ? 'tru' : undefined}>{o.dau ?? ''}</i>
              <span className="ttcp-o-nhan">{o.nhan}</span>
              {o.so != null && <b className="ttcp-o-so">{typeof o.so === 'number' ? moneyD(o.so) : o.so}</b>}
              {o.phu && <small className="ttcp-o-phu">{o.phu}</small>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
