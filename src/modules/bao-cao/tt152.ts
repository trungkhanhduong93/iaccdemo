// Bộ sổ hộ kinh doanh TT152 (S1a, S2a, S2b, S2c, S2d, S2e-HKD) theo mẫu iFaster (T179).
// Cột, dòng nhóm, dòng cộng chép theo màn sổ của iFaster đọc ngày 13/10/2026; số liệu sinh mẫu theo tháng.
import type { Col, Row } from '../types'
import { HANG, NVL, TK_NGAN_HANG } from '../../data/mock'
import { k, pad, rng } from '../../ui/format'

/** Ngành nghề tính thuế của hộ kinh doanh: món chế biến tại quán, hàng mua về bán lại */
const NGANH = [
  { ten: 'Sản xuất, vận tải, dịch vụ có gắn với hàng hoá, xây dựng có bao thầu nguyên vật liệu', gtgt: 3, tncn: 1.5 },
  { ten: 'Phân phối, cung cấp hàng hoá', gtgt: 1, tncn: 0.5 },
]

/** Số ngày có số liệu trong tháng: tháng 10 mới tới ngày 07/10 */
const soNgay = (thang: number) => thang === 10 ? 7 : new Date(2026, thang, 0).getDate()
const ngay = (d: number, thang: number) => `${pad(d)}/${pad(thang)}/2026`
const KT = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const soHd = (r: () => number) => Array.from({ length: 12 }, () => KT[Math.floor(r() * KT.length)]).join('')

/** Kênh bán của hoá đơn FABi, dùng cho bộ lọc Kênh bán ở sổ doanh thu (T179) */
export const KENH_BAN = ['Tại quán', 'Mang về', 'GrabFood', 'ShopeeFood', 'Be']

interface DongBan { so: string; ngay: string; d: number; mon: string; nganh: number; tien: number; kenh: string }

/** Món bán trong tháng: mỗi ngày một hoá đơn FABi, 1 tới 3 món; lọc theo kênh bán khi có chọn */
function banHang(thang: number, kenh: string[] = []): DongBan[] {
  const r = rng(`hkd-ban-${thang}`)
  const out: DongBan[] = []
  for (let d = 1; d <= soNgay(thang); d++) {
    const so = soHd(r)
    const k = KENH_BAN[Math.floor(r() * KENH_BAN.length)]
    const n = 1 + Math.floor(r() * 3)
    for (let i = 0; i < n; i++) {
      const h = HANG[Math.floor(r() * HANG.length)]
      const sl = 2 + Math.floor(r() * 9)
      out.push({ so, ngay: ngay(d, thang), d, mon: h.ten, nganh: h.tonKho ? 1 : 0, tien: h.gia * sl, kenh: k })
    }
  }
  return kenh.length ? out.filter(x => kenh.includes(x.kenh)) : out
}

/** Khung lọc chung (bienDoiBang) bỏ dòng không mang giá trị đang lọc: dòng cộng, dòng thuế mang kênh đầu tiên đang chọn để được giữ lại */
const ganKenh = (rows: Row[], kenh: string[]): Row[] => kenh.length ? rows.map(r => r.kenh ? r : { ...r, kenh: kenh[0] }) : rows
const tong = (ds: { tien: number }[]) => ds.reduce((a, x) => a + x.tien, 0)

// ── S1a-HKD: Sổ chi tiết doanh thu bán hàng hoá, dịch vụ (nhóm 1) ──
export const colsS1a: Col[] = [
  { k: 'ngay', t: 'Ngày tháng', w: 110 },
  { k: 'dienGiai', t: 'Diễn giải' },
  { k: 'tien', t: 'Số tiền', num: true, w: 140 },
]

export function rowsS1a(thang: number, kenh: string[] = []): Row[] {
  const ds = banHang(thang, kenh)
  const rows: Row[] = []
  for (let d = 1; d <= soNgay(thang); d++) {
    const t = tong(ds.filter(x => x.d === d))
    if (t) rows.push({ ngay: ngay(d, thang), dienGiai: `Doanh thu bán hàng ngày ${pad(d)}/${pad(thang)}`, tien: t })
  }
  return ganKenh([...rows, { dienGiai: 'Tổng cộng', tien: tong(ds), _t: 1 }], kenh)
}

