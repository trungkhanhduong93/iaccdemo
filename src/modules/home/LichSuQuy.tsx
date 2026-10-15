// Lịch sử thu chi một quỹ kiểu app ngân hàng (T230): mở khi bấm quỹ ở khối Tồn quỹ trang chủ gói Free.
// Giao dịch lấy từ Sổ quỹ tiền mặt (quỹ tiền mặt chi nhánh) hoặc Sổ ngân hàng (tài khoản), gom theo ngày, mới nhất trên cùng;
// bấm giao dịch mở chứng từ chi tiết theo số phiếu (cách dò phiếu thật của T201)
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { CHI_NHANH, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { between, k, money, moneyD, pad, rng } from '../../ui/format'
import { NGUON, soChiTiet } from '../../ui/generic/gen'
import { gopSo } from '../../ui/generic/ReportScreen'
import { phieuTheoSo } from '../../ui/generic/SoChungTu'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { useSession } from '../../app/session'
import { Select } from '../../ui/Dropdown'
import { soQuyCn } from '../tien/SoQuy'
import { tenQuyTm, tenTkNh } from '../bao-cao/danh-sach'

export interface GiaoDich {
  ngay: string
  so: string
  dg: string
  thu: number
  chi: number
  du: number
  quy?: string
  duGop?: number
}

/** Giao dịch gộp tất cả quỹ trong tháng (T272) */
export function gopGiaoDichTatCa(thang: number, cnIds?: string[]): { mo: number; cuoi: number; thu: number; chi: number; ds: GiaoDich[] } {
  const ids = cnIds && cnIds.length > 0 ? cnIds : CHI_NHANH.map(c => c.id)
  const quyDs = tonQuyTheoSo(thang, ids)
  const mo = quyDs.reduce((a, r) => a + r.mo, 0)
  const cuoi = quyDs.reduce((a, r) => a + r.cuoi, 0)
  const thu = quyDs.reduce((a, r) => a + r.thu, 0)
  const chi = quyDs.reduce((a, r) => a + r.chi, 0)
  const tatCa: GiaoDich[] = []
  for (const q of quyDs) {
    const g = giaoDich(q.quy, thang, ids)
    if (g) {
      for (const x of g.ds) {
        tatCa.push({ ...x, quy: q.quy })
      }
    }
  }
  const toDateNum = (ngay: string) => {
    const [d, m, y] = ngay.split('/').map(Number)
    return (y || 2026) * 10000 + (m || thang) * 100 + (d || 1)
  }
  tatCa.sort((a, b) => toDateNum(a.ngay) - toDateNum(b.ngay))
  let duChay = mo
  for (const x of tatCa) {
    duChay += x.thu - x.chi
    x.duGop = duChay
  }
  return { mo, cuoi, thu, chi, ds: tatCa }
}

/** Giao dịch trong tháng của một quỹ hoặc gộp tất cả quỹ (T272): số phiếu sổ quỹ PT10-001 đổi thành PT2610-0001 để dò được phiếu thật cùng loại, cùng tháng */
export function giaoDich(quy: string, thang: number, cnIds?: string[]): { mo: number; cuoi: number; thu?: number; chi?: number; ds: GiaoDich[] } | undefined {
  if (quy === 'tat-ca') {
    return gopGiaoDichTatCa(thang, cnIds)
  }
  const cn = CHI_NHANH.find(c => tenQuyTm(c.ngan) === quy)
  if (cn) {
    const so = soQuyCn(cn.id, thang)
    const doiSo = (s: unknown) => { const m = /^([A-Z]+)\d+-(\d+)$/.exec(String(s ?? '')); return m ? `${m[1]}26${pad(thang)}-${pad(Number(m[2]), 4)}` : '' }
    return { mo: so.mo, cuoi: so.cuoi, ds: so.rows.map((r: Row) => ({ ngay: String(r.ngay), so: doiSo(r.thu ?? r.chi), dg: String(r.dg), thu: Number(r.no) || 0, chi: Number(r.co) || 0, du: Number(r.du) || 0 })) }
  }
  const iTk = TK_NGAN_HANG.findIndex(t => tenTkNh(t) === quy)
  if (iTk < 0) return undefined
  // Như Sổ ngân hàng 2.2.3: mỗi chi nhánh, mỗi tài khoản một phần, gộp các chi nhánh theo ngày
  const chia = CHI_NHANH.length * TK_NGAN_HANG.length
  const soMot = (hat: string) => soChiTiet(hat, k(between(rng(hat + thang), 80e6, 260e6) / chia), ['Thu tiền bán hàng ngày', 'Chi mua nguyên vật liệu', 'Chi tiền điện tháng', 'Thu tiền khách công ty',
    'Chi tạm ứng nhân viên', 'Nộp tiền vào tài khoản ngân hàng', 'Chi phí vận chuyển', 'Thu hoàn ứng'], ['5111', '331', '6422', '131', '141', '1121', '6421'], [1.5e6, 38e6], thang)
  const so = gopSo(CHI_NHANH.map(c => ({ cn: c.ngan, ...soMot('2.2.3' + c.id + (iTk || '')) })))
  return { mo: so.mo, cuoi: so.cuoi, ds: so.rows.map(r => ({ ngay: String(r.ngay), so: String(r.so), dg: String(r.dienGiai), thu: Number(r.no) || 0, chi: Number(r.co) || 0, du: Number(r.du) || 0 })) }
}

/** Tồn quỹ từng quỹ trong tháng theo Sổ quỹ tiền mặt, Sổ ngân hàng (cùng nguồn với Lịch sử thu chi, T230):
 *  quỹ tiền mặt của chi nhánh đang xem (cnIds) và mọi tài khoản ngân hàng */
export function tonQuyTheoSo(thang: number, cnIds: string[]) {
  const ten = [...CHI_NHANH.filter(c => cnIds.includes(c.id)).map(c => tenQuyTm(c.ngan)), ...TK_NGAN_HANG.map(tenTkNh)]
  return ten.map(quy => {
    const g = giaoDich(quy, thang)!
    return { quy, tienMat: quy.startsWith('Quỹ tiền mặt'), mo: g.mo, cuoi: g.cuoi, thu: g.ds.reduce((a, x) => a + x.thu, 0), chi: g.ds.reduce((a, x) => a + x.chi, 0) }
  })
}

/** Nguồn giao dịch (T264): tiền bán hàng do FABi đẩy về, còn lại là phiếu lập tay; nhãn như cột Nguồn của danh sách chứng từ */
const nguonGd = (dg: string) => NGUON[/bán hàng/i.test(dg) ? 'FABi' : 'tay']

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
const tenNgay = (ngay: string) => { const [d, m, y] = ngay.split('/').map(Number); return `${THU[new Date(y, m - 1, d).getDay()]}, ${ngay}` }

export function LichSuQuy(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { toast } = useSession()
  const [tham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CHI_NHANH[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const isTatCa = quy === 'tat-ca'
  const gd = giaoDich(quy, thang)

  // Lọc loại giao dịch: tất cả, chỉ khoản thu, chỉ khoản chi (T246); danh sách và file Excel theo bộ lọc, số dư đầu, cuối kỳ giữ nguyên
  const [loai, setLoai] = useState<'' | 'thu' | 'chi'>('')
  const dsLoc = (gd?.ds ?? []).filter(x => !loai || (loai === 'thu' ? x.thu > 0 : x.chi > 0))
  const tienMat = isTatCa ? true : CHI_NHANH.some(c => tenQuyTm(c.ngan) === quy)

  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDich[]>()
  for (const x of [...dsLoc].reverse()) nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)

  // Thống kê từng ngày từ giao dịch gốc chưa lọc (gd.ds) (T272-sửa 1):
  // tổng thu, tổng chi, số dư cuối ngày (nếu tat-ca lấy duGop, còn lại lấy du của giao dịch muộn nhất trong ngày)
  const thongKeNgay = new Map<string, { thu: number; chi: number; cuoi: number }>()
  for (const x of gd?.ds ?? []) {
    const cu = thongKeNgay.get(x.ngay)
    const thu = (cu?.thu ?? 0) + x.thu
    const chi = (cu?.chi ?? 0) + x.chi
    const cuoi = isTatCa ? (x.duGop ?? x.du) : x.du
    thongKeNgay.set(x.ngay, { thu, chi, cuoi })
  }

  const dongPhu = isTatCa
    ? `Tất cả quỹ · Tháng ${pad(thang)}/2026`
    : `${quy} · Tháng ${pad(thang)}/2026`

  const xuatExcel = () => {
    const tieuDe = `Lịch sử thu chi ${isTatCa ? 'tất cả quỹ' : quy} tháng ${thang}/2026`
    const phu = `${loai === 'thu' ? 'Khoản thu · ' : loai === 'chi' ? 'Khoản chi · ' : ''}Đầu kỳ ${moneyD(gd?.mo ?? 0)} · Cuối kỳ ${moneyD(gd?.cuoi ?? 0)}`
    const cols = isTatCa
      ? [
          { t: 'Ngày', rong: 12 },
          { t: 'Số chứng từ', rong: 18 },
          { t: 'Quỹ', rong: 24 },
          { t: 'Diễn giải', rong: 44 },
          { t: 'Nguồn', rong: 12 },
          { t: 'Thu', so: true },
          { t: 'Chi', so: true },
          { t: 'Số dư', so: true },
        ]
      : [
          { t: 'Ngày', rong: 12 },
          { t: 'Số chứng từ', rong: 18 },
          { t: 'Diễn giải', rong: 44 },
          { t: 'Nguồn', rong: 12 },
          { t: 'Thu', so: true },
          { t: 'Chi', so: true },
          { t: 'Số dư', so: true },
        ]

    const hangDau = isTatCa
      ? ['', '', '', 'Số dư đầu kỳ', '', null, null, gd?.mo ?? 0]
      : ['', '', 'Số dư đầu kỳ', '', null, null, gd?.mo ?? 0]

    const hangDs = dsLoc.map(x => {
      const soHien = phieuTheoSo(x.so)?.so ?? x.so
      if (isTatCa) {
        return [x.ngay, soHien, x.quy ?? '', x.dg, nguonGd(x.dg)[1], x.thu || null, x.chi || null, x.du]
      }
      return [x.ngay, soHien, x.dg, nguonGd(x.dg)[1], x.thu || null, x.chi || null, x.du]
    })

    const hangCong = isTatCa
      ? ['', '', '', 'Cộng', '', loai === 'chi' ? null : tn, loai === 'thu' ? null : tc, gd?.cuoi ?? 0]
      : ['', '', 'Cộng', '', loai === 'chi' ? null : tn, loai === 'thu' ? null : tc, gd?.cuoi ?? 0]

    return xuatBangExcel(tieuDe, phu, cols, [hangDau, ...hangDs], hangCong).catch(() => toast('Không xuất được file Excel'))
  }

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>
      {/* 1. Phần đầu: nút về, tiêu đề, dòng phụ, bộ lọc, Excel, lập phiếu thu, lập phiếu chi (T272) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan">
          <Icon n="chevl" />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Lịch sử thu chi</h1>
          <div style={{ fontSize: '12.5px', color: 'var(--muted, #6b7280)' }}>{dongPhu}</div>
        </div>
        <span className="grow" />
        <Select
          className="inp lsq-loc"
          value={loai}
          aria-label="Loại giao dịch"
          onChange={e => setLoai(e.target.value as '' | 'thu' | 'chi')}
          ds={[
            { v: '', t: 'Tất cả thu, chi' },
            { v: 'thu', t: 'Khoản thu' },
            { v: 'chi', t: 'Khoản chi' },
          ]}
        />
        <NutXuatExcel onXuat={xuatExcel} />
        <Link to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'thu' : 'bc'}`} className="btn">
          <Icon n="plus" className="ic sm" />Lập phiếu thu
        </Link>
        <Link to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'chi' : 'unc'}`} className="btn primary">
          <Icon n="plus" className="ic sm" />Lập phiếu chi
        </Link>
      </div>

      <div className="cpt-cuon" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 2. Bốn ô màu ngang theo mẫu L1: Tồn đầu kỳ, Tiền thu vào, Tiền chi ra, Tồn cuối kỳ (T272) */}
        <div>
          <div className="lsq-l1-the">
            <div className="lsq-l1-st st-dau">
              <span>Tồn đầu kỳ</span>
              <b>{moneyD(gd?.mo ?? 0)}</b>
              <small>Ngày 01/{pad(thang)}/2026</small>
            </div>
            <div className="lsq-l1-st st-thu">
              <span>Tiền thu vào</span>
              <b>+{moneyD(tn)}</b>
              <small>Phiếu thu trong kỳ</small>
            </div>
            <div className="lsq-l1-st st-chi">
              <span>Tiền chi ra</span>
              <b>−{moneyD(tc)}</b>
              <small>Phiếu chi trong kỳ</small>
            </div>
            <div className="lsq-l1-st st-cuoi">
              <span>Tồn cuối kỳ</span>
              <b>{moneyD(gd?.cuoi ?? 0)}</b>
              <small>Số dư hiện tại</small>
            </div>
          </div>
          {isTatCa && (
            <div className="lsq-l1-chuyen-quy">Gồm tiền chuyển giữa các quỹ</div>
          )}
        </div>

        {/* 3. Bảng danh sách chứng từ gom theo ngày theo mẫu L1 (T272) */}
        {!gd || nhom.size === 0 ? (
          <div className="note muted">
            {loai
              ? `Quỹ không có khoản ${loai} nào trong tháng ${thang}/2026.`
              : `Quỹ chưa có giao dịch trong tháng ${thang}/2026.`}
          </div>
        ) : (
          <div className="lsq-l1-bang">
            <div className={`lsq-l1-row lsq-l1-hd ${isTatCa ? 'tat-ca' : ''}`}>
              <span>Số phiếu</span>
              {isTatCa && <span>Quỹ</span>}
              <span>Diễn giải</span>
              <span>Nguồn</span>
              <span className="n">Thu</span>
              <span className="n">Chi</span>
              <span className="n">Số dư</span>
            </div>

            {[...nhom].map(([ngay, ds]) => {
              const tk = thongKeNgay.get(ngay)
              const tongThuNgay = tk?.thu ?? 0
              const tongChiNgay = tk?.chi ?? 0
              const cuoiNgay = tk?.cuoi ?? 0

              return (
                <div key={ngay} className="lsq-l1-ngay-nhom">
                  <div className={`lsq-l1-row lsq-l1-ng ${isTatCa ? 'tat-ca' : ''}`}>
                    <span style={{ gridColumn: isTatCa ? 'span 4' : 'span 3' }}>{tenNgay(ngay)}</span>
                    <span className="n" style={{ color: 'var(--green, #138a52)' }}>
                      {tongThuNgay > 0 ? `+${money(tongThuNgay)}` : ''}
                    </span>
                    <span className="n" style={{ color: 'var(--red, #c2362b)' }}>
                      {tongChiNgay > 0 ? `−${money(tongChiNgay)}` : ''}
                    </span>
                    <span className="n">{money(cuoiNgay)}</span>
                  </div>

                  {ds.map((x, i) => {
                    const p = phieuTheoSo(x.so)
                    const nInfo = nguonGd(x.dg)
                    const laFabi = nInfo[0] === 'fabi'

                    return (
                      <div key={i} className={`lsq-l1-row lsq-l1-ln ${isTatCa ? 'tat-ca' : ''}`}>
                        {p ? (
                          <a
                            href={`#${p.to}`}
                            target="_blank"
                            rel="noopener"
                            className="lsq-l1-so"
                            title="Mở chứng từ gốc ở tab mới"
                          >
                            <span>{p.so}</span>
                            <svg
                              width="13"
                              height="13"
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
                          <span className="lsq-l1-so-thuong">{x.so}</span>
                        )}

                        {isTatCa && <span className="lsq-l1-ten-quy" title={x.quy}>{x.quy}</span>}

                        <span className="lsq-l1-dg">{x.dg}</span>

                        <span className={laFabi ? 'lsq-l1-fabi' : 'lsq-l1-tay'}>
                          {nInfo[1]}
                        </span>

                        <span className="n" style={{ color: 'var(--green, #138a52)', fontWeight: 700 }}>
                          {x.thu > 0 ? `+${money(x.thu)}` : ''}
                        </span>

                        <span className="n" style={{ color: 'var(--red, #c2362b)', fontWeight: 700 }}>
                          {x.chi > 0 ? `−${money(x.chi)}` : ''}
                        </span>

                        <span className="n" style={{ color: '#4b5563' }}>
                          {money(x.du)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        <div className="lsq-l1-ghi-chu">Bấm số phiếu để mở chứng từ gốc ở tab mới.</div>
      </div>
    </div>
  )
}
