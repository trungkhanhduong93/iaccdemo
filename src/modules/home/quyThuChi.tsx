// Tiện ích và component dùng chung cho Quản lý thu chi gói Free (T272):
// tính số dư từng ngày, biểu đồ số dư SVG, modal/sheet quỹ theo mẫu M2
import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/Icon'
import { moneyD, pad, short } from '../../ui/format'
import { useDongEsc } from '../../ui/LocNangCao'
import { phieuTheoSo } from '../../ui/generic/SoChungTu'
import { giaoDich, tonQuyTheoSo, type GiaoDich } from './LichSuQuy'
import { CUA_HANG } from '../../data/mock'

export interface DiemSoDu {
  nhan: string
  ngay: string
  du: number
}

/** Chuyển dd/mm/yyyy thành số để so sánh */
export const toDateNum = (ngay: string): number => {
  const [d, m, y] = ngay.split('/').map(Number)
  return (y || 2026) * 10000 + (m || 10) * 100 + (d || 1)
}

/** Tính số dư từng ngày trong tháng của 1 quỹ hoặc gộp tất cả quỹ (T272).
 *  Điểm đầu = Đầu kỳ, sau đó số dư cuối mỗi ngày từ ngày 1 tới ngày cuối có dữ liệu trong tháng;
 *  ngày không có giao dịch giữ số dư ngày trước */
export function tinhSoDuTungNgay(quyKey: string, thang: number, cnIds?: string[]): DiemSoDu[] {
  const ids = cnIds && cnIds.length > 0 ? cnIds : CUA_HANG.map(c => c.id)

  if (quyKey === 'tat-ca') {
    const quyDs = tonQuyTheoSo(thang, ids)
    const gdMoiQuy = quyDs.map(q => ({
      quy: q.quy,
      mo: q.mo,
      cuoi: q.cuoi,
      ds: giaoDich(q.quy, thang)?.ds ?? [],
    }))

    // Tìm ngày lớn nhất có giao dịch của tất cả các quỹ
    let maxDay = 1
    for (const q of gdMoiQuy) {
      for (const x of q.ds) {
        const d = Number(x.ngay.split('/')[0]) || 1
        if (d > maxDay) maxDay = d
      }
    }

    const res: DiemSoDu[] = []
    const tongMo = gdMoiQuy.reduce((a, q) => a + q.mo, 0)
    res.push({ nhan: 'Đầu kỳ', ngay: `01/${pad(thang)}`, du: tongMo })

    // Tính số dư từng ngày của từng quỹ, rồi cộng lại
    const duQuyHienTai = gdMoiQuy.map(q => q.mo)
    for (let d = 1; d <= maxDay; d++) {
      const dStr = `${pad(d)}/${pad(thang)}`
      for (let qi = 0; qi < gdMoiQuy.length; qi++) {
        const q = gdMoiQuy[qi]
        const txs = q.ds.filter(x => Number(x.ngay.split('/')[0]) === d)
        if (txs.length > 0) {
          duQuyHienTai[qi] = txs[txs.length - 1].du
        }
      }
      const tongDuNgay = duQuyHienTai.reduce((a, v) => a + v, 0)
      res.push({ nhan: dStr, ngay: dStr, du: tongDuNgay })
    }
    return res
  }

  const gd = giaoDich(quyKey, thang)
  if (!gd) return []

  let maxDay = 1
  for (const x of gd.ds) {
    const d = Number(x.ngay.split('/')[0]) || 1
    if (d > maxDay) maxDay = d
  }

  const res: DiemSoDu[] = []
  res.push({ nhan: 'Đầu kỳ', ngay: `01/${pad(thang)}`, du: gd.mo })

  let duHienTai = gd.mo
  for (let d = 1; d <= maxDay; d++) {
    const dStr = `${pad(d)}/${pad(thang)}`
    const txs = gd.ds.filter(x => Number(x.ngay.split('/')[0]) === d)
    if (txs.length > 0) {
      duHienTai = txs[txs.length - 1].du
    }
    res.push({ nhan: dStr, ngay: dStr, du: duHienTai })
  }
  return res
}