// ── S2a, S2b-HKD: Sổ doanh thu bán hàng hoá, dịch vụ, nhóm theo ngành nghề ──
export const colsS2a: Col[] = [
  { k: 'so', t: 'Số hiệu (A)', cls: 'code', w: 130, nhom: 'Chứng từ' },
  { k: 'ngay', t: 'Ngày tháng (B)', w: 100, nhom: 'Chứng từ' },
  { k: 'dienGiai', t: 'Diễn giải (C)' },
  { k: 'tien', t: 'Số tiền (1)', num: true, w: 130 },
]

/** S2a (TNCN theo % doanh thu) có dòng thuế TNCN từng ngành và tổng thuế TNCN; S2b (TNCN theo lợi nhuận) chỉ theo dõi thuế GTGT */
function rowsSoDoanhThu(thang: number, coTncn: boolean, kenh: string[] = []): Row[] {
  const ds = banHang(thang, kenh)
  const rows: Row[] = []
  let gtgt = 0, tncn = 0
  NGANH.forEach((ng, i) => {
    const dong = ds.filter(x => x.nganh === i)
    rows.push({ dienGiai: `${i + 1}. Ngành nghề: ${ng.ten} (${dong.length})`, _b: 1, _nhom: 1 })
    rows.push(...dong.map(x => ({ so: x.so, ngay: x.ngay, dienGiai: x.mon, tien: x.tien, kenh: x.kenh })))
    const t = tong(dong)
    const vat = Math.round(t * ng.gtgt / 100), tn = Math.round(t * ng.tncn / 100)
    gtgt += vat; tncn += tn
    rows.push({ dienGiai: `Tổng cộng (${i + 1})`, tien: t, _b: 1 })
    rows.push({ dienGiai: 'Thuế GTGT', tien: vat, _b: 1 })
    if (coTncn) rows.push({ dienGiai: 'Thuế TNCN', tien: tn, _b: 1 })
  })
  rows.push({ dienGiai: 'Tổng số thuế GTGT phải nộp', tien: gtgt, _t: 1 })
  if (coTncn) rows.push({ dienGiai: 'Tổng số thuế TNCN phải nộp', tien: tncn, _t: 1 })
  return ganKenh(rows, kenh)
}
export const rowsS2a = (thang: number, kenh: string[] = []) => rowsSoDoanhThu(thang, true, kenh)
export const colsS2b = colsS2a
export const rowsS2b = (thang: number, kenh: string[] = []) => rowsSoDoanhThu(thang, false, kenh)

// ── S2c-HKD: Sổ chi tiết doanh thu, chi phí ──
export const colsS2c: Col[] = colsS2a

const MUC_CHI_PHI = [
  { ma: 'a', ten: 'Chi phí nguyên liệu, vật liệu, nhiên liệu, năng lượng, hàng hoá sử dụng vào sản xuất, kinh doanh', ty: 0.34, ct: 'XK', dg: 'Xuất kho nguyên vật liệu chế biến' },
  { ma: 'b', ten: 'Chi phí tiền lương, tiền công, các khoản phụ cấp, bảo hiểm bắt buộc và các khoản chi trả cho người lao động có đóng bảo hiểm bắt buộc theo quy định; chi phí tiền lương, tiền công, các khoản phụ cấp và các khoản chi trả cho người lao động dưới 01 tháng', ty: 0.18, ct: 'PC', dg: 'Chi lương nhân viên' },
  { ma: 'c', ten: 'Chi phí khấu hao tài sản cố định phục vụ cho hoạt động sản xuất, kinh doanh theo chế độ quản lý, sử dụng và trích khấu hao tài sản cố định (nếu có)', ty: 0.02, ct: 'KH', dg: 'Khấu hao máy pha cà phê' },
  { ma: 'd', ten: 'Chi phí dịch vụ mua ngoài như điện, nước, điện thoại, internet, vận chuyển, thuê tài sản, sửa chữa, bảo dưỡng', ty: 0.09, ct: 'PC', dg: 'Chi tiền điện, nước, internet' },
  { ma: 'e', ten: 'Chi phí trả lãi tiền vay vốn sản xuất, kinh doanh của tổ chức tín dụng theo lãi suất thực tế. Chi phí trả lãi tiền vay vốn sản xuất, kinh doanh của đối tượng không phải là tổ chức tín dụng không vượt quá mức quy định tại Bộ luật Dân sự', ty: 0, ct: 'PC', dg: '' },
  { ma: 'f', ten: 'Các khoản chi khác phục vụ trực tiếp hoạt động sản xuất, kinh doanh', ty: 0.03, ct: 'PC', dg: 'Chi mua vật dụng, văn phòng phẩm' },
]

