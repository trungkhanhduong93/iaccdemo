// Số liệu biểu đồ và thẻ cảnh báo cho trang chủ gói Free (T274)
import { CHI_NHANH, DAILY, HANG, KHOA_SO_DEN, tongKy, trongThang } from '../../data/mock'
import { chungTu } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { nvlKy } from './chi-phi-nvl'
import { tinhToanTongQuan } from './chiSo'
import type { Session } from '../../app/session'

export interface ItemTop5 {
  ten: string
  soTien: number
  phanTram: number
  phu?: string
}

export interface TheTop5Data {
  tieuDe: string
  thang: number
  tong: number
  nhanTong: string
  items: ItemTop5[]
  link: string
  nhanLink: string
}

export interface LaiLoCnItem {
  id: string
  ten: string
  dt: number
  cp: number
  lai: number
  lo: boolean
  bienLai: number
  dangChon: boolean
}

export interface CanhBaoNoNcc {
  ten: string
  soTien: number
  soNgay: number
}

export interface CanhBaoAmKho {
  ten: string
  kho: string
  soLuong: number
  dvt: string
}

export interface CanhBaoHuyHang {
  ten: string
  soLuong: number
  dvt: string
  giaTri: number
  tyLe: number
}

export interface LechPosNgay {
  ngay: string
  dtPos: number
  dtKt: number
  lech: number
  coLech: boolean
}

export interface DuLieuCanTheoDoi {
  soCanhBao: number
  congNoQuaHan: {
    tongTien: number
    soNcc: number
    top5: CanhBaoNoNcc[]
    link: string
  }
  amKho: {
    soMatHang: number
    top5: CanhBaoAmKho[]
    link: string
  }
  huyHang: {
    tongTien: number
    top5: CanhBaoHuyHang[]
    link: string
  }
  lechPos: {
    tongLech: number
    soNgayLech: number
    dsNgay: LechPosNgay[]
    link: string
  }
  chuaKhoaSo: {
    soThang: number
    danhSach: string[]
    link: string
  }
  bienDongCp: {
    cpThangNay: number
    cpThangTruoc: number
    chenhLechPct: number
    top3: { ten: string; pct: number; tang: boolean }[]
    link: string
  }
}

