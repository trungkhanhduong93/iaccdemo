// Lịch sử thu chi một quỹ kiểu app trên điện thoại theo Phương án A (T395): mở từ khối Quỹ tiền trang chủ gói Free.
// Cùng số liệu với bản web, gom theo ngày, mới nhất trên cùng, 4 ô tóm tắt nền thẻ trắng lưới 2x2
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pad } from '../format'
import { phieuTheoSo } from '../generic/SoChungTu'
import { tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { giaoDich, phanLoaiGiaoDich, tenNgay, type GiaoDich } from '../../modules/home/LichSuQuy'

export function MLichSuQuy(_: ScreenProps) {
  const [tham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CUA_HANG[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const isTatCa = quy === 'tat-ca'
  const gd = giaoDich(quy, thang)
  const tienMat = isTatCa ? true : CUA_HANG.some(c => tenQuyTm(c.ngan) === quy)
  const tenHien = isTatCa ? 'Tất cả quỹ' : quy

  // Lọc loại giao dịch: tất cả, chỉ khoản thu, chỉ khoản chi (giữ nguyên theo Trum chốt)
  const [loai, setLoai] = useState<'' | 'thu' | 'chi'>('')
  const dsLoc = (gd?.ds ?? []).filter(x => !loai || (loai === 'thu' ? x.thu > 0 : x.chi > 0))

  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDich[]>()
  for (const x of [...dsLoc].reverse()) {
    nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  }
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)

  // Thống kê từng ngày từ giao dịch gốc chưa lọc
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
      {/* 1. Tiêu đề quỹ & 4 ô màu lưới 2x2 nền thẻ trắng nhẹ theo mẫu Phương án A (T395) */}
      <div className="m-free-lsq-the-hop">
        <div className="m-free-lsq-quy-dau">
          <div className="m-free-lsq-quy">
            <Icon n={tienMat ? 'wallet' : 'bank'} className="ic sm" />
            <span>{tenHien}</span>
          </div>
          <small className="m-free-lsq-thang">Tháng {pad(thang)}/2026</small>
        </div>

        <div className="mobile-stat-slider">
          <div className="m-stat-pill">
            <span className="lbl">Tồn đầu kỳ</span>
            <b className="val">{moneyD(gd?.mo ?? 0)}</b>
          </div>
          <div className="m-stat-pill">
            <span className="lbl">Tồn cuối kỳ</span>
            <b className="val" style={{ color: 'var(--blue)' }}>{moneyD(gd?.cuoi ?? 0)}</b>
          </div>
          <div className="m-stat-pill">
            <span className="lbl">Thu vào (+)</span>
            <b className="val" style={{ color: 'var(--green)' }}>+{moneyD(tn)}</b>
          </div>
          <div className="m-stat-pill">
            <span className="lbl">Chi ra (-)</span>
            <b className="val" style={{ color: 'var(--red)' }}>-{moneyD(tc)}</b>
          </div>
        </div>

        {isTatCa && (
          <div className="m-free-lsq-chuyen-quy">Gồm tiền chuyển giữa các quỹ</div>
        )}
      </div>

      {/* 2. Bộ lọc thu chi hiện có (giữ nguyên theo Trum chốt) */}
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
        <div className="mobile-tx-stream">
          {[...nhom].map(([ngay, ds]) => {
            const tk = thongKeNgay.get(ngay)
            const cuoiNgay = tk?.cuoi ?? 0

            return (
              <div key={ngay} className="mobile-day-block">
                <div className="mobile-day-title">
                  <span>{tenNgay(ngay)}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 500 }}>Dư {moneyD(cuoiNgay)}</span>
                </div>

                {ds.map((x, i) => {
                  const p = phieuTheoSo(x.so)
                  const laThu = x.thu > 0
                  const isFabi = /bán hàng/i.test(x.dg)
                  const loaiInfo = phanLoaiGiaoDich(x.dg)
                  const soDu = isTatCa ? (x.duGop ?? x.du) : x.du
                  const phuDs = [
                    p?.so ?? x.so,
                    x.gio,
                    x.doiTuong,
                    isTatCa && x.quy ? x.quy : undefined,
                    isFabi ? 'FABi' : 'Thủ công',
                  ].filter(Boolean).join(' · ')

                  const noiDung = (
                    <>
                      <div className="l">
                        <div className={`ic ${loaiInfo.cls} m-free-lsq-ic ${laThu ? 'vao' : 'ra'}`}>
                          <Icon n={loaiInfo.icon} className="ic sm" />
                        </div>
                        <div className="meta">
                          <span className="t">{x.dg}</span>
                          <span className="d">{phuDs}</span>
                        </div>
                      </div>
                      <div className="r">
                        <div className={`amt ${laThu ? 'in' : 'out'}`} style={{ color: laThu ? 'var(--green)' : 'var(--red)' }}>
                          {laThu ? `+${moneyD(x.thu)}` : `-${moneyD(x.chi)}`}
                        </div>
                        <div className="bal">Dư {moneyD(soDu)}</div>
                      </div>
                    </>
                  )

                  return p ? (
                    <a
                      key={i}
                      href={`#${p.to}`}
                      target="_blank"
                      rel="noopener"
                      className="mobile-tx-row m-free-lsq-dong"
                      title="Mở chứng từ gốc ở tab mới"
                    >
                      {noiDung}
                    </a>
                  ) : (
                    <div key={i} className="mobile-tx-row m-free-lsq-dong">
                      {noiDung}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Hai nút Thu tiền, Chi tiền ghim đáy (T292) */}
      <div className="m-free-day-nut mobile-bottom-bar">
        <Link
          to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'thu' : 'bc'}`}
          className="m-free-nut-phu btn-sec"
        >
          <Icon n="plus" className="ic sm" />
          <span>Thu tiền</span>
        </Link>
        <Link
          to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'chi' : 'unc'}`}
          className="m-free-nut-chinh btn-pri"
        >
          <Icon n="plus" className="ic sm" />
          <span>Chi tiền</span>
        </Link>
      </div>
    </div>
  )
}
