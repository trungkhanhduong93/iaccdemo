// Chi phí NVL trong tháng gói Free trên điện thoại (T394): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ.
// Cách tính chung cả công ty, đổi ở Thông tin đơn vị như web (T767): kiểm kê định kỳ hoặc tổng chi phí mua hàng trong tháng.
// Xem mọi cửa hàng: danh sách từng cửa hàng, bấm dòng đổi luôn cửa hàng trên thanh đầu (T611).
// Xem một cửa hàng: các số của công thức và phiếu mua hàng trong tháng.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG, KY_MO } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import {
  CACH_NVL,
  DI_DOI_CACH_NVL,
  daKhoaThang,
  nvlKy,
  phieuMuaKy,
  canKiemKeCuoiThang,
} from '../../modules/home/chi-phi-nvl'
import { HopChotTonHt } from '../../modules/home/HopChotTonHt'
import { TheCongThucNvl, ThanhTyLeNvl } from '../../modules/home/TheCongThucNvl'

const THANG = [7, 8, 9, 10]

export function MChiPhiNvl(_: ScreenProps) {
  const { s, set } = useSession()
  const [tham, setTham] = useSearchParams()
  const [moChot, setMoChot] = useState(false)
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
  const khoa = daKhoaThang(thang)
  const canKk = canKiemKeCuoiThang(s, thang)
  const chuaKkIds = tong.chuaKk
  const coCanhBao = canKk && chuaKkIds.length > 0
  const tenChuaKk = CUA_HANG.filter(c => chuaKkIds.includes(c.id)).map(c => c.ten).join(', ')
  const ngayCuoi = (th: number) => ({ 7: '31/07', 8: '31/08', 9: '30/09', 10: '31/10' }[th] ?? '30/09')

  return (
    <div className="m-standard-cpt">
      {/* Thẻ công thức như máy tính, xếp dọc (T944) */}
      <TheCongThucNvl tong={tong} ten={cn?.ten} />

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
      {/* Khung cảnh báo kiểm kê cuối tháng (T902) */}
      {coCanhBao && (
        <div className="m-nvl-bao" role="alert">
          <div className="m-nvl-bao-dau">
            <Icon n="alert" className="ic sm" />
            <div className="m-nvl-bao-chu">
              <b>Tháng {thang} chưa kiểm kê ở {tenChuaKk}.</b>
              <p>
                Chi phí NVL của {chuaKkIds.length === 1 ? 'cửa hàng này' : `${chuaKkIds.length} cửa hàng này`} chưa tính được. Lập phiếu kiểm kê ngày {ngayCuoi(thang)}, hoặc chốt tồn cuối bằng tồn hệ thống nếu không kiểm thực tế.
              </p>
            </div>
          </div>
          <div className="m-nvl-bao-nut">
            <button
              type="button"
              className="btn nhat sm"
              onClick={() => setMoChot(true)}
            >
              Chốt theo tồn hệ thống
            </button>
            <Link to="/app/kho/5-1-10/moi" className="btn pri sm">
              Lập phiếu kiểm kê
            </Link>
          </div>
        </div>
      )}
      {thang === KY_MO.thang && kk && (
        <div className="m-nvl-ghi">
          Chi phí NVL tạm tính, chốt khi có phiếu kiểm kê cuối tháng.
        </div>
      )}
      {khoa && (
        <div className="m-nvl-ghi">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</div>
      )}

      {/* Khi chưa chọn cửa hàng: danh sách cửa hàng */}
      {!cn && (
        <div className="m-standard-cpt-ds">
          {tong.ds.map(d => {
            const chuaKk = (d as { chuaKk?: boolean }).chuaKk ?? chuaKkIds.includes(d.cn)
            return (
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
                    {kk
                      ? chuaKk
                        ? 'Chưa có phiếu kiểm kê cuối tháng'
                        : `Tồn đầu ${moneyD(d.tonDau ?? 0)} · Mua ${moneyD(d.mua)} · Tồn cuối ${moneyD(d.tonCuoi ?? 0)}`
                      : `Mua ${moneyD(d.mua)}`}
                  </div>
                </div>
                <div className="m-standard-cpt-so">
                  {chuaKk ? (
                    <span className="chip cam">Chưa kiểm kê</span>
                  ) : (
                    <>
                      <div className="m-standard-cpt-tien">{moneyD(d.tien)}</div>
                      <div className="m-standard-cpt-phantram nvl-tl-o"><ThanhTyLeNvl tl={d.dt ? d.tien / d.dt : 0} />{pct(d.dt ? d.tien / d.dt : 0)} DT</div>
                    </>
                  )}
                </div>
                <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
              </div>
            )
          })}
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
                </div>
              </div>
            ))}
          </div>
          {/* nút nằm cuối danh sách như Kiểm kê ngay, không ghim đáy để khỏi đè thanh tab (T905) */}
          <Link to="/app/mua-hang/4-1-1" className="m-tcf-nut-vien chu-xanh">
            <Icon n="truck" className="ic sm" kieu="net" />
            <span>Xem danh sách phiếu mua hàng</span>
          </Link>
          {kk && (
            <div className="m-nvl-ghi">Tồn đầu kỳ, tồn cuối kỳ lấy từ phiếu kiểm kê cuối tháng trước và cuối tháng này.</div>
          )}
        </>
      )}

      {/* Hộp chốt tồn hệ thống (T902) */}
      {moChot && (
        <HopChotTonHt
          thang={thang}
          cns={chuaKkIds}
          onDong={() => setMoChot(false)}
        />
      )}
    </div>
  )
}
