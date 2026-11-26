// Chi phí hoạt động trong tháng theo lý do chi trên điện thoại (T240, T945): mở từ thẻ Chi phí hoạt động ở trang chủ Standard.
// Cùng số liệu với bản web: cộng từ phiếu chi thật có lý do là chi phí (T483).
// Bấm một dòng mở ngay bên dưới các phiếu chi tiền mặt, ngân hàng của lý do đó, không sang phân hệ Thu chi
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import { usePhieuChiPhi } from '../../modules/home/chiPhiPhieu'
import { duLieuTongChiPhi } from '../../modules/home/ChiPhiThang'
import { TheTongChiPhi } from '../../modules/home/TheTongChiPhi'
import { MChon } from './MChon'

export function MChiPhiThang(_: ScreenProps) {
  const { s } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const cns = cn ? [cn.id] : CUA_HANG.map(c => c.id)
  const { cpThang, ds, soPhieu, dt, tyLe, cachTinh } = duLieuTongChiPhi(phieu, thang, cns)
  const [mo, setMo] = useState<string | null>(null)   // lý do đang mở danh sách phiếu
  const [chonLoai, setChonLoai] = useState(false)   // tấm chọn chi tiền mặt hay chi ngân hàng
  const nav = useNavigate()

  return (
    <div className="m-standard-cpt">
      <TheTongChiPhi
        nhan="Tổng chi phí hoạt động"
        tien={cpThang}
        phu={`Cộng phiếu chi tiền mặt, ngân hàng có lý do là chi phí · ${soPhieu} phiếu chi`}
        tyLe={tyLe}
        dt={dt}
        cachTinh={cachTinh}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <b style={{ fontSize: 14 }}>Theo lý do chi</b>
        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{soPhieu} phiếu chi</span>
      </div>

      <div className="m-standard-cpt-ds">
        {ds.map(x => {
          const dangMo = mo === x.ly
          return (
            <div key={x.ly} className={`m-standard-cpt-nhom${dangMo ? ' mo' : ''}`}>
              <button type="button" className="m-standard-cpt-dong" aria-expanded={dangMo} onClick={() => setMo(dangMo ? null : x.ly)}>
                <div className="m-standard-cpt-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="m-standard-cpt-ten">{x.ly}</span>
                    <span className="m-standard-cpt-tien">{moneyD(x.v)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="m-standard-cpt-phu">{x.so} phiếu chi</span>
                    <span className="m-standard-cpt-phantram">{pct(cpThang ? x.v / cpThang : 0)} chi phí</span>
                  </div>
                </div>
                <Icon n={dangMo ? 'chevd' : 'chevr'} className="ic sm m-standard-cpt-mui" />
              </button>
              {dangMo && (
                <div className="m-standard-cpt-phieu">
                  {x.phieu.map(p => (
                    <div key={`${p.man ?? ''}${p.id}`} className="m-standard-cpt-phieu-dong">
                      <div className="m-standard-cpt-phieu-trai">
                        <b>{p.so}</b>
                        <span>{p.ngay} · {p.nhom === 'cn' ? 'Hoá đơn mua' : p.nhom === 'nh' ? 'Ngân hàng' : 'Tiền mặt'}{cn ? '' : ` · ${p.cn}`}</span>
                        <span>{p.dienGiai}</span>
                      </div>
                      <b className="m-standard-cpt-phieu-tien">{moneyD(p.tien)}</b>
                    </div>
                  ))}
                  <div className="m-standard-cpt-phieu-dong tong"><span>Cộng {x.so} phiếu</span><b className="m-standard-cpt-phieu-tien">{moneyD(x.v)}</b></div>
                </div>
              )}
            </div>
          )
        })}
        {!ds.length && <p className="m-standard-cpt-phu">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>}
      </div>

      <div className="m-standard-day-nut">
        <button type="button" className="m-standard-nut-chinh" onClick={() => setChonLoai(true)}>
          <Icon n="plus" className="ic sm" />
          <span>Lập phiếu chi</span>
        </button>
      </div>
      {/* Chọn chi tiền mặt hay chi ngân hàng, không mặc định tiền mặt (T483) */}
      <MChon mo={chonLoai} onDong={() => setChonLoai(false)} tieuDe="Lập phiếu chi" ds={[{ k: 'chi', ten: 'Chi tiền mặt' }, { k: 'unc', ten: 'Chi ngân hàng' }]}
        onChon={k => nav(`/app/tien/2-1-1/moi?loai=${k}`)} />
    </div>
  )
}