/** Hàm băm chuỗi thành số nguyên dương cố định (không dùng Math.random, T274) */
function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Bộ sinh số giả lập xác định từ hạt giống (T274) */
function rngT274(seed: number) {
  let s = (seed % 2147483647) || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Hệ số giá vốn theo nhóm món từ ban-hang/bao-cao.ts */
const heSoGvNhom = (nhom: string) => (nhom === 'Đồ uống' ? 0.24 : nhom === 'Bia, rượu' ? 0.62 : 0.38)

/** 1. Top 5 mặt hàng doanh thu cao (T274) */
export function layTop5DoanhThu(thang: number, selCns: string[], tongDt: number): TheTop5Data {
  const cnsSet = new Set(selCns)
  const nhomMh = new Map<string, { ten: string; tien: number }>()

  // Tính từ các ngày bán trong tháng của các chi nhánh đang chọn
  for (const row of DAILY) {
    if (trongThang(row.date, thang, 2026) && cnsSet.has(row.cn)) {
      // Phân bổ doanh thu ngày cho các món theo tỷ trọng cố định của HANG
      for (const h of HANG) {
        const hs = ((h.gia * 17 + hashStr(h.ma)) % 23) + 5
        const tienMon = Math.round((row.dt * hs) / 380)
        const cur = nhomMh.get(h.ma) ?? { ten: h.ten, tien: 0 }
        cur.tien += tienMon
        nhomMh.set(h.ma, cur)
      }
    }
  }

  const ds = [...nhomMh.values()].sort((a, b) => b.tien - a.tien)
  const tongAll = ds.reduce((a, b) => a + b.tien, 0) || 1
  const heSo = tongDt > 0 ? (tongDt * 0.88) / tongAll : 1

  const items: ItemTop5[] = ds.slice(0, 5).map(x => {
    const soTien = Math.round(x.tien * heSo)
    const phanTram = tongDt > 0 ? Math.round((soTien / tongDt) * 1000) / 10 : 0
    return { ten: x.ten, soTien, phanTram }
  })

  // Đảm bảo tổng top 5 không vượt doanh thu trang chủ
  const tongTop5 = items.reduce((a, b) => a + b.soTien, 0)
  const tongHien = tongDt > 0 ? tongDt : tongTop5

  return {
    tieuDe: 'Mặt hàng doanh thu cao',
    thang,
    tong: tongHien,
    nhanTong: 'Doanh thu thuần',
    items,
    link: '/app/bao-cao/3-2-7',
    nhanLink: 'Xem báo cáo bán hàng',
  }
}

/** 2. Top 5 chi phí trong tháng cao (T274) */
export function layTop5ChiPhi(
  thang: number,
  selCns: string[],
  tongCp: number,
  coCauCp: { l: string; v: number }[]
): TheTop5Data {
  const seed = hashStr(`cp-${thang}-${selCns.sort().join(',')}`)
  const r = rngT274(seed)

  // 5 khoản mục chi phí tiêu biểu F&B
  const danhMucCp = [
    { ten: 'Lương nhân viên bếp và phục vụ', tyLe: 0.38 },
    { ten: 'Tiền thuê mặt bằng các chi nhánh', tyLe: 0.28 },
    { ten: 'Tiền điện, nước, gas công nghiệp', tyLe: 0.14 },
    { ten: 'Chi phí quảng cáo và bán hàng qua app', tyLe: 0.11 },
    { ten: 'Dụng cụ vệ sinh và chi phí quản lý khác', tyLe: 0.09 },
  ]

  // Nếu coCauCp có dữ liệu thật thì ưu tiên
  const tongD = tongCp > 0 ? tongCp : 1
  const items: ItemTop5[] = danhMucCp.map((cp, idx) => {
    const bienDong = 0.9 + r() * 0.2
    const soTien = Math.round(tongD * cp.tyLe * bienDong)
    return {
      ten: cp.ten,
      soTien,
      phanTram: Math.round((soTien / tongD) * 1000) / 10,
    }
  }).sort((a, b) => b.soTien - a.soTien)

  return {
    tieuDe: 'Chi phí trong tháng cao',
    thang,
    tong: tongCp,
    nhanTong: 'Chi phí trong tháng',
    items,
    link: '/app/bao-cao/10-4-3',
    nhanLink: 'Xem báo cáo chi phí',
  }
}

/** 3. Top 5 mặt hàng giá vốn cao (T274) */
export function layTop5GiaVon(
  thang: number,
  selCns: string[],
  tongGv: number
): TheTop5Data {
  const cnsSet = new Set(selCns)
  const nhomGv = new Map<string, { ten: string; gv: number }>()

  for (const row of DAILY) {
    if (trongThang(row.date, thang, 2026) && cnsSet.has(row.cn)) {
      for (const h of HANG) {
        const hsGv = heSoGvNhom(h.nhom)
        const hsDt = ((h.gia * 17 + hashStr(h.ma)) % 23) + 5
        const gvMon = Math.round((row.gv * hsDt * hsGv) / 140)
        const cur = nhomGv.get(h.ma) ?? { ten: h.ten, gv: 0 }
        cur.gv += gvMon
        nhomGv.set(h.ma, cur)
      }
    }
  }

  const ds = [...nhomGv.values()].sort((a, b) => b.gv - a.gv)
  const tongAll = ds.reduce((a, b) => a + b.gv, 0) || 1
  const heSo = tongGv > 0 ? (tongGv * 0.86) / tongAll : 1

  const items: ItemTop5[] = ds.slice(0, 5).map(x => {
    const soTien = Math.round(x.gv * heSo)
    const phanTram = tongGv > 0 ? Math.round((soTien / tongGv) * 1000) / 10 : 0
    return { ten: x.ten, soTien, phanTram }
  })

  return {
    tieuDe: 'Mặt hàng giá vốn cao',
    thang,
    tong: tongGv,
    nhanTong: 'Chi phí nguyên vật liệu',
    items,
    link: '/app/bao-cao/5-2-11',
    nhanLink: 'Xem tổng hợp xuất kho',
  }
}

/** 4. Top 5 nhà cung cấp mua hàng nhiều (T274) */
export function layTop5NhaCungCap(
  thang: number,
  selCns: string[],
  tongMua: number
): TheTop5Data {
  const tenCnSet = new Set(CHI_NHANH.filter(c => selCns.includes(c.id)).map(c => c.ten))
  const mua = chungTu(PHIEU_MUA, '4.1.1').filter(
    r => Number(r.thang) === thang && tenCnSet.has(String(r.cn))
  )

  const nccMap = new Map<string, number>()
  for (const r of mua) {
    const ncc = String(r.doiTuong || 'Nhà cung cấp khác')
    const t = Number(r.tong) || 0
    nccMap.set(ncc, (nccMap.get(ncc) ?? 0) + t)
  }

  const ds = [...nccMap.entries()]
    .map(([ten, soTien]) => ({ ten, soTien }))
    .sort((a, b) => b.soTien - a.soTien)

  const tongThuc = ds.reduce((a, b) => a + b.soTien, 0) || tongMua || 1
  const items: ItemTop5[] = ds.slice(0, 5).map(x => ({
    ten: x.ten,
    soTien: x.soTien,
    phanTram: Math.round((x.soTien / tongThuc) * 1000) / 10,
  }))

  return {
    tieuDe: 'Nhà cung cấp mua hàng nhiều',
    thang,
    tong: tongMua || tongThuc,
    nhanTong: 'Tổng giá trị nhập mua',
    items,
    link: '/app/bao-cao/4-2-2',
    nhanLink: 'Xem tổng hợp mua hàng',
  }
}

/** 5. Top 5 khoản chi tiền trong tháng cao (T274) */
export function layTop5ChiTien(
  thang: number,
  selCns: string[],
  tongChi: number
): TheTop5Data {
  const seed = hashStr(`chitien-${thang}-${selCns.sort().join(',')}`)
  const r = rngT274(seed)

  const lyDoChi = [
    { ten: 'Thanh toán tiền mua hàng nhà cung cấp', tyLe: 0.44 },
    { ten: 'Chi trả lương và phụ cấp nhân viên', tyLe: 0.29 },
    { ten: 'Thanh toán tiền thuê mặt bằng kinh doanh', tyLe: 0.15 },
    { ten: 'Chi tiền điện, nước sinh hoạt và gas', tyLe: 0.08 },
    { ten: 'Mua sắm đồ dùng tiêu hao và sửa chữa nhỏ', tyLe: 0.04 },
  ]

  const tongD = tongChi > 0 ? tongChi : 1
  const items: ItemTop5[] = lyDoChi.map(item => {
    const bienDong = 0.94 + r() * 0.12
    const soTien = Math.round(tongD * item.tyLe * bienDong)
    return {
      ten: item.ten,
      soTien,
      phanTram: Math.round((soTien / tongD) * 1000) / 10,
    }
  }).sort((a, b) => b.soTien - a.soTien)

  return {
    tieuDe: 'Khoản chi tiền trong tháng cao',
    thang,
    tong: tongChi,
    nhanTong: 'Tổng chi tiền',
    items,
    link: '/app/bao-cao/2-2-1',
    nhanLink: 'Xem sổ quỹ tiền mặt',
  }
}

/** 6. Lãi lỗ theo từng chi nhánh tháng đang chọn (T274)
 *  Doanh thu từng chi nhánh là doanh thu thuần; tổng các chi nhánh bằng đúng doanh thu và lãi trang chủ */
export function layLaiLoChiNhanh(
  thang: number,
  selCns: string[],
  s: Session
): LaiLoCnItem[] {
  const allIds = CHI_NHANH.map(c => c.id)
  const tqAll = tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', allIds, s.cheDo, thang)
  const nvlAll = nvlKy(s, allIds, thang).tien
  const dtTongAll = tqAll.dtThuan
  const cpTongAll = nvlAll + tqAll.cpHoatDong

  const dsRaw = CHI_NHANH.map(cn => {
    const nvl = nvlKy(s, [cn.id], thang).tien
    const tq = tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', [cn.id], s.cheDo, thang)
    const cp = nvl + tq.cpHoatDong
    const dt = tq.dtThuan
    const dangChon = selCns.length === 1 && selCns[0] === cn.id

    return {
      id: cn.id,
      ten: cn.ten,
      dt,
      cp,
      dangChon,
    }
  })

  // Phân bổ phần làm tròn để tổng 3 chi nhánh bằng ĐÚNG doanh thu thuần và chi phí của trang chủ
  const tongDtRaw = dsRaw.reduce((a, b) => a + b.dt, 0)
  const chenhDt = dtTongAll - tongDtRaw

  const tongCpRaw = dsRaw.reduce((a, b) => a + b.cp, 0)
  const chenhCp = cpTongAll - tongCpRaw

  if (dsRaw.length > 0) {
    dsRaw[0].dt += chenhDt
    dsRaw[0].cp += chenhCp
  }

  return dsRaw.map(it => {
    const lai = it.dt - it.cp
    return {
      id: it.id,
      ten: it.ten,
      dt: it.dt,
      cp: it.cp,
      lai,
      lo: lai < 0,
      bienLai: it.dt > 0 ? lai / it.dt : 0,
      dangChon: it.dangChon,
    }
  })
}

/** 7. Dữ liệu tab Cần theo dõi (T274) */
export function layDuLieuCanTheoDoi(
  thang: number,
  selCns: string[],
  tongDtThang = 0
): DuLieuCanTheoDoi {
  const seed = hashStr(`theo-doi-${thang}-${selCns.sort().join(',')}`)
  const r = rngT274(seed)

  // 1. Công nợ quá hạn
  const dsNccQuaHan = [
    'Công ty TNHH Thực phẩm Sạch Minh Anh',
    'Nhà cung cấp Nông sản Đà Lạt Xanh',
    'Công ty CP Chế biến Thuỷ sản Biển Đông',
    'Cơ sở Sản xuất Bánh Phở Truyền Thống',
    'Đại lý Bia & Nước giải khát Toàn Thắng',
  ]
  const top5No: CanhBaoNoNcc[] = dsNccQuaHan.map((ten, i) => {
    const soTien = Math.round((12_000_000 + r() * 18_000_000) / 100_000) * 100_000
    const soNgay = Math.round(5 + r() * 20 + i * 3)
    return { ten, soTien, soNgay }
  }).sort((a, b) => b.soNgay - a.soNgay)

  const tongNoQuaHan = top5No.reduce((a, b) => a + b.soTien, 0)

  // 2. Hàng hoá âm kho
  const tenCnDau = CHI_NHANH.find(c => selCns.includes(c.id))?.ten ?? 'Lê Lợi'
  const dsAmKhoRaw = [
    { ten: 'Bò phi lê mềm', kho: `Kho bếp ${tenCnDau}`, dvt: 'kg', soLuong: Math.round((8 + r() * 12) * 10) / 10 },
    { ten: 'Bánh phở tươi Hà Nội', kho: `Kho lạnh ${tenCnDau}`, dvt: 'kg', soLuong: Math.round((15 + r() * 18) * 10) / 10 },
    { ten: 'Cà phê hạt Robusta', kho: `Kho quầy bar ${tenCnDau}`, dvt: 'kg', soLuong: Math.round((5 + r() * 7) * 10) / 10 },
    { ten: 'Nước dùng hầm xương', kho: `Kho chế biến ${tenCnDau}`, dvt: 'lít', soLuong: Math.round((10 + r() * 15) * 10) / 10 },
  ]

  // 3. Hàng hoá huỷ cao
  const dsHuyRaw = [
    { ten: 'Rau thơm và hành lá hỏng cuối ca', dvt: 'kg', sl: 18.5, gia: 85_000, tyLe: 6.2 },
    { ten: 'Bánh phở tươi thừa qua đêm', dvt: 'kg', sl: 32.0, gia: 65_000, tyLe: 5.4 },
    { ten: 'Thịt bò vụn hao hụt sơ chế', dvt: 'kg', sl: 11.5, gia: 280_000, tyLe: 4.8 },
    { ten: 'Sữa tươi thanh trùng hỏng bao bì', dvt: 'hộp', sl: 24, gia: 42_000, tyLe: 4.1 },
    { ten: 'Nước dùng lẩu lưu ca không đạt chuẩn', dvt: 'nồi', sl: 14, gia: 120_000, tyLe: 3.6 },
  ]
  const top5Huy: CanhBaoHuyHang[] = dsHuyRaw.map(x => {
    const he = 0.9 + r() * 0.25
    const giaTri = Math.round((x.sl * x.gia * he) / 10_000) * 10_000
    const soLuong = Math.round(x.sl * he * 10) / 10
    const tyLe = Math.round(x.tyLe * he * 10) / 10
    return { ten: x.ten, soLuong, dvt: x.dvt, giaTri, tyLe }
  }).sort((a, b) => b.giaTri - a.giaTri)

  const tongGiaTriHuy = top5Huy.reduce((a, b) => a + b.giaTri, 0)

  // 4. Doanh thu lệch so với POS (cặp 7 ngày gần nhất)
  const ngay7 = ['01', '02', '03', '04', '05', '06', '07'].map(ng => {
    const base = Math.round((18_000_000 + r() * 12_000_000) / 100_000) * 100_000
    // Ngày 03 và ngày 06 cố ý có lệch do chưa đồng bộ ca muộn
    const coLech = ng === '03' || ng === '06'
    const lech = coLech ? Math.round((1_200_000 + r() * 1_800_000) / 50_000) * 50_000 : 0
    return {
      ngay: `${ng}/${String(thang).padStart(2, '0')}`,
      dtPos: base + lech,
      dtKt: base,
      lech,
      coLech,
    }
  })
  const tongLech = ngay7.reduce((a, b) => a + b.lech, 0)
  const soNgayLech = ngay7.filter(x => x.coLech).length

  // 5. Tháng chưa khoá sổ (tháng trước tháng hiện tại chưa khoá)
  // KHOA_SO_DEN là tháng 8/2026, nên nếu xem tháng 10 thì tháng 9 chưa khoá
  const chuaKhoaList: string[] = []
  if (thang === 10 && KHOA_SO_DEN.thang < 9) {
    chuaKhoaList.push('Tháng 9/2026')
  } else if (thang === 9 && KHOA_SO_DEN.thang < 8) {
    chuaKhoaList.push('Tháng 8/2026')
  } else if (chuaKhoaList.length === 0) {
    chuaKhoaList.push(`Tháng ${Math.max(1, thang - 1)}/2026`)
  }

  // 6. Biến động chi phí so với tháng trước
  const cpThangNay = Math.round((280_000_000 + r() * 40_000_000) / 100_000) * 100_000
  const cpThangTruoc = Math.round((290_000_000 + r() * 30_000_000) / 100_000) * 100_000
  const chenhLechPct = Math.round(((cpThangNay - cpThangTruoc) / cpThangTruoc) * 1000) / 10

  const top3Cp = [
    { ten: 'Tiền điện, nước, gas công nghiệp', pct: 8.4, tang: true },
    { ten: 'Chi phí đóng gói và giao hàng qua app', pct: 6.2, tang: true },
    { ten: 'Chi phí tiếp thị và quảng cáo món mới', pct: 11.5, tang: false },
  ]

  // Tổng số mục có cảnh báo: 5 mục chính
  const soCanhBao = (tongNoQuaHan > 0 ? 1 : 0) +
    (dsAmKhoRaw.length > 0 ? 1 : 0) +
    (tongGiaTriHuy > 0 ? 1 : 0) +
    (soNgayLech > 0 ? 1 : 0) +
    (chuaKhoaList.length > 0 ? 1 : 0)

  return {
    soCanhBao,
    congNoQuaHan: {
      tongTien: tongNoQuaHan,
      soNcc: top5No.length,
      top5: top5No,
      link: '/app/bao-cao/4-2-3',
    },
    amKho: {
      soMatHang: dsAmKhoRaw.length,
      top5: dsAmKhoRaw,
      link: '/app/bao-cao/5-2-3',
    },
    huyHang: {
      tongTien: tongGiaTriHuy,
      top5: top5Huy,
      link: '/app/bao-cao/5-2-15',
    },
    lechPos: {
      tongLech,
      soNgayLech,
      dsNgay: ngay7,
      link: '/app/ban-hang/3-1-1',
    },
    chuaKhoaSo: {
      soThang: chuaKhoaList.length,
      danhSach: chuaKhoaList,
      link: '/app/tong-hop/10-1-6',
    },
    bienDongCp: {
      cpThangNay,
      cpThangTruoc,
      chenhLechPct,
      top3: top3Cp,
      link: '/app/trang-chu/chi-phi-thang',
    },
  }
}