/** Thuế suất TNCN trên lợi nhuận theo nhóm doanh thu: nhóm 2 15%, nhóm 3 17%, nhóm 4 20% */
const thueSuatLn = (nhom: number) => nhom >= 4 ? 20 : nhom === 3 ? 17 : 15

export function rowsS2c(thang: number, nhom = 2): Row[] {
  const ds = banHang(thang)
  const dt = tong(ds)
  const rows: Row[] = [{ dienGiai: '1. Doanh thu bán hàng hoá, dịch vụ', tien: dt, _b: 1, _nhom: 1 }]
  for (let d = 1; d <= soNgay(thang); d++) {
    const hd = ds.filter(x => x.d === d)
    if (hd.length) rows.push({ so: hd[0].so, ngay: hd[0].ngay, dienGiai: 'Doanh thu bán hàng', tien: tong(hd) })
  }
  const cp = MUC_CHI_PHI.map(m => ({ ...m, tien: k(dt * m.ty) }))
  const tongCp = tong(cp)
  rows.push({ dienGiai: '2. Chi phí hợp lý', tien: tongCp, _b: 1, _nhom: 1 })
  cp.forEach((m, i) => {
    rows.push({ dienGiai: `${m.ma}. ${m.ten}`, tien: m.tien, _b: 1 })
    if (m.tien) rows.push({ so: `${m.ct}${pad(i + 1, 6)}/${thang}/2026`, ngay: ngay(Math.min(soNgay(thang), 5 + i * 4), thang), dienGiai: m.dg, tien: m.tien })
  })
  const chenh = dt - tongCp
  const ts = thueSuatLn(nhom)
  rows.push({ dienGiai: '3. Chênh lệch (3) = (1) - (2)', tien: chenh, _t: 1 })
  rows.push({ dienGiai: `4. Tổng số thuế TNCN phải nộp (4) = (3) x ${ts}%`, tien: Math.max(0, Math.round(chenh * ts / 100)), _t: 1 })
  return rows
}

// ── S2d-HKD: Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hoá (từng mặt hàng) ──
export const colsS2d: Col[] = [
  { k: 'so', t: 'Số hiệu (A)', cls: 'code', w: 105, nhom: 'Chứng từ' },
  { k: 'ngay', t: 'Ngày tháng (B)', w: 85, nhom: 'Chứng từ' },
  { k: 'dienGiai', t: 'Diễn giải (C)', w: 130 },
  { k: 'dvt', t: 'Đơn vị tính (D)', c: true, w: 60 },
  { k: 'gia', t: 'Đơn giá (1)', num: true, w: 80 },
  { k: 'slNhap', t: 'Số lượng (2)', num: true, w: 65, nhom: 'Nhập' },
  { k: 'ttNhap', t: 'Thành tiền (3)', num: true, w: 90, nhom: 'Nhập' },
  { k: 'slXuat', t: 'Số lượng (4)', num: true, w: 65, nhom: 'Xuất' },
  { k: 'ttXuat', t: 'Thành tiền (5)', num: true, w: 90, nhom: 'Xuất' },
  { k: 'slTon', t: 'Số lượng (6)', num: true, w: 65, nhom: 'Tồn' },
  { k: 'ttTon', t: 'Thành tiền (7)', num: true, w: 90, nhom: 'Tồn' },
  { k: 'ghiChu', t: 'Ghi chú (8)', w: 70 },
]

/** Mặt hàng mặc định của sổ S2d: cà phê hạt, nguyên liệu chính của quán */
export const MAT_HANG_S2D = NVL.find(n => n.ma === 'NVL008') ?? NVL[0]

