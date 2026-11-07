// Chi phí NVL trong tháng gói Free trên điện thoại (T394): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ.
// Cách tính chung cả công ty, đổi ở Thông tin đơn vị như web (T767): kiểm kê định kỳ hoặc tổng chi phí mua hàng trong tháng.
// Xem mọi cửa hàng: danh sách từng cửa hàng, bấm dòng đổi luôn cửa hàng trên thanh đầu (T611).
// Xem một cửa hàng: các số của công thức và phiếu mua hàng trong tháng.
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import { CACH_NVL, DI_DOI_CACH_NVL, daKhoaThang, moTaCach, nvlKy, phieuMuaKy } from '../../modules/home/chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function MChiPhiNvl(_: ScreenProps) {
  const { s, set } = useSession()
  const [tham, setTham] = useSearchParams()
  const thang = THANG.includes(Number(tham.get('thang'))) ? Number(tham.get('thang')) : 10
  const cnThanh = cuaHangHienTai(s)
  const cn = cnThanh ?? CUA_HANG.find(c => c.id === tham.get('cn'))

  const doi = (p: Record<string, string | undefined>) => {
    const n = new URLSearchParams(tham)
    Object.entries(p).forEach(([k, v]) => (v === undefined ? n.delete(k) : n.set(k, v)))
    setTham(n, { replace: true })
  }

  const tong = nvlKy(s, cn ? [cn.id] : [], thang)
  const kk = tong.cach === 'kk'
  const dt = tong.ds.reduce((a, x) => a + x.dt, 0)
  const khoa = daKhoaThang(thang)

  return (
    <div className="m-standard-cpt">
      {/* Thẻ tổng ở đầu */}
      <div className="m-standard-cpt-tong-the">
        <div className="m-standard-cpt-tong-nhan">
          Tổng chi phí NVL tháng {thang}/2026{cn ? ` · ${cn.ten}` : ''}
          <small className="m-standard-cpt-tong-phu">
            {moTaCach(tong.cach)} · {pct(dt ? tong.tien / dt : 0)} doanh thu
          </small>
        </div>
        <div className="m-standard-cpt-tong-so">{moneyD(tong.tien)}</div>
        {kk && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            = Tồn đầu <b>{moneyD(tong.tonDau)}</b> + Mua <b>{moneyD(tong.mua)}</b> − Tồn cuối <b>{moneyD(tong.tonCuoi)}</b>
          </div>
        )}
      </div>

      {/* Dòng cách tính như web: tên, mô tả, nút Đổi cách tính mở Thông tin đơn vị */}
      <div className="m-nvl-cach">
        <span className="m-nvl-cach-chu">
          Phương pháp tính chi phí NVL chung cả công ty: <b>{CACH_NVL[tong.cach].ten}</b> · {CACH_NVL[tong.cach].mota}
        </span>
        <Link to={DI_DOI_CACH_NVL} className="btn sm ghost m-nvl-cach-nut">Đổi cách tính</Link>
        {cn && !cnThanh && (
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => doi({ cn: undefined })}
            style={{ fontSize: 12, padding: '4px 8px' }}
          >
            Mọi cửa hàng
          </button>
        )}
      </div>
      {/* mở form phiếu kiểm kê mới như web (T768) */}
      <Link to="/app/kho/5-1-10/moi" className="m-tcf-nut-vien chu-xanh">
        <Icon n="clipboard" className="ic sm" kieu="net" />
        <span>Kiểm kê ngay</span>
      </Link>
      {khoa && (
        <div className="m-nvl-ghi">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</div>
      )}

      {/* Khi chưa chọn cửa hàng: danh sách cửa hàng */}
      {!cn && (
        <div className="m-standard-cpt-ds">
          {tong.ds.map(d => (
            <div
              key={d.cn}
              className="m-standard-cpt-dong"
              onClick={() => set({ cuaHang: d.cn })}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="m-standard-cpt-ic">
                <Icon n="khohang" className="ic sm" />
              </div>
              <div className="m-standard-cpt-info">
                <div className="m-standard-cpt-ten">{d.ten}</div>
                <div className="m-standard-cpt-phu">
                  {kk ? `Tồn đầu ${moneyD(d.tonDau ?? 0)} · Mua ${moneyD(d.mua)} · Tồn cuối ${moneyD(d.tonCuoi ?? 0)}` : `Mua ${moneyD(d.mua)}`}
                </div>
              </div>
              <div className="m-standard-cpt-so">
                <div className="m-standard-cpt-tien">{moneyD(d.tien)}</div>
                <div className="m-standard-cpt-phantram">{pct(d.dt ? d.tien / d.dt : 0)} DT</div>
              </div>
              <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
            </div>
          ))}
        </div>
      )}

      {/* Khi đã chọn một cửa hàng: phiếu mua hàng trong tháng */}
      {cn && (
        <>
          <div className="m-standard-cpt-ds">
            {phieuMuaKy(cn.id, thang).map(r => (
              <div key={r.so} className="m-standard-cpt-dong">
                <div className="m-standard-cpt-ic">
                  <Icon n="truck" className="ic sm" />
                </div>
                <div className="m-standard-cpt-info">
                  <div className="m-standard-cpt-ten">{r.so}</div>
                  <div className="m-standard-cpt-phu">{r.ngay} · {r.doiTuong}</div>
                </div>
                <div className="m-standard-cpt-so">
                  <div className="m-standard-cpt-tien">{moneyD(Number(r.tong))}</div>
                  <div className="m-standard-cpt-phantram">{moneyD(Number(r.tien))} tiền hàng</div>
                </div>
              </div>
            ))}
          </div>
          <div className="m-standard-day-nut">
            <Link to="/app/mua-hang/4-1-1" className="m-standard-nut-chinh">
              <Icon n="truck" className="ic sm" />
              <span>Xem danh sách phiếu mua hàng</span>
            </Link>
          </div>
          {kk && (
            <div className="m-nvl-ghi">Tồn đầu kỳ, tồn cuối kỳ lấy từ phiếu kiểm kê cuối tháng trước và cuối tháng này.</div>
          )}
        </>
      )}
    </div>
  )
}
