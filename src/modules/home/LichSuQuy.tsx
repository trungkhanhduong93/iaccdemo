// Lịch sử thu chi một quỹ kiểu app ngân hàng (T230): mở khi bấm quỹ ở khối Tồn quỹ trang chủ gói Free.
// Giao dịch lấy từ Sổ quỹ tiền mặt (quỹ tiền mặt cửa hàng) hoặc Sổ ngân hàng (tài khoản), gom theo ngày, mới nhất trên cùng;
// bấm giao dịch mở chứng từ chi tiết theo số phiếu (cách dò phiếu thật của T201)
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { CUA_HANG, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { between, k, moneyD, pad, rng } from '../../ui/format'
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
  gio?: string
  doiTuong?: string
}

/** Phân loại nhóm lý do theo Phương án A (T395): bán hàng, nguyên vật liệu, ngân hàng, công nợ, vận hành */
export function phanLoaiGiaoDich(dg: string): { nhom: 'sales' | 'food' | 'utility' | 'bank' | 'adv'; icon: string; cls: string } {
  const d = dg.toLowerCase()
  if (/bán hàng|pos|fabi|doanh thu/i.test(d)) {
    return { nhom: 'sales', icon: 'cart', cls: 'ic-sales' }
  }
  if (/rau|củ|hải sản|nguyên vật liệu|nvl|thực phẩm|thịt|chợ|hàng hoá/i.test(d)) {
    return { nhom: 'food', icon: 'box', cls: 'ic-food' }
  }
  if (/ngân hàng|vietcombank|techcombank|tài khoản|nộp tiền|rút tiền|chuyển khoản/i.test(d)) {
    return { nhom: 'bank', icon: 'bank', cls: 'ic-bank' }
  }
  if (/tạm ứng|hoàn ứng|công ty|khách|đối tác|công nợ|đặt cọc|nhân viên/i.test(d)) {
    return { nhom: 'adv', icon: 'users', cls: 'ic-adv' }
  }
  if (/điện|nước|gas|vận chuyển|ahamove|grab|sửa|máy|chi phí|vận hành|thuê|internet/i.test(d)) {
    return { nhom: 'utility', icon: 'truck', cls: 'ic-utility' }
  }
  return { nhom: 'utility', icon: 'doc', cls: 'ic-utility' }
}

/** Sinh giờ giao dịch cố định và đối tượng cụ thể từ nội dung và số phiếu (T395) */
export function layGioVaDoiTuong(so: string, dg: string, ngay: string): { gio: string; doiTuong?: string } {
  const str = so + ngay
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  const abs = Math.abs(hash)
  const h = 8 + (abs % 12)
  const m = (Math.floor(abs / 12) % 12) * 5
  const gio = `${pad(h)}:${pad(m)}`

  const d = dg.toLowerCase()
  let doiTuong: string | undefined
  if (/rau|củ/i.test(d)) doiTuong = 'NCC Rau sạch Đà Lạt'
  else if (/hải sản/i.test(d)) doiTuong = 'Vựa hải sản Phát Đạt'
  else if (/nguyên vật liệu|nvl/i.test(d)) doiTuong = 'NCC Thực phẩm Á Châu'
  else if (/điện/i.test(d)) doiTuong = 'Cty Điện lực Chợ Lớn'
  else if (/nước/i.test(d)) doiTuong = 'Cty Cấp nước Gia Định'
  else if (/gas/i.test(d)) doiTuong = 'Gas Petrolimex Sài Gòn'
  else if (/vận chuyển|giao hàng/i.test(d)) doiTuong = 'Ahamove Delivery'
  else if (/sửa/i.test(d)) doiTuong = 'Cty Cơ điện Lạnh Tân Phát'
  else if (/khách công ty/i.test(d)) doiTuong = 'Cty CP Truyền thông Sao Mai'
  else if (/tạm ứng/i.test(d)) doiTuong = 'Nhân viên bếp'
  else if (/hoàn ứng/i.test(d)) doiTuong = 'Nhân viên thu mua'
  else if (/đặt cọc/i.test(d)) doiTuong = 'Chị Mai Hương'

  return { gio, doiTuong }
}