export function rowsS2d(thang: number, mh = MAT_HANG_S2D): Row[] {
  const r = rng(`hkd-kho-${thang}-${mh.ma}`)
  let sl = 8 + Math.floor(r() * 6), tt = sl * mh.gia
  const rows: Row[] = [{ ngay: ngay(1, thang), dienGiai: 'Số dư đầu kỳ', dvt: mh.dvt, slTon: sl, ttTon: tt, _b: 1 }]
  let stt = 1
  for (let d = 2; d <= soNgay(thang); d += 3 + Math.floor(r() * 3)) {
    const nhap = d % 2 === 0
    const so = () => `${nhap ? 'NM' : 'XK'}${pad(stt++, 6)}/${thang}/2026`   // chỉ cấp số khi có phiếu
    if (nhap) {
      const q = 5 + Math.floor(r() * 6), gia = Math.round(mh.gia * (0.96 + r() * 0.08) / 100) * 100
      sl += q; tt += q * gia
      rows.push({ so: so(), ngay: ngay(d, thang), dienGiai: 'Nhập mua hàng', dvt: mh.dvt, gia, slNhap: q, ttNhap: q * gia, slXuat: 0, ttXuat: 0, slTon: sl, ttTon: tt })
    } else {
      const q = Math.min(sl, 3 + Math.floor(r() * 5))
      if (q === 0) continue   // hết hàng thì không xuất
      const gia = Math.round(tt / sl)
      sl -= q; tt -= q * gia
      rows.push({ so: so(), ngay: ngay(d, thang), dienGiai: 'Xuất kho chế biến', dvt: mh.dvt, gia, slNhap: 0, ttNhap: 0, slXuat: q, ttXuat: q * gia, slTon: sl, ttTon: tt })
    }
  }
  rows.push({ ngay: ngay(soNgay(thang), thang), dienGiai: 'Số dư cuối kỳ', dvt: mh.dvt, slTon: sl, ttTon: tt, _t: 1 })
  return rows
}

// ── S2e-HKD: Sổ chi tiết tiền (tiền mặt và từng tài khoản ngân hàng) ──
export const colsS2e: Col[] = [
  { k: 'so', t: 'Số hiệu (A)', cls: 'code', w: 120, nhom: 'Chứng từ' },
  { k: 'ngay', t: 'Ngày tháng (B)', w: 100, nhom: 'Chứng từ' },
  { k: 'dienGiai', t: 'Diễn giải (C)' },
  { k: 'thu', t: 'Thu/Gửi vào', num: true, w: 130, nhom: 'Số tiền' },
  { k: 'chi', t: 'Chi/Rút ra', num: true, w: 130, nhom: 'Số tiền' },
]

export function rowsS2e(thang: number): Row[] {
  const quy = [
    { ten: 'Tiền mặt tại quỹ', tm: true },
    ...TK_NGAN_HANG.map(t => ({ ten: `${t.nh.split(',')[0]} - ${t.so}`, tm: false })),
  ]
  const rows: Row[] = []
  quy.forEach((q, qi) => {
    const r = rng(`hkd-tien-${thang}-${qi}`)
    const dau = k((q.tm ? 6_000_000 : 20_000_000) * (0.8 + r() * 0.4))
    const nhan = q.tm ? ['Tiền mặt', 'Tổng thu trong kỳ', 'Tổng chi trong kỳ'] : ['Tiền gửi', 'Tổng gửi vào trong kỳ', 'Tổng tiền rút ra trong kỳ']
    rows.push({ dienGiai: q.ten, _b: 1, _nhom: 1 })
    rows.push({ dienGiai: `${nhan[0]} đầu kỳ`, thu: dau, _b: 1 })
    let thu = 0, chi = 0, stt = 1
    for (let d = 3; d <= soNgay(thang); d += 4 + Math.floor(r() * 4)) {
      const tien = k((q.tm ? 2_500_000 : 6_000_000) * (0.5 + r()))
      const vao = r() < 0.6 || tien > dau + thu - chi   // không rút quá số đang có
      if (vao) thu += tien; else chi += tien
      rows.push({
        so: `${vao ? (q.tm ? 'PT' : 'BC') : (q.tm ? 'PC' : 'UNC')}${pad(stt++, 6)}/${thang}/2026`, ngay: ngay(d, thang),
        dienGiai: vao ? (q.tm ? 'Thu tiền bán hàng' : 'Khách chuyển khoản tiền hàng') : (q.tm ? 'Chi mua nguyên liệu' : 'Chuyển khoản trả nhà cung cấp'),
        thu: vao ? tien : 0, chi: vao ? 0 : tien,
      })
    }
    rows.push({ dienGiai: nhan[1], thu, _b: 1 })
    rows.push({ dienGiai: nhan[2], chi, _b: 1 })
    rows.push({ dienGiai: `${nhan[0]} cuối kỳ`, thu: dau + thu - chi, _b: 1 })
  })
  return rows
}
