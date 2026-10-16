// Sinh dữ liệu giả cho màn chung. Có hạt giống theo mã màn nên mở lại vẫn ra đúng số cũ.
import type { Row, VoucherCfg } from '../../modules/types'
import { CHI_NHANH, HANG, HOM_NAY, KHACH, KHOAN_MUC, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { between, dmy, fold, k, pad, pick, rng } from '../format'

export function doiTuongDs(kind: VoucherCfg['doiTuong']): { ma: string; ten: string }[] {
  if (kind === 'kh') return KHACH
  if (kind === 'ncc') return NCC
  if (kind === 'nv') return NHAN_VIEN
  if (kind === 'cn') return CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten }))
  return [{ ma: '', ten: '' }]
}

/** Nhóm hàng hoá, dịch vụ mua vào theo tờ khai 01/GTGT, chọn trên dòng phiếu mua có hoá đơn (gói Plus, Pro, T162) */
export const NHOM_HHDV = [
  'HHDV dùng riêng cho SXKD chịu thuế, đủ điều kiện khấu trừ',
  'HHDV không đủ điều kiện khấu trừ',
  'HHDV dùng chung cho SXKD chịu thuế và không chịu thuế',
  'HHDV dùng cho dự án đầu tư',
  'HHDV không tổng hợp trên tờ khai 01/GTGT',
]

/** Cột Diễn giải ở danh sách mua, bán (T286): tên hàng trong phiếu, bỏ trùng; nhiều hơn toiDa tên thì cắt rồi thêm "..." */
export function tomTatTenHang(ds: string[], toiDa = 3) {
  const ten = [...new Set(ds.filter(Boolean))]
  return ten.length > toiDa ? `${ten.slice(0, toiDa).join(', ')}...` : ten.join(', ')
}

export interface Dong {
  nhomHhdv?: string            // nhóm HHDV mua vào (T162), thiếu là nhóm đầu
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number
  tien: number
  ts: number
  thue: number
  ptCk?: number
  ck?: number
  kho?: string
  tkNo?: string
  tkCo?: string
  stt?: number
  dt?: string
  ly?: string                  // lý do thu, chi của dòng phiếu tiền (T49)
  km?: string
  cv?: string
  lo?: string
  hsd?: string
  tonHt?: number               // phiếu kiểm kê: tồn hệ thống, tồn thực tế, ghi chú dòng (T124)
  tonTt?: number
  ghiChu?: string
}

export interface TTNghiepVu {
  ttTien: 'chua' | 'mot' | 'da'
  ttHd: 'chua' | 'da'
  dc: string
  nguoi: string
  mst: string
  soHd: string
  ngayHd: string
  kyHieuHd: string
  hanTt: string
  dieuKhoan: string
}

const DIA_CHI_MAU = [
  '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
  '128 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM',
  '234 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM',
  '78 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP.HCM',
  '56 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP.HCM',
  '12 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
]

const NGUOI_MAU = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Minh Tuấn', 'Vũ Bích Ngọc', 'Đỗ Thanh Tùng',
]

