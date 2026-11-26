// Chi phí NVL trong tháng gói Standard trên điện thoại (T394, T945): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ.
// Cách tính chung cả công ty, đổi ở Thông tin đơn vị như web (T767): kiểm kê định kỳ hoặc tổng chi phí mua hàng trong tháng.
// Xem mọi cửa hàng: danh sách từng cửa hàng, bấm dòng đổi luôn cửa hàng trên thanh đầu (T611).
// Xem một cửa hàng: các số của công thức và phiếu mua hàng trong tháng.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { ThongBao } from '../ThongBao'
import { moneyD, pct, rutGonSo } from '../format'
import {
  DI_DOI_CACH_NVL,
  daKhoaThang,
  nvlKy,
  phieuMuaKy,
  canKiemKeCuoiThang,
} from '../../modules/home/chi-phi-nvl'
import { TheTongChiPhi, type OCachTinh } from '../../modules/home/TheTongChiPhi'

const THANG = [7, 8, 9, 10]

function tomTatKk(dau: number, mua: number, cuoi: number) {
  const cungTrieu = [dau, mua, cuoi].every(n => n >= 1e6 && n < 1e9)
  return cungTrieu
    ? `Đầu ${rutGonSo(dau, false)} · Mua ${rutGonSo(mua, false)} · Cuối ${rutGonSo(cuoi)}`
    : `Đầu ${rutGonSo(dau)} · Mua ${rutGonSo(mua)} · Cuối ${rutGonSo(cuoi)}`
}

export function MChiPhiNvl(_: ScreenProps) {
  const { s, set } = useSession()
  const [tham, setTham] = useSearchParams()
  const [boQua, setBoQua] = useState(false)
  const [moChiTiet, setMoChiTiet] = useState(false)
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
  const dsChuaKk = tong.ds.filter(x => x.chuaKk)
  const coCanhBao = canKiemKeCuoiThang(s, thang) && dsChuaKk.length > 0
  const ngayCuoi = `${new Date(2026, thang, 0).getDate()}/${String(thang).padStart(2, '0')}`

  const cachTinh: OCachTinh[] = kk
    ? [
        { nhan: 'Tồn đầu kỳ', so: tong.tonDau, phu: `Tồn cuối tháng ${thang - 1}` },
        { dau: '+', nhan: 'Mua trong tháng', so: tong.mua, phu: <Link to="/app/mua-hang/4-1-1">Xem phiếu mua hàng</Link> },
        { dau: '−', nhan: 'Tồn cuối kỳ', so: tong.tonCuoi, phu: 'Tồn tới thời điểm xem' },
      ]
    : [
        { nhan: 'Mua trong tháng', so: tong.mua, phu: <Link to="/app/mua-hang/4-1-1">Xem phiếu mua hàng</Link> },
        { nhan: 'Tổng chi phí mua hàng trong tháng', phu: 'Chi phí NVL là tổng tiền các phiếu mua hàng NVL trong tháng.', vien: true, rong: true },
      ]

  const phuThe = coCanhBao && boQua ? (
    <button type="button" className="nvl-chip-bao" onClick={() => setMoChiTiet(true)}>
      {dsChuaKk.length} chưa kiểm kê
    </button>
  ) : null

  return (
    <div className="m-standard-cpt">
      {coCanhBao && !boQua && (
        <section className="nvl-m-bao" role="alert">
          <div className="nvl-m-bao-dau">
            <Icon n="alert" className="ic sm" />
            <span>
              <b>{dsChuaKk.length} cửa hàng chưa kiểm kê ngày {ngayCuoi}.</b> Tồn cuối đang lấy theo báo cáo nhập xuất tồn.
            </span>
          </div>
          <div className="nvl-m-bao-nut">
            <button type="button" className="btn nvl-bao-bo" onClick={() => setBoQua(true)}>Bỏ qua</button>
            <button type="button" className="btn pri" onClick={() => setMoChiTiet(true)}>Xem chi tiết</button>
          </div>
        </section>
      )}

      <TheTongChiPhi
        nhan={cn ? `Tổng chi phí NVL · ${cn.ten}` : 'Tổng chi phí NVL'}
        tien={tong.tien}
        phu={phuThe}
        tyLe={dt ? tong.tien / dt : 0}
        dt={dt}
        cachTinh={cachTinh}
      />

      {khoa && (
        <div className="m-nvl-ghi">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</div>
      )}

      <div className="nvl-m-tieu">
        <b>{cn ? cn.ten : 'Theo cửa hàng'}</b>
        {cn && !cnThanh ? (
          <button type="button" className="nvl-m-link" onClick={() => doi({ cn: undefined })}>Mọi cửa hàng</button>
        ) : (
          <Link to={DI_DOI_CACH_NVL}>Đổi cách tính</Link>
        )}
      </div>

      {/* Khi chưa chọn cửa hàng: danh sách cửa hàng */}
      {!cn && (
        <>
          <section className="nvl-m-ds">
            {tong.ds.map(d => (
              <div
                key={d.cn}
                className="nvl-m-dong"
                onClick={() => set({ cuaHang: d.cn })}
                role="button"
                tabIndex={0}
              >
                <span className="nvl-m-dong-than">
                  <span className="nvl-m-dong-tren">
                    <b>{d.ten}</b>
                    <b className="num">{moneyD(d.tien)}</b>
                  </span>
                  <span className="nvl-m-dong-duoi">
                    <span className="nvl-m-dong-phu">
                      {d.chuaKk && <span className="nvl-chip-chua">Chưa kiểm kê</span>}
                      {kk
                        ? d.chuaKk
                          ? `Cuối ${rutGonSo(d.tonCuoi ?? 0)}`
                          : tomTatKk(d.tonDau ?? 0, d.mua, d.tonCuoi ?? 0)
                        : `Doanh thu ${rutGonSo(d.dt)}`}
                    </span>
                    <span className="nvl-m-dong-tl">{pct(d.dt ? d.tien / d.dt : 0)} DT</span>
                  </span>
                </span>
                <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
              </div>
            ))}
          </section>
          {kk && !coCanhBao && (
            <Link to="/app/kho/5-1-10/moi" className="nvl-m-nut-chinh">Kiểm kê ngay</Link>
          )}
          {!kk && (
            <Link to="/app/mua-hang/4-1-1" className="nvl-m-nut-vien">Xem phiếu mua hàng</Link>
          )}
        </>
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

      {moChiTiet && coCanhBao && (
        <ThongBao
          loai="canhBao"
          tieuDe={`Chưa kiểm kê ngày ${ngayCuoi}`}
          moTa="Kiểm kê thực tế ngày cuối tháng để tồn cuối khớp hàng còn trong kho."
          nutPhu="Đóng"
          onDong={() => setMoChiTiet(false)}
        >
          <div className="nvl-hop-ds">
            {dsChuaKk.map(c => (
              <div key={c.cn} className="nvl-hop-dong">
                <div className="nvl-hop-ten">
                  <b>{c.ten}</b>
                  <span>Tồn cuối theo NXT {moneyD(c.tonCuoi ?? 0)}</span>
                </div>
                <Link to="/app/kho/5-1-10/moi" className="btn sm pri" onClick={() => setMoChiTiet(false)}>
                  Kiểm kê {ngayCuoi}
                </Link>
              </div>
            ))}
          </div>
        </ThongBao>
      )}
    </div>
  )
}
