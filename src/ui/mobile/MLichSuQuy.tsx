// Lịch sử thu chi một quỹ kiểu app trên điện thoại (T240): mở từ khối Tồn quỹ trang chủ gói Free.
// Cùng số liệu với bản web, gom theo ngày, mới nhất trên cùng
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD } from '../format'
import { phieuTheoSo } from '../generic/SoChungTu'
import { tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { giaoDich } from '../../modules/home/LichSuQuy'

interface GiaoDichItem {
  ngay: string
  so: string
  dg: string
  thu: number
  chi: number
  du: number
}

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
const tenNgay = (ngay: string) => {
  const [d, m, y] = ngay.split('/').map(Number)
  return `${THU[new Date(y, m - 1, d).getDay()]}, ${ngay}`
}

export function MLichSuQuy(_: ScreenProps) {
  const [tham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CHI_NHANH[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const gd = giaoDich(quy, thang)
  const tienMat = CHI_NHANH.some(c => tenQuyTm(c.ngan) === quy)

  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDichItem[]>()
  for (const x of [...(gd?.ds ?? [])].reverse()) {
    nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  }
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)

  return (
    <div className="m-free-lsq">
      <div className="m-free-lsq-the">
        <div className="m-free-lsq-quy">
          <Icon n={tienMat ? 'wallet' : 'bank'} className="ic sm" />
          <span>{quy}</span>
        </div>
        <div className="m-free-lsq-du">
          <small>{thang === 10 ? 'Số dư hiện tại' : `Số dư cuối tháng ${thang}/2026`}</small>
          <b>{moneyD(gd?.cuoi ?? 0)}</b>
        </div>
        <div className="m-free-lsq-tom">
          <span>Đầu kỳ <b>{moneyD(gd?.mo ?? 0)}</b></span>
          <span className="m-tien-vao">Thu <b>+{moneyD(tn)}</b></span>
          <span className="m-tien-ra">Chi <b>−{moneyD(tc)}</b></span>
        </div>
      </div>

      {!gd || nhom.size === 0 ? (
        <div className="m-free-trong">Quỹ chưa có giao dịch trong tháng {thang}/2026.</div>
      ) : (
        <div className="m-free-lsq-ds">
          {[...nhom].map(([ngay, ds]) => (
            <section key={ngay} className="m-free-lsq-ngay-nhom">
              <div className="m-free-lsq-ngay">{tenNgay(ngay)}</div>
              <div className="m-free-lsq-khoi">
                {ds.map((x, i) => {
                  const p = phieuTheoSo(x.so)
                  const noiDung = (
                    <>
                      <span className={`m-free-lsq-ic ${x.thu ? 'vao' : 'ra'}`}>
                        <Icon n={x.thu ? 'cashin' : 'cashout'} className="ic sm" />
                      </span>
                      <div className="m-free-lsq-chu">
                        <div className="m-free-lsq-dg">{x.dg}</div>
                        <small className="m-free-lsq-soct">{p?.so ?? x.so}</small>
                      </div>
                      <div className="m-free-lsq-so">
                        <div className={`m-free-lsq-tien ${x.thu ? 'm-tien-vao' : 'm-tien-ra'}`}>
                          {x.thu ? `+${moneyD(x.thu)}` : `−${moneyD(x.chi)}`}
                        </div>
                        <small className="m-free-lsq-sodu">Số dư {moneyD(x.du)}</small>
                      </div>
                      {p && <Icon n="chevr" className="ic sm m-free-lsq-mui" />}
                    </>
                  )
                  return p ? (
                    <Link key={i} to={p.to} className="m-free-lsq-dong link" title="Xem chứng từ">
                      {noiDung}
                    </Link>
                  ) : (
                    <div key={i} className="m-free-lsq-dong">
                      {noiDung}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="m-free-day-nut">
        <Link
          to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'thu' : 'bc'}`}
          className="m-free-nut-phu"
        >
          <Icon n="plus" className="ic sm" />
          <span>Lập phiếu thu</span>
        </Link>
        <Link
          to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'chi' : 'unc'}`}
          className="m-free-nut-chinh"
        >
          <Icon n="plus" className="ic sm" />
          <span>Lập phiếu chi</span>
        </Link>
      </div>
    </div>
  )
}