export function ttNghiepVu(row: Row): TTNghiepVu {
  const r = rng(`${row.so}-tt`)
  const ttTien: 'chua' | 'mot' | 'da' = row.tt === 'nhap'
    ? (r() < 0.8 ? 'chua' : 'mot')
    : (r() < 0.6 ? 'da' : r() < 0.85 ? 'mot' : 'chua')
  const ttHd: 'chua' | 'da' = row.nguon === 'HĐ' ? 'da' : (r() < 0.7 ? 'da' : 'chua')
  const dc = pick(r, DIA_CHI_MAU)
  const nguoi = pick(r, NGUOI_MAU)
  const mst = `03${pad(Math.floor(r() * 90000000) + 10000000, 8)}`
  const soHd = pad(Math.floor(r() * 90000) + 10000, 7)
  const ngayHd = String(row.ngay)
  const kyHieuHd = String(row.so).startsWith('CTBH') || String(row.so).startsWith('HD') ? '1C26TBB' : '1C26TMM'
  const hanTt = row.ngay ? (() => {
    const parts = String(row.ngay).split('/')
    if (parts.length === 3) {
      const dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      dt.setDate(dt.getDate() + 30)
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`
    }
    return '06/11/2026'
  })() : '06/11/2026'
  const dieuKhoan = pick(r, ['Nợ 30 ngày', 'Nợ 15 ngày', 'Thanh toán ngay', 'Gối đầu theo tuần'])
  return { ttTien, ttHd, dc, nguoi, mst, soHd, ngayHd, kyHieuHd, hanTt, dieuKhoan }
}

/** Xác định loại thu chi từ cấu hình và mã hạt giống */
export function loaiThuChiCua(cfg: VoucherCfg, id: string): 'thu' | 'chi' | 'bc' | 'unc' | 'cq' | 'dccn' | '' {
  const p = cfg.prefix
  if (p === 'PT' || id.includes('-thu-') || id.includes('mau-thu')) return 'thu'
  if (p === 'PC' || id.includes('-chi-') || id.includes('mau-chi')) return 'chi'
  if (p === 'BC' || id.includes('-bc-') || id.includes('mau-bc')) return 'bc'
  if (p === 'UNC' || id.includes('-unc-') || id.includes('mau-unc')) return 'unc'
  if (p === 'CQ' || id.includes('-cq-') || id.includes('mau-cq')) return 'cq'
  if (p === 'DCCN' || id.includes('-dccn-') || id.includes('mau-dccn')) return 'dccn'
  return ''
}

/** Đoán lý do thu chi từ diễn giải; thứ tự kiểm quan trọng: "trả tiền nhà cung cấp thịt bò" là trả NCC, không phải mua */
export function doanLyDoThuChi(loai: string, ten: string): string {
  const l = fold(ten)
  const co = (...ds: string[]) => ds.some(x => l.includes(x))
  // Tên lý do theo danh sách FABi (T269)
  if (loai === 'thu' || loai === 'bc') {
    if (co('tra no', 'no khach', 'grabfood')) return 'Thu Nợ'
    if (co('hoan ung')) return 'Thu tiền hoàn ứng của nhân viên'
    if (co('phe lieu')) return 'Thu tiền bán phế liệu'
    if (co('dat coc')) return 'Khách hàng đặt cọc'
    if (co('ban hang', 'dat tiec', 'don')) return 'Thu tiền bán hàng'
    return 'Thu khác'
  }
  if (loai === 'chi' || loai === 'unc') {
    if (co('cho phan bo', '6 thang')) return 'Chi phí chờ phân bổ'
    if (co('tam ung')) return 'Tạm ứng cho nhân viên'
    if (co('nop thue', 'thue gtgt')) return 'Chi tiền nộp thuế'
    if (co('thue mat bang', 'thue nha')) return 'Chi tiền thuê nhà'
    if (co('nha cung cap', 'tra tien')) return 'Thanh toán tiền cho nhà cung cấp'
    if (co('tien nha')) return 'Chi tiền thuê nhà'
    if (co('luong')) return 'Thanh toán tiền lương'
    if (co('tien dien')) return 'Thanh toán tiền điện'
    if (co('tien nuoc')) return 'Thanh toán tiền nước'
    if (co('internet')) return 'Thanh toán tiền internet'
    if (co('van chuyen', 'ship')) return 'Chi phí vận chuyển'
    if (co('quang cao', 'marketing')) return 'Chi tiền quảng cáo, marketing'
    if (co('sua')) return 'Chi phí sửa chữa'
    if (co('ccdc', 'cong cu')) return 'Chi phí công cụ dụng cụ'
    if (co('tscd', 'tai san')) return 'Chi phí tài sản cố định'
    if (co('mua', 'nguyen lieu', 'rau', 'thit', 'gas')) return 'Chi phí nguyên liệu phụ'
    return 'Chi phí khác'
  }
  return ''
}

// Tài khoản đối ứng ngầm định của từng lý do thu chi (danh mục LY_DO chưa có cột tài khoản), số hiệu TT133
const TK_LY_DO: Record<string, string> = {
  'Thu tiền bán hàng': '5111', 'Thu Nợ': '131', 'Thu tiền hoàn ứng của nhân viên': '141', 'Thu khác': '711',
  'Chi phí nguyên liệu phụ': '152', 'Thanh toán tiền cho nhà cung cấp': '331', 'Thanh Toán Công Nợ Nhà Cung Cấp': '331',
  'Thanh toán tiền lương': '334', 'Tạm ứng cho nhân viên': '141',
  'Chi tiền thuê nhà': '6422', 'Chi phí công cụ dụng cụ': '153', 'Chi phí tài sản cố định': '211', 'Chi phí chờ phân bổ': '242',
  'Chi phí khác': '6422',
}
const tkDoiUngTheoLyDo = (ly: string) => TK_LY_DO[ly] ?? '6422'

/** TK Nợ, Có của dòng thu chi theo loại phiếu (thu, chi, bc, unc hoặc nhóm nhthu, nhchi) và lý do; loại khác trả rỗng (T233) */
export function tkTheoLyDo(loai: string, ly: string): { tkNo?: string; tkCo?: string } {
  const du = tkDoiUngTheoLyDo(ly)
  if (loai === 'thu') return { tkNo: '1111', tkCo: du }
  if (loai === 'chi') return { tkNo: du, tkCo: '1111' }
  if (loai === 'bc' || loai === 'nhthu') return { tkNo: '1121', tkCo: du }
  if (loai === 'unc' || loai === 'nhchi') return { tkNo: du, tkCo: '1121' }
  return {}
}

/** Cặp tài khoản Nợ/Có ngầm định cho dòng thu chi hoặc các màn dong: 'tien' */
export function dinhKhoanDongTien(cfg: VoucherCfg, id: string, ten: string): { tkNo?: string; tkCo?: string; ly?: string } {
  const loai = loaiThuChiCua(cfg, id)
  if (loai === 'thu' || loai === 'chi' || loai === 'bc' || loai === 'unc') {
    const ly = doanLyDoThuChi(loai, ten)
    return { ...tkTheoLyDo(loai, ly), ly }
  }
  if (loai === 'cq') {
    const isRut = ten.toLowerCase().includes('rút')
    return {
      tkNo: isRut ? '1111' : '1121',
      tkCo: isRut ? '1121' : '1111',
    }
  }
  if (loai === 'dccn') {
    return { tkNo: '131', tkCo: '131' }
  }
  if (cfg.noCo && cfg.noCo.length > 0) {
    return { tkNo: cfg.noCo[0][0], tkCo: cfg.noCo[0][1] }
  }
  return {}
}

export function dongCua(cfg: VoucherCfg, id: string): Dong[] {
  const r = rng(id)
  const r2 = rng(id + '-ct')
  const kind = cfg.dong ?? 'tien'
  if (kind === 'tien' || kind === 'ts') {
    const n = 1 + Math.floor(r() * 2)
    return Array.from({ length: n }, (_, i) => {
      const tien = k(between(r, cfg.tien[0], cfg.tien[1]) / n)
      const ts = cfg.thue ?? 0
      const km = kind === 'tien' ? pick(r2, KHOAN_MUC).ma : undefined
      const cv = kind === 'tien' ? '' : undefined
      const ten = cfg.dienGiai[(i + Math.floor(r() * 9)) % cfg.dienGiai.length]
      const dk = dinhKhoanDongTien(cfg, id, ten)
      return {
        ma: '',
        ten,
        dvt: '',
        sl: 1,
        gia: tien,
        tien,
        ts,
        thue: Math.round(tien * ts / 100),
        ...(kind === 'tien' ? { km, cv, ...dk } : {}),
      }
    })
  }
  const src = kind === 'hang' ? HANG : NVL
  const n = 2 + Math.floor(r() * 4)
  const used = new Set<number>()
  const out: Dong[] = []
  for (let i = 0; i < n; i++) {
    let j = Math.floor(r() * src.length)
    while (used.has(j)) j = (j + 1) % src.length
    used.add(j)
    const h = src[j]
    const sl = h.gia > 100000 ? Math.round(between(r, 2, 18)) : Math.round(between(r, 10, 80))
    const tien = sl * h.gia
    const ts = cfg.thue === 0 ? 0 : h.ts
    const extra: Partial<Dong> = {}
    if (kind === 'nvl') {
      const d = new Date(2026, 9, 10 + Math.floor(r2() * 52))
      extra.lo = `L2610-${pad(i + 1)}`
      extra.hsd = dmy(d)
    }
    if (cfg.kiemKe) {
      // Kiểm kê (T124): tồn thực tế đếm được; tồn hệ thống lệch vài đơn vị ở khoảng nửa số dòng
      const lech = [0, 0, 0, -2, -1, 1, 2][Math.floor(r2() * 7)]
      extra.tonTt = sl
      extra.tonHt = Math.max(0, sl - lech)
      extra.ghiChu = lech < 0 ? 'Hao hụt khi sơ chế' : lech > 0 ? 'Nhập chưa ghi phiếu' : ''
    }
    out.push({ ma: h.ma, ten: h.ten, dvt: h.dvt, sl, gia: h.gia, tien, ts, thue: Math.round(tien * ts / 100), ...extra })
  }
  return out
}

export function tongDong(ds: Dong[]) {
  const tien = ds.reduce((a, d) => a + d.tien, 0), thue = ds.reduce((a, d) => a + d.thue, 0)
  return { tien, thue, tong: tien + thue }
}

/** Sinh giờ cố định theo số phiếu (07:00 đến 21:59, cùng phiếu luôn cùng giờ) (T74) */
export function gioPhieu(so: string): string {
  let h = 0
  for (let i = 0; i < so.length; i++) {
    h = ((h << 5) - h + so.charCodeAt(i)) | 0
  }
  const span = 15 * 60 // 07:00 đến 21:59 = 900 phút
  const offset = Math.abs(h) % span
  const tongPhut = 7 * 60 + offset
  const hh = Math.floor(tongPhut / 60)
  const mm = tongPhut % 60
  return `${pad(hh)}:${pad(mm)}`
}

/** Chứng từ trải từ 07/10 lùi về đầu tháng 9 (mặc định 26 phiếu, hoặc theo cfg.soPhieu) */
export function chungTu(cfg: VoucherCfg, seed: string): Row[] {
  const soPhieu = cfg.soPhieu ?? 26

  // Giữ nguyên hành vi cũ cho cfg không có soPhieu hoặc soPhieu <= 26
  if (soPhieu <= 26) {
    const r = rng(seed)
    const dts = doiTuongDs(cfg.doiTuong)
    const rows: Row[] = []
    let d = new Date(HOM_NAY)
    for (let i = 0; i < 26; i++) {
      const so = `${cfg.prefix}${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${pad(260 - i * 3 - Math.floor(r() * 3), 4)}`
      const dt = pick(r, dts)
      const id = `${seed}-${i}`
      const t = tongDong(dongCua(cfg, id))
      const nguon = cfg.nguon && cfg.nguon !== 'tay' && r() < 0.75 ? cfg.nguon : 'tay'
      const g = gioPhieu(so)
      // Phiếu kiểm kê mẫu (T124): các chi nhánh lần lượt có phiếu để chi nhánh nào cũng thấy phiếu trong tháng; kho, ghi chú theo chi nhánh của phiếu
      const cnKk = cfg.kiemKe ? CHI_NHANH[i % CHI_NHANH.length] : undefined
      const khoKk = cnKk ? cnKk.kho[Math.floor(i / CHI_NHANH.length) % cnKk.kho.length] : ''
      const dgKk = cnKk ? `${i % 4 === 0 ? 'Kiểm kê cuối tháng' : 'Kiểm kê đột xuất'} ${khoKk}` : ''
      rows.push({
        id: String(i), so, ngay: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, gio: g, thang: d.getMonth() + 1,
        doiTuong: dt.ten, maDt: dt.ma, cn: cnKk ? cnKk.ten : pick(r, CHI_NHANH).ten,
        dienGiai: cnKk ? dgKk : pick(r, cfg.dienGiai), tien: t.tien, thue: t.thue, tong: t.tong, nguon,
        tt: i < 3 ? 'nhap' : i === 5 ? 'loi' : 'ghi',
        ...(cnKk ? { _kho: khoKk, _ghiChu: dgKk } : {}),
      })
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (r() < 0.55 ? 1 : 2))
    }
    return rows
  }

  // Khi soPhieu > 26 (vd 80): sinh phiếu trải đều từ 01/09/2026 tới HOM_NAY (07/10/2026)
  const r = rng(seed)
  const dts = doiTuongDs(cfg.doiTuong)

  // Danh sách ngày tháng 9 (30 ngày) và tháng 10 (7 ngày)
  const ngayT9: { d: Date; isWeekend: boolean }[] = []
  for (let day = 1; day <= 30; day++) {
    const d = new Date(2026, 8, day)
    ngayT9.push({ d, isWeekend: d.getDay() === 0 || d.getDay() === 6 })
  }
  const ngayT10: { d: Date; isWeekend: boolean }[] = []
  for (let day = 1; day <= 7; day++) {
    const d = new Date(2026, 9, day)
    ngayT10.push({ d, isWeekend: d.getDay() === 0 || d.getDay() === 6 })
  }

  // Phân bổ số phiếu mỗi ngày (1-4 phiếu, ngày thường nhiều hơn cuối tuần)
  // Tháng 10 cần đủ số phiếu để 3 chi nhánh mỗi chi nhánh ≥ 5 phiếu
  const targetT10 = Math.min(26, Math.max(18, Math.round(soPhieu * 0.275)))
  const targetT9 = soPhieu - targetT10

  const phanBo = (ds: { d: Date; isWeekend: boolean }[], target: number) => {
    const counts = new Array(ds.length).fill(1)
    let conLai = target - ds.length
    const weights = ds.map(n => n.isWeekend ? 1.0 : 2.0)
    while (conLai > 0) {
      const valid = weights.map((w, i) => counts[i] < 4 ? i : -1).filter(i => i >= 0)
      if (valid.length === 0) break
      const totalW = valid.reduce((sum, i) => sum + weights[i], 0)
      let pickVal = r() * totalW
      let chosen = valid[0]
      for (const idx of valid) {
        pickVal -= weights[idx]
        if (pickVal <= 0) {
          chosen = idx
          break
        }
      }
      counts[chosen]++
      conLai--
    }
    return counts
  }

  const countsT9 = phanBo(ngayT9, targetT9)
  const countsT10 = phanBo(ngayT10, targetT10)

  // Sinh danh sách phiếu theo thứ tự thời gian tăng dần để đánh số chứng từ
  interface PhieuItem {
    d: Date
    thang: number
    so: string
    cn: string
    dt: { ma: string; ten: string }
    dienGiai: string
    nguon: string
  }

  const items: PhieuItem[] = []
  let cnIdx = 0
  let seqT9 = 1
  let seqT10 = 1

  // Tháng 9
  for (let i = 0; i < ngayT9.length; i++) {
    const { d } = ngayT9[i]
    for (let j = 0; j < countsT9[i]; j++) {
      const so = `${cfg.prefix}2609-${pad(seqT9++, 4)}`
      const cn = CHI_NHANH[cnIdx % CHI_NHANH.length].ten
      cnIdx++
      const dt = dts[(items.length + Math.floor(r() * dts.length)) % dts.length]
      const dienGiai = pick(r, cfg.dienGiai)
      const nguon = cfg.nguon && cfg.nguon !== 'tay' && r() < 0.75 ? cfg.nguon : 'tay'
      items.push({ d, thang: 9, so, cn, dt, dienGiai, nguon })
    }
  }

  // Tháng 10
  for (let i = 0; i < ngayT10.length; i++) {
    const { d } = ngayT10[i]
    for (let j = 0; j < countsT10[i]; j++) {
      const so = `${cfg.prefix}2610-${pad(seqT10++, 4)}`
      const cn = CHI_NHANH[cnIdx % CHI_NHANH.length].ten
      cnIdx++
      const dt = dts[(items.length + Math.floor(r() * dts.length)) % dts.length]
      const dienGiai = pick(r, cfg.dienGiai)
      const nguon = cfg.nguon && cfg.nguon !== 'tay' && r() < 0.75 ? cfg.nguon : 'tay'
      items.push({ d, thang: 10, so, cn, dt, dienGiai, nguon })
    }
  }

  // Đảo ngược để phiếu mới nhất ở HOM_NAY đứng đầu bảng
  items.reverse()

  // Trạng thái: khoảng 10% 'nhap' tập trung ở các ngày gần HOM_NAY, 2-3 phiếu 'loi', còn lại 'ghi'
  const soNhap = Math.max(1, Math.round(soPhieu * 0.1))
  const loiIndices = new Set([soNhap + 4, Math.floor(soPhieu * 0.45), Math.floor(soPhieu * 0.7)])

  return items.map((item, i): Row => {
    const id = `${seed}-${i}`
    const t = tongDong(dongCua(cfg, id))
    const tt = i < soNhap ? 'nhap' : loiIndices.has(i) ? 'loi' : 'ghi'
    const d = item.d
    const g = gioPhieu(item.so)
    return {
      id: String(i),
      so: item.so,
      ngay: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
      gio: g,
      thang: item.thang,
      doiTuong: item.dt.ten,
      maDt: item.dt.ma,
      cn: item.cn,
      dienGiai: item.dienGiai,
      tien: t.tien,
      thue: t.thue,
      tong: t.tong,
      nguon: item.nguon,
      tt,
    }
  })
}

export const TT_CT: Record<string, [string, string]> = {
  nhap: ['warn', 'Chưa ghi sổ'], ghi: ['ok', 'Đã ghi sổ'], loi: ['err', 'Lỗi hạch toán'], khoa: ['dim', 'Đã khoá'],
}
export const NGUON: Record<string, [string, string]> = {
  FABi: ['', 'FABi'], IVT: ['ivt', 'iPOS Inventory'], 'HĐ': ['hd', 'iPOS Invoice'], tay: ['tay', 'Thủ công'], excel: ['excel', 'Excel'],   // excel: phiếu nhập từ file Excel (T64)
}

/** Sổ chi tiết: phát sinh trong kỳ có số dư luỹ kế */
export function soChiTiet(seed: string, mo: number, dien: string[], doiUng: string[], tien: [number, number], thang: number) {
  const r = rng(seed + thang)
  const rows: Row[] = []
  let du = mo, tn = 0, tc = 0
  const dim = thang === 10 ? 7 : new Date(2026, thang, 0).getDate()
  for (let day = 1; day <= dim; day++) {
    const n = r() < 0.35 ? 0 : 1 + Math.floor(r() * 2)
    for (let j = 0; j < n; j++) {
      const thu = r() < 0.55
      const v = k(between(r, tien[0], tien[1]))
      du += thu ? v : -v
      if (thu) tn += v; else tc += v
      rows.push({
        ngay: `${pad(day)}/${pad(thang)}/2026`, so: `${thu ? 'PT' : 'PC'}26${pad(thang)}-${pad(rows.length + 1, 4)}`,
        dienGiai: pick(r, dien), tk: pick(r, doiUng), no: thu ? v : 0, co: thu ? 0 : v, du,
      })
    }
  }
  return { rows, mo, tn, tc, cuoi: du }
}