/** Giao dịch gộp tất cả quỹ trong tháng (T272) */
export function gopGiaoDichTatCa(thang: number, cnIds?: string[]): { mo: number; cuoi: number; thu: number; chi: number; ds: GiaoDich[] } {
  const ids = cnIds && cnIds.length > 0 ? cnIds : CUA_HANG.map(c => c.id)
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
  const cn = CUA_HANG.find(c => tenQuyTm(c.ngan) === quy)
  if (cn) {
    const so = soQuyCn(cn.id, thang)
    const doiSo = (s: unknown) => { const m = /^([A-Z]+)\d+-(\d+)$/.exec(String(s ?? '')); return m ? `${m[1]}26${pad(thang)}-${pad(Number(m[2]), 4)}` : '' }
    const ds = so.rows.map((r: Row) => {
      const s = doiSo(r.thu ?? r.chi)
      const dg = String(r.dg)
      const ngay = String(r.ngay)
      const { gio, doiTuong } = layGioVaDoiTuong(s, dg, ngay)
      return {
        ngay,
        so: s,
        dg,
        thu: Number(r.no) || 0,
        chi: Number(r.co) || 0,
        du: Number(r.du) || 0,
        quy,
        gio,
        doiTuong,
      }
    })
    return { mo: so.mo, cuoi: so.cuoi, ds }
  }
  const iTk = TK_NGAN_HANG.findIndex(t => tenTkNh(t) === quy)
  if (iTk < 0) return undefined
  // Như Sổ ngân hàng 2.2.3: mỗi cửa hàng, mỗi tài khoản một phần, gộp các cửa hàng theo ngày
  const chia = CUA_HANG.length * TK_NGAN_HANG.length
  const soMot = (hat: string) => soChiTiet(hat, k(between(rng(hat + thang), 80e6, 260e6) / chia), ['Thu tiền bán hàng ngày', 'Chi mua nguyên vật liệu', 'Chi tiền điện tháng', 'Thu tiền khách công ty',
    'Chi tạm ứng nhân viên', 'Nộp tiền vào tài khoản ngân hàng', 'Chi phí vận chuyển', 'Thu hoàn ứng'], ['5111', '331', '6422', '131', '141', '1121', '6421'], [1.5e6, 38e6], thang)
  const so = gopSo(CUA_HANG.map(c => ({ cn: c.ngan, ...soMot('2.2.3' + c.id + (iTk || '')) })))
  const ds = so.rows.map(r => {
    const s = String(r.so)
    const dg = String(r.dienGiai)
    const ngay = String(r.ngay)
    const { gio, doiTuong } = layGioVaDoiTuong(s, dg, ngay)
    return {
      ngay,
      so: s,
      dg,
      thu: Number(r.no) || 0,
      chi: Number(r.co) || 0,
      du: Number(r.du) || 0,
      quy,
      gio,
      doiTuong,
    }
  })
  return { mo: so.mo, cuoi: so.cuoi, ds }
}

/** Tồn quỹ từng quỹ trong tháng theo Sổ quỹ tiền mặt, Sổ ngân hàng (cùng nguồn với Lịch sử thu chi, T230):
 *  quỹ tiền mặt của cửa hàng đang xem (cnIds) và mọi tài khoản ngân hàng */
export function tonQuyTheoSo(thang: number, cnIds: string[]) {
  const ten = [...CUA_HANG.filter(c => cnIds.includes(c.id)).map(c => tenQuyTm(c.ngan)), ...TK_NGAN_HANG.map(tenTkNh)]
  return ten.map(quy => {
    const g = giaoDich(quy, thang)!
    return { quy, tienMat: quy.startsWith('Quỹ tiền mặt'), mo: g.mo, cuoi: g.cuoi, thu: g.ds.reduce((a, x) => a + x.thu, 0), chi: g.ds.reduce((a, x) => a + x.chi, 0) }
  })
}

/** Nguồn giao dịch (T264): tiền bán hàng do FABi đẩy về, còn lại là phiếu lập tay; nhãn như cột Nguồn của danh sách chứng từ */
const nguonGd = (dg: string) => NGUON[/bán hàng/i.test(dg) ? 'FABi' : 'tay']

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
export const tenNgay = (ngay: string) => { const [d, m, y] = ngay.split('/').map(Number); return `${THU[new Date(y, m - 1, d).getDay()]}, ${ngay}` }

