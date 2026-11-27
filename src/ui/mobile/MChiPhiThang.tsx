// Chi phí hoạt động trong tháng theo lý do chi trên điện thoại (T240, T945): mở từ thẻ Chi phí hoạt động ở trang chủ Standard.
// Cùng số liệu với bản web: cộng từ phiếu chi thật có lý do là chi phí (T483).
// Bấm một lý do sang màn chi tiết lý do (?ly=, nút về của thanh trên quay lại): thẻ tổng, chip lọc, danh sách phiếu chi (T954)
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import { type PhieuChiPhi, usePhieuChiPhi } from '../../modules/home/chiPhiPhieu'
import { duLieuTongChiPhi } from '../../modules/home/ChiPhiThang'
import { TheTongChiPhi } from '../../modules/home/TheTongChiPhi'
import { MChon } from './MChon'

export function MChiPhiThang(_: ScreenProps) {
  const { s } = useSession()
  const [tham, setTham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const cns = cn ? [cn.id] : CUA_HANG.map(c => c.id)
  const { cpThang, ds, soPhieu, dt, tyLe, cachTinh } = duLieuTongChiPhi(phieu, thang, cns)
  const lyDo = ds.find(x => x.ly === tham.get('ly'))   // lý do đang xem ở màn chi tiết (T954)
  const [loai, setLoai] = useState<PhieuChiPhi['nhom'] | ''>('')   // chip lọc phiếu: '' là Tất cả
  const [chonLoai, setChonLoai] = useState(false)   // tấm chọn chi tiền mặt hay chi ngân hàng
  const nav = useNavigate()

  // Đẩy ?ly= vào lịch sử (không replace) để nút về trên thanh trên quay lại danh sách lý do
  const moLyDo = (ly: string) => {
    setLoai('')
    setTham(p => { const n = new URLSearchParams(p); n.set('ly', ly); return n })
  }

  const nutLap = (
    <>
      <div className="m-standard-day-nut">
        <button type="button" className="m-standard-nut-chinh" onClick={() => setChonLoai(true)}>
          <Icon n="plus" className="ic sm" />
          <span>Lập phiếu chi</span>
        </button>
      </div>
      {/* Chọn chi tiền mặt hay chi ngân hàng, không mặc định tiền mặt (T483) */}
      <MChon mo={chonLoai} onDong={() => setChonLoai(false)} tieuDe="Lập phiếu chi" ds={[{ k: 'chi', ten: 'Chi tiền mặt' }, { k: 'unc', ten: 'Chi ngân hàng' }]}
        onChon={k => nav(`/app/tien/2-1-1/moi?loai=${k}`)} />
    </>
  )

  if (lyDo) {
    const dem = (n: PhieuChiPhi['nhom']) => lyDo.phieu.filter(p => p.nhom === n).length
    const tach = [
      { k: 'tm' as const, ten: 'Tiền mặt', nhan: 'Chi tiền mặt', tien: lyDo.tm },
      { k: 'nh' as const, ten: 'Ngân hàng', nhan: 'Chi ngân hàng', tien: lyDo.nh },
      ...(lyDo.cn ? [{ k: 'cn' as const, ten: 'Hoá đơn mua', nhan: 'Hoá đơn mua hàng', tien: lyDo.cn }] : []),
    ]
    const dsPhieu = loai ? lyDo.phieu.filter(p => p.nhom === loai) : lyDo.phieu
    return (
      <div className="m-standard-cpt">
        <p className="m-cpt-ly-phu">Chi phí hoạt động {thang}/2026 · {cn ? cn.ten : 'Tất cả cửa hàng'}</p>
        <div className="m-cpt-ly-the">
          <span className="m-cpt-ly-nhan">Tổng tiền lý do chi</span>
          <b className="m-cpt-ly-so">{moneyD(lyDo.v)}</b>
          <span className="m-cpt-ly-nhan">{lyDo.so} phiếu chi · <b className="m-cpt-ly-tl">{pct(cpThang ? lyDo.v / cpThang : 0)}</b> tổng chi phí hoạt động</span>
          <div className="m-cpt-ly-tach">
            {tach.map(t => <div key={t.k}><span>{t.nhan} · {dem(t.k)} phiếu</span><span>{moneyD(t.tien)}</span></div>)}
          </div>
        </div>

        <div className="m-cpt-ly-chip" role="group" aria-label="Lọc phiếu theo loại chi">
          {[{ k: '' as const, ten: 'Tất cả', so: lyDo.so }, ...tach.map(t => ({ k: t.k, ten: t.ten, so: dem(t.k) }))].map(c => (
            <button key={c.k} type="button" className={loai === c.k ? 'on' : ''} aria-pressed={loai === c.k} onClick={() => setLoai(c.k)}>{c.ten} {c.so}</button>
          ))}
        </div>

        <div className="m-cpt-ly-ds">
          {dsPhieu.map(p => (
            <Link key={`${p.man ?? ''}${p.id}`} className="m-cpt-ly-phieu" to={`/app/${p.man ?? 'tien/2-1-1'}/${p.id}`}>
              <div className="m-standard-cpt-phieu-trai">
                <div className="m-cpt-ly-hang"><b>{p.so}</b><b className="m-standard-cpt-phieu-tien">{moneyD(p.tien)}</b></div>
                <span>{p.ngay} · {p.nhom === 'cn' ? 'Hoá đơn mua' : p.nhom === 'nh' ? 'Ngân hàng' : 'Tiền mặt'}{cn ? '' : ` · ${p.cn}`}</span>
                <span className="m-cpt-ly-dg">{p.dienGiai}</span>
              </div>
              <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
            </Link>
          ))}
          {!dsPhieu.length && <p className="m-standard-cpt-phu">Không có phiếu chi nào.</p>}
        </div>
        <span className="m-cpt-ly-goi-y">Bấm phiếu để mở phiếu chi</span>
        {nutLap}
      </div>
    )
  }

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
        {ds.map(x => (
          <button key={x.ly} type="button" className="m-standard-cpt-dong" onClick={() => moLyDo(x.ly)}>
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
            <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
          </button>
        ))}
        {!ds.length && <p className="m-standard-cpt-phu">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>}
      </div>

      {nutLap}
    </div>
  )
}
