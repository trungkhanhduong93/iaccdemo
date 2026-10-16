// Lịch sử thu chi một quỹ kiểu app trên điện thoại (T240, T272): mở từ khối Tồn quỹ trang chủ gói Free.
// Cùng số liệu với bản web, gom theo ngày, mới nhất trên cùng, 4 ô màu lưới 2x2
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { money, moneyD, pad } from '../format'
import { phieuTheoSo } from '../generic/SoChungTu'
import { NGUON } from '../generic/gen'
import { tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { giaoDich, type GiaoDich } from '../../modules/home/LichSuQuy'

const nguonGd = (dg: string) => NGUON[/bán hàng/i.test(dg) ? 'FABi' : 'tay']

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
const tenNgay = (ngay: string) => {
  const [d, m, y] = ngay.split('/').map(Number)
  return `${THU[new Date(y, m - 1, d).getDay()]}, ${ngay}`
}

export function MLichSuQuy(_: ScreenProps) {
  const [tham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CUA_HANG[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const isTatCa = quy === 'tat-ca'
  const gd = giaoDich(quy, thang)
  const tienMat = isTatCa ? true : CUA_HANG.some(c => tenQuyTm(c.ngan) === quy)
  const tenHien = isTatCa ? 'Tất cả quỹ' : quy

  // Lọc loại giao dịch: tất cả, chỉ khoản thu, chỉ khoản chi (T246); danh sách theo bộ lọc, số dư đầu, cuối kỳ giữ nguyên
  const [loai, setLoai] = useState<'' | 'thu' | 'chi'>('')
  const dsLoc = (gd?.ds ?? []).filter(x => !loai || (loai === 'thu' ? x.thu > 0 : x.chi > 0))

  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDich[]>()
  for (const x of [...dsLoc].reverse()) {
    nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  }
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)

  // Thống kê từng ngày từ giao dịch gốc chưa lọc (gd.ds) (T272-sửa 1):
  const thongKeNgay = new Map<string, { thu: number; chi: number; cuoi: number }>()
  for (const x of gd?.ds ?? []) {
    const cu = thongKeNgay.get(x.ngay)
    const thu = (cu?.thu ?? 0) + x.thu
    const chi = (cu?.chi ?? 0) + x.chi
    const cuoi = isTatCa ? (x.duGop ?? x.du) : x.du
    thongKeNgay.set(x.ngay, { thu, chi, cuoi })
  }

  return (
    <div className="m-free-lsq">
      {/* 1. Tiêu đề quỹ & 4 ô màu lưới 2x2 theo mẫu L1 (T272) */}
      <div className="m-free-lsq-the-hop">
        <div className="m-free-lsq-quy-dau">
          <div className="m-free-lsq-quy">
            <Icon n={tienMat ? 'wallet' : 'bank'} className="ic sm" />
            <span>{tenHien}</span>
          </div>
          <small className="m-free-lsq-thang">Tháng {pad(thang)}/2026</small>
        </div>

        <div className="m-free-lsq-luoi-2x2">
          <div className="m-free-lsq-o-st st-dau">
            <span>Tồn đầu kỳ</span>
            <b>{moneyD(gd?.mo ?? 0)}</b>
          </div>
          <div className="m-free-lsq-o-st st-thu">
            <span>Tiền thu vào</span>
            <b>{moneyD(tn)}</b>
          </div>
          <div className="m-free-lsq-o-st st-chi">
            <span>Tiền chi ra</span>
            <b>{moneyD(tc)}</b>
          </div>
          <div className="m-free-lsq-o-st st-cuoi">
            <span>Tồn cuối kỳ</span>
            <b>{moneyD(gd?.cuoi ?? 0)}</b>
          </div>
        </div>

        {isTatCa && (
          <div className="m-free-lsq-chuyen-quy">Gồm tiền chuyển giữa các quỹ</div>
        )}
      </div>

      {/* 2. Bộ lọc thu chi dạng chip (T246) */}
      <div className="m-free-lsq-loc">
        <button
          type="button"
          className={`m-free-lsq-chip ${loai === '' ? 'on' : ''}`}
          onClick={() => setLoai('')}
        >
          Tất cả thu, chi
        </button>
        <button
          type="button"
          className={`m-free-lsq-chip ${loai === 'thu' ? 'on' : ''}`}
          onClick={() => setLoai('thu')}
        >
          Khoản thu
        </button>
        <button
          type="button"
          className={`m-free-lsq-chip ${loai === 'chi' ? 'on' : ''}`}
          onClick={() => setLoai('chi')}
        >
          Khoản chi
        </button>
      </div>

      {!gd || nhom.size === 0 ? (
        <div className="m-free-trong">
          {loai ? `Quỹ không có khoản ${loai} nào trong tháng ${thang}/2026.` : `Quỹ chưa có giao dịch trong tháng ${thang}/2026.`}
        </div>
      ) : (
        <div className="m-free-lsq-ds">
          {[...nhom].map(([ngay, ds]) => {
            const tk = thongKeNgay.get(ngay)
            const tongThuNgay = tk?.thu ?? 0
            const tongChiNgay = tk?.chi ?? 0
            const cuoiNgay = tk?.cuoi ?? 0

            return (
              <section key={ngay} className="m-free-lsq-ngay-nhom">
                {/* Dòng tổng ngày có thu, chi, cuối ngày (T272) */}
                <div className="m-free-lsq-ngay-dau">
                  <b>{tenNgay(ngay)}</b>
                  <div className="m-free-lsq-ngay-tong">
                    {tongThuNgay > 0 && <span className="m-tien-vao">{money(tongThuNgay)}</span>}
                    {tongChiNgay > 0 && <span className="m-tien-ra">{money(tongChiNgay)}</span>}
                    <span className="m-tien-cuoi">Cuối {money(cuoiNgay)}</span>
                  </div>
                </div>

                <div className="m-free-lsq-khoi">
                  {ds.map((x, i) => {
                    const p = phieuTheoSo(x.so)
                    const laThu = x.thu > 0
                    const nInfo = nguonGd(x.dg)

                    return (
                      <div key={i} className="m-free-lsq-dong">
                        <span className={`m-free-lsq-ic ${laThu ? 'vao' : 'ra'}`}>
                          <Icon n={laThu ? 'cashin' : 'cashout'} className="ic sm" />
                        </span>
                        <div className="m-free-lsq-chu">
                          <div className="m-free-lsq-dg">{x.dg}</div>
                          {isTatCa && x.quy && (
                            <div className="m-free-lsq-ten-quy">{x.quy}</div>
                          )}
                          <div className="m-free-lsq-phu-dong">
                            {p ? (
                              <a
                                href={`#${p.to}`}
                                target="_blank"
                                rel="noopener"
                                className="m-free-lsq-so-link"
                                title="Mở chứng từ gốc ở tab mới"
                              >
                                <span>{p.so}</span>
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                                </svg>
                              </a>
                            ) : (
                              <span className="m-free-lsq-soct">{x.so}</span>
                            )}
                            <span className={`src ${nInfo[0]} lsq-nguon`}>
                              {nInfo[1]}
                            </span>
                          </div>
                        </div>
                        <div className="m-free-lsq-so">
                          <div className={`m-free-lsq-tien ${laThu ? 'm-tien-vao' : 'm-tien-ra'}`}>
                            {laThu ? moneyD(x.thu) : moneyD(x.chi)}
                          </div>
                          <small className="m-free-lsq-sodu">Số dư {moneyD(x.du)}</small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
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