export function LichSuQuy(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { toast } = useSession()
  const [tham, setTham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CUA_HANG[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const isTatCa = quy === 'tat-ca'
  const gd = giaoDich(quy, thang)
  // Lọc quỹ (T279): tất cả quỹ hoặc một quỹ tiền mặt, một tài khoản ngân hàng; ghi vào địa chỉ để mở lại đúng quỹ
  const dsQuy = [{ v: 'tat-ca', t: 'Tất cả quỹ' }, ...CUA_HANG.map(c => tenQuyTm(c.ngan)), ...TK_NGAN_HANG.map(tenTkNh)].map(q => typeof q === 'string' ? { v: q, t: q } : q)
  const doiQuy = (v: string) => { const t = new URLSearchParams(tham); t.set('quy', v); setTham(t, { replace: true }) }

  // Lọc loại giao dịch: tất cả, chỉ khoản thu, chỉ khoản chi (T246); danh sách và file Excel theo bộ lọc, số dư đầu, cuối kỳ giữ nguyên
  const [loai, setLoai] = useState<'' | 'thu' | 'chi'>('')
  const dsLoc = (gd?.ds ?? []).filter(x => !loai || (loai === 'thu' ? x.thu > 0 : x.chi > 0))
  const tienMat = isTatCa ? true : CUA_HANG.some(c => tenQuyTm(c.ngan) === quy)

  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDich[]>()
  for (const x of [...dsLoc].reverse()) nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0)
  const tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)
  const soKhoanThu = (gd?.ds ?? []).filter(x => x.thu > 0).length
  const soKhoanChi = (gd?.ds ?? []).filter(x => x.chi > 0).length

  // Thống kê từng ngày từ giao dịch gốc chưa lọc
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
      {/* 1. Phần đầu: nút về, tiêu đề, dòng phụ, bộ lọc, Excel, lập phiếu thu, lập phiếu chi (giữ nguyên theo Trum chốt) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan">
          <Icon n="chevl" />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Lịch sử thu chi</h1>
          <div style={{ fontSize: '12.5px', color: 'var(--muted, #6b7280)' }}>{dongPhu}</div>
        </div>
        <span className="grow" />
        <Select className="inp lsq-loc-quy" value={quy} aria-label="Quỹ" onChange={e => doiQuy(e.target.value)} ds={dsQuy} />
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

      {/* 2. Bốn ô tóm tắt nền thẻ trắng nhẹ (không khối màu đặc) theo Phương án A (T395) */}
      <div className="lsq-stat-grid-4">
        <div className="lsq-stat-card">
          <span className="lbl">Tồn đầu kỳ</span>
          <span className="val">{moneyD(gd?.mo ?? 0)}</span>
          <span className="note">01/{pad(thang)}/2026</span>
        </div>
        <div className="lsq-stat-card c-thu">
          <span className="lbl">Tiền thu vào (+)</span>
          <span className="val">+{moneyD(tn)}</span>
          <span className="note">{soKhoanThu} khoản thu trong tháng</span>
        </div>
        <div className="lsq-stat-card c-chi">
          <span className="lbl">Tiền chi ra (-)</span>
          <span className="val">-{moneyD(tc)}</span>
          <span className="note">{soKhoanChi} khoản chi trong tháng</span>
        </div>
        <div className="lsq-stat-card c-cuoi lsq-l1-st st-cuoi">
          <span className="lbl">Tồn cuối kỳ</span>
          <span className="val"><b>{moneyD(gd?.cuoi ?? 0)}</b></span>
          <span className="note">Số dư hiện tại</span>
        </div>
      </div>

      <div className="cpt-cuon">
        {!gd || nhom.size === 0 ? (
          <div className="note muted">
            {loai
              ? `Quỹ không có khoản ${loai} nào trong tháng ${thang}/2026.`
              : `Quỹ chưa có giao dịch trong tháng ${thang}/2026.`}
          </div>
        ) : (
          <div className="tx-stream lsq-ds">
            {[...nhom].map(([ngay, ds]) => {
              const tk = thongKeNgay.get(ngay)
              return (
                <div key={ngay} className="day-group">
                  <div className="day-header">
                    <span className="day-header-left">{tenNgay(ngay)}</span>
                    <div className="day-header-right">
                      {tk && tk.thu > 0 && <span className="day-in">Thu: +{moneyD(tk.thu)}</span>}
                      {tk && tk.chi > 0 && <span className="day-out">Chi: -{moneyD(tk.chi)}</span>}
                      <span className="day-balance">Cuối ngày: {moneyD(tk?.cuoi ?? 0)}</span>
                    </div>
                  </div>

                  <div className="day-items">
                    {ds.map((x, i) => {
                      const p = phieuTheoSo(x.so)
                      const isFabi = /bán hàng/i.test(x.dg)
                      const loaiInfo = phanLoaiGiaoDich(x.dg)
                      const laThu = x.thu > 0
                      const soDu = isTatCa ? (x.duGop ?? x.du) : x.du
                      const noiDung = (
                        <>
                          <div className="tx-left">
                            <div className={`tx-icon ${loaiInfo.cls}`}>
                              <Icon n={loaiInfo.icon} className="ic sm" />
                            </div>
                            <div className="tx-meta">
                              <div className="tx-title">{x.dg}</div>
                              <div className="tx-sub">
                                <span className="code">{p?.so ?? x.so}</span>
                                {x.gio && <span>· {x.gio}</span>}
                                {x.doiTuong && <span>· Đối tượng: {x.doiTuong}</span>}
                                {x.quy && <span className="badge-fund">· {x.quy}</span>}
                                <span>· <span className={isFabi ? 'badge-fabi' : 'badge-manual'}>{isFabi ? 'FABi POS' : 'Thủ công'}</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="tx-right">
                            <div className={`tx-amount ${laThu ? 'in' : 'out'}`}>
                              {laThu ? `+${moneyD(x.thu)}` : `-${moneyD(x.chi)}`}
                            </div>
                            <div className="tx-running-balance lsq-so">
                              <small>Số dư {moneyD(soDu)}</small>
                            </div>
                          </div>
                        </>
                      )

                      return p ? (
                        <a
                          key={i}
                          href={`#${p.to}`}
                          target="_blank"
                          rel="noopener"
                          className="tx-item lsq-dong"
                          title="Mở chứng từ gốc ở tab mới"
                        >
                          {noiDung}
                        </a>
                      ) : (
                        <div key={i} className="tx-item lsq-dong">
                          {noiDung}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