/** Biểu đồ số dư từng ngày SVG tự vẽ theo mẫu M2 (T272) */
export function BieuDoSoDuQuy({ diem, isMobile }: { diem: DiemSoDu[]; isMobile?: boolean }) {
  if (!diem || diem.length === 0) return null

  const W = 640
  const H = isMobile ? 180 : 230
  const padLeft = 14
  const padRight = 14
  const padTop = 24
  const padBottom = 20

  const vals = diem.map(p => p.du)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const chenh = maxV - minV || maxV * 0.1 || 1000
  const yMin = Math.max(0, minV - chenh * 0.12)
  const yMax = maxV + chenh * 0.12

  const n = diem.length
  const pts = diem.map((p, i) => {
    const x = padLeft + (n > 1 ? (i / (n - 1)) * (W - padLeft - padRight) : (W - padLeft - padRight) / 2)
    const y = padTop + (1 - (p.du - yMin) / (yMax - yMin)) * (H - padTop - padBottom)
    return { x, y, p }
  })

  const polyPoints = pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
  const areaPath = `M ${pts[0].x.toFixed(1)},${H} L ${pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ')} L ${pts[pts.length - 1].x.toFixed(1)},${H} Z`

  // Chọn nhãn thưa dưới trục ngày để không chồng chữ (tối đa 7-8 nhãn)
  const nhanHien: { text: string; i: number }[] = []
  if (n <= 8) {
    for (let i = 0; i < n; i++) {
      nhanHien.push({ text: diem[i].nhan, i })
    }
  } else {
    nhanHien.push({ text: diem[0].nhan, i: 0 })
    const buoc = (n - 1) / 5
    for (let step = 1; step < 5; step++) {
      const idx = Math.round(step * buoc)
      nhanHien.push({ text: diem[idx].nhan, i: idx })
    }
    nhanHien.push({ text: diem[n - 1].nhan, i: n - 1 })
  }

  const dauKy = diem[0].du
  const cuoiKy = diem[n - 1].du

  return (
    <div className="mq-bd-bao">
      <div className="mq-bd-hop" style={{ height: H }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mq-bd-svg"
          role="img"
          aria-label={`Số dư từ ${short(dauKy)} đầu kỳ đến ${short(cuoiKy)} cuối kỳ`}
        >
          {/* 3 đường kẻ ngang gióng giá trị */}
          <line x1="0" y1={H * 0.25} x2={W} y2={H * 0.25} stroke="#eeeeee" strokeDasharray="3 3" />
          <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke="#eeeeee" strokeDasharray="3 3" />
          <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} stroke="#eeeeee" strokeDasharray="3 3" />

          {/* Vùng diện tích nhạt dưới đường */}
          <path d={areaPath} fill="var(--tint, #e6eff7)" />

          {/* Đường polyline chính */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke="var(--blue, #0560a6)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Các điểm tròn */}
          {pts.map((pt, i) => {
            const laCuoi = i === pts.length - 1
            return (
              <circle
                key={i}
                cx={pt.x.toFixed(1)}
                cy={pt.y.toFixed(1)}
                r={laCuoi ? 6 : 5}
                fill={laCuoi ? 'var(--blue, #0560a6)' : '#fff'}
                stroke="var(--blue, #0560a6)"
                strokeWidth={laCuoi ? 1 : 2.5}
                className="mq-bd-cham"
              >
                <title>{`${pt.p.nhan}: ${moneyD(pt.p.du)}`}</title>
              </circle>
            )
          })}
        </svg>

        {/* Chú thích giá trị đầu kỳ và cuối kỳ */}
        <div className="mq-bd-gia-tri dau">{short(dauKy)}</div>
        <div className="mq-bd-gia-tri cuoi">{short(cuoiKy)}</div>
      </div>

      {/* Dải nhãn ngày dưới biểu đồ */}
      <div className="mq-bd-nhan-hang">
        {nhanHien.map((item, idx) => (
          <span key={idx}>{item.text}</span>
        ))}
      </div>
    </div>
  )
}

/** Modal quỹ theo mẫu M2: web là hộp giữa màn, mobile là bottom sheet (T272) */
export function ModalQuy({
  quyKey,
  thang,
  onDong,
  isMobile,
  selCns,
}: {
  quyKey: string
  thang: number
  onDong: () => void
  isMobile?: boolean
  selCns?: string[]
}) {
  useDongEsc(onDong)

  const isTatCa = quyKey === 'tat-ca'
  const ids = useMemo(() => (selCns && selCns.length > 0 ? selCns : CUA_HANG.map(c => c.id)), [selCns?.join(',')])

  const gd = useMemo(() => {
    return giaoDich(quyKey, thang, ids)
  }, [quyKey, thang, ids])

  const diemSoDu = useMemo(() => {
    return tinhSoDuTungNgay(quyKey, thang, ids)
  }, [quyKey, thang, ids])

  const mo = gd?.mo ?? 0
  const thu = gd?.thu ?? (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const chi = gd?.chi ?? (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)
  const cuoi = gd?.cuoi ?? 0

  const tienMat = isTatCa ? true : quyKey.startsWith('Quỹ tiền mặt')
  const tenHien = isTatCa ? 'Tất cả quỹ' : quyKey
  const dongPhu = isTatCa
    ? `Tháng ${pad(thang)}/2026 · Tất cả quỹ`
    : `Tháng ${pad(thang)}/2026 · ${tienMat ? 'Tiền mặt' : 'Ngân hàng'}`

  // 3 giao dịch mới nhất (T272)
  const ganNhat = useMemo(() => {
    const list = gd?.ds ?? []
    return [...list].slice(-3).reverse()
  }, [gd?.ds])

  const linkThu = `/app/tien/2-1-1/moi?loai=${tienMat ? 'thu' : 'bc'}`
  const linkChi = `/app/tien/2-1-1/moi?loai=${tienMat ? 'chi' : 'unc'}`
  const linkChiTiet = `/app/trang-chu/lich-su-quy?quy=${encodeURIComponent(quyKey)}&thang=${thang}`

  const noiDung = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Biểu đồ thu chi ${tenHien}`}
      className={isMobile ? 'pn-hop m-quy-sheet' : 'mq-hop'}
      onClick={e => e.stopPropagation()}
    >
      {/* 1. Phần đầu: Tên quỹ + dòng phụ + nút đóng */}
      <div className={isMobile ? 'pn-dau mq-dau' : 'mq-dau'}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 className="mq-tieu-de">{tenHien}</h3>
            {isTatCa && isMobile && (
              <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="mq-btn-tao-quy" onClick={onDong} title="Tạo quỹ mới">
                + Tạo quỹ
              </Link>
            )}
          </div>
          <div className="mq-dong-phu">{dongPhu}</div>
        </div>
        <button
          type="button"
          aria-label="Đóng"
          className="mq-nut-dong"
          onClick={onDong}
        >
          <Icon n="x" className="ic sm" />
        </button>
      </div>

      {/* Thân: Trái (4 ô dọc) + Phải (biểu đồ + 3 giao dịch) */}
      <div className={isMobile ? 'pn-than mq-than-m' : 'mq-than'}>
        {/* 2. Bốn ô dọc nối dấu + − = */}
        <div className="mq-cot-o">
          <div className="mq-st st-dau">
            <span>Tồn đầu kỳ</span>
            <b>{moneyD(mo)}</b>
          </div>
          <div className="mq-dau-toan" aria-hidden="true">+</div>
          <div className="mq-st st-thu">
            <span>Tiền thu vào</span>
            <b>{moneyD(thu)}</b>
          </div>
          <div className="mq-dau-toan" aria-hidden="true">−</div>
          <div className="mq-st st-chi">
            <span>Tiền chi ra</span>
            <b>{moneyD(chi)}</b>
          </div>
          <div className="mq-dau-toan" aria-hidden="true">=</div>
          <div className="mq-st st-cuoi">
            <span>Tồn cuối kỳ</span>
            <b>{moneyD(cuoi)}</b>
          </div>
        </div>

        {/* 3. Biểu đồ đường số dư từng ngày + Giao dịch gần nhất */}
        <div className="mq-cot-bd">
          <div className="mq-bd-tieu">Số dư quỹ từng ngày</div>
          <BieuDoSoDuQuy diem={diemSoDu} isMobile={isMobile} />

          {/* 4. Giao dịch gần nhất */}
          <div className="mq-gd-khoi">
            <div className="mq-gd-tieu">Giao dịch gần nhất</div>
            {ganNhat.length === 0 ? (
              <div className="mq-gd-trong">Chưa có giao dịch trong tháng.</div>
            ) : (
              ganNhat.map((x: GiaoDich, i: number) => {
                const p = phieuTheoSo(x.so)
                const dmStr = x.ngay.slice(0, 5)
                const laThu = x.thu > 0
                return (
                  <div key={i} className="mq-gd-dong">
                    <span className={`mq-dot ${laThu ? 'thu' : 'chi'}`}>
                      <Icon n={laThu ? 'cashin' : 'cashout'} className="ic sm" />
                    </span>
                    <span className="mq-gd-tt">
                      <span className="mq-gd-dg">{x.dg}</span>
                      <small>
                        {dmStr} · {p?.so ?? x.so}
                        {isTatCa && x.quy && ` · ${x.quy}`}
                      </small>
                    </span>
                    <b className={`mq-gd-tien ${laThu ? 'thu' : 'chi'}`}>
                      {laThu ? moneyD(x.thu) : moneyD(x.chi)}
                    </b>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Chân: Lập phiếu thu, Lập phiếu chi, Xem chi tiết lịch sử thu chi (T273: 2 hàng trên mobile) */}
      {isMobile ? (
        <div className="m-quy-chan">
          <div className="m-quy-chan-hang1">
            <Link to={linkThu} className="m-quy-btn-phieu" onClick={onDong}>
              <Icon n="plus" className="ic sm" />
              <span>Lập phiếu thu</span>
            </Link>
            <Link to={linkChi} className="m-quy-btn-phieu" onClick={onDong}>
              <Icon n="plus" className="ic sm" />
              <span>Lập phiếu chi</span>
            </Link>
          </div>
          <Link to={linkChiTiet} className="m-quy-btn-chinh" onClick={onDong}>
            Xem chi tiết lịch sử thu chi ›
          </Link>
        </div>
      ) : (
        <div className="mq-chan">
          <div className="mq-chan-trai">
            {isTatCa && (
              <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="mq-btn mq-btn-phu" onClick={onDong}>
                + Tạo quỹ
              </Link>
            )}
            <Link to={linkThu} className="mq-btn" onClick={onDong}>
              Lập phiếu thu
            </Link>
            <Link to={linkChi} className="mq-btn" onClick={onDong}>
              Lập phiếu chi
            </Link>
          </div>
          <Link to={linkChiTiet} className="mq-btn pri" onClick={onDong}>
            Xem chi tiết lịch sử thu chi ›
          </Link>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return createPortal(
      <div className="m-ds-hop mq-mobile-nen">
        <div className="overlay" onClick={onDong} />
        {noiDung}
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div
      className="mq-nen"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onDong()
      }}
    >
      {noiDung}
    </div>,
    document.body,
  )
}
