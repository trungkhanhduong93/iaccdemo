// Số liệu dashboard nhà hàng gói Plus, Pro (T941). Dữ liệu giả theo mẫu docs/thiet-ke/T939-dashboard-nha-hang-v2.html.
// Mọi số tiền tính bằng đồng, hiển thị đầy đủ, không làm tròn triệu. Số từng cửa hàng ước tính từ tỷ trọng và hệ số điều chỉnh;
// định mức lấy từ Danh mục cửa hàng (T938).
import { CUA_HANG } from '../../data/mock'
import type { Session } from '../../app/session'
import { dinhMucCh, type KhoaDinhMuc } from '../danh-muc/dinh-muc-cua-hang'

export const THANG = ['T10/25', 'T11/25', 'T12/25', 'T1/26', 'T2/26', 'T3/26', 'T4/26', 'T5/26', 'T6/26', 'T7/26', 'T8/26', 'T9/26', 'T10/26']

/** Số triệu minh hoạ thành số đồng lẻ đến trăm đồng, để số hiển thị trông như số thật */
const le = (tr: number, i: number, mix: number) => Math.round((tr * 1_000_000 + ((i + 1) * 7919 * mix + tr * 104729) % 1_000_000) / 100) * 100
const chuoi = (a: number[], mix: number) => a.map((v, i) => le(v, i, mix))

const DT = chuoi([1010, 1150, 1230, 1040, 1100, 1130, 1180, 1180, 1240, 1310, 1275, 1310, 1420], 3)
const LN = chuoi([121, 161, 197, 114, 143, 147, 165, 153, 186, 210, 191, 225, 230], 5)
const TY_LE_NVL = [33, 33, 30, 35, 34, 33, 31, 33, 32, 34, 33, 34, 33.1]
const TY_LE_HAO_HUT = [2.3, 2.4, 2.1, 2.8, 2.6, 2.5, 2.3, 2.4, 2.2, 2.5, 2.4, 2.43, 2.7]
const THU = chuoi([985, 1120, 1195, 1010, 1070, 1100, 1150, 1145, 1205, 1270, 1240, 1280, 1380], 7)
const CHI = chuoi([880, 960, 1000, 930, 940, 980, 1010, 1010, 1050, 1100, 1090, 1070, 1190], 11)
const SO_DU = chuoi([140, 175, 220, 190, 210, 205, 225, 230, 245, 260, 255, 270, 286], 13)

// Ba cửa hàng của repo: tỷ trọng doanh thu, hệ số biên LN ròng, tỷ lệ NVL, tỷ lệ hao hụt so với toàn đơn vị
const TY_TRONG = [0.45, 0.32, 0.23]
const HS_BIEN = [1.2, 0.95, 0.7]
const HS_NVL = [0.97, 1, 1.06]
const HS_HAO_HUT = [0.85, 1, 1.25]

const lamTron100 = (n: number) => Math.round(n / 100) * 100

export type ChuoiThang = { dt: number[]; nvl: number[]; ln: number[]; bien: number[]; tyLeNvl: number[] }

/** Toàn đơn vị: dt, nvl, ln theo tháng, tính bằng đồng */
function tong(): { dt: number[]; nvl: number[]; ln: number[] } {
  return { dt: DT, nvl: DT.map((d, i) => lamTron100(d * TY_LE_NVL[i] / 100)), ln: LN }
}

/** Chia số toàn đơn vị cho từng cửa hàng; cửa hàng cuối nhận phần dư để cộng các cửa hàng bằng đúng số toàn đơn vị */
function chiaCuaHang(tongSo: number[], heSo: (k: number, i: number) => number): number[][] {
  const kq = CUA_HANG.map(() => [] as number[])
  tongSo.forEach((t, i) => {
    let da = 0
    CUA_HANG.forEach((_, k) => {
      const v = k === CUA_HANG.length - 1 ? t - da : lamTron100(t * heSo(k, i))
      da += v
      kq[k].push(v)
    })
  })
  return kq
}

/** k = -1: tất cả cửa hàng; k >= 0: cửa hàng thứ k trong CUA_HANG */
export function chuoiThang(k: number): ChuoiThang {
  const t = tong()
  let dt = t.dt, nvl = t.nvl, ln = t.ln
  if (k >= 0) {
    dt = chiaCuaHang(t.dt, kk => TY_TRONG[kk])[k]
    nvl = chiaCuaHang(t.nvl, kk => TY_TRONG[kk] * HS_NVL[kk])[k]
    // Lệch nhẹ theo tháng để lợi nhuận từng cửa hàng không tăng giảm cùng một tỷ lệ (cột So với tháng trước, T956)
    ln = chiaCuaHang(t.ln, (kk, m) => TY_TRONG[kk] * HS_BIEN[kk] * (1 + 0.015 * Math.sin((m + 1) * (kk + 2))))[k]
  }
  return {
    dt, nvl, ln,
    bien: dt.map((x, i) => Math.round(ln[i] / x * 1000) / 10),
    tyLeNvl: nvl.map((x, i) => Math.round(x / dt[i] * 1000) / 10),
  }
}

/** Giá trị hao hụt (đồng) và tỷ lệ hao hụt (% giá trị NVL) theo tháng */
export function haoHut(k: number, c: ChuoiThang): { gia: number[]; tyLe: number[] } {
  const hs = k < 0 ? 1 : HS_HAO_HUT[k]
  const tyLe = TY_LE_HAO_HUT.map(x => Math.round(x * hs * 100) / 100)
  return { gia: c.nvl.map((n, i) => lamTron100(n * tyLe[i] / 100)), tyLe }
}

export function thuChi(k: number) {
  let thu = THU, chi = CHI, soDu = SO_DU
  if (k >= 0) {
    thu = chiaCuaHang(THU, kk => TY_TRONG[kk])[k]
    chi = chiaCuaHang(CHI, kk => TY_TRONG[kk])[k]
    soDu = chiaCuaHang(SO_DU, kk => TY_TRONG[kk])[k]
  }
  return { thu, chi, chenh: thu.map((x, i) => x - chi[i]), soDu }
}

/** Số dư cuối kỳ toàn đơn vị ở tháng thứ i, để chia cho quỹ tiền */
export const soDuCuoi = (i: number) => SO_DU[i]

/** Chia một số cho các phần theo tỷ lệ %, phần cuối nhận phần dư để cộng đủ */
export function chiaTheoTy(tongSo: number, ty: number[]): number[] {
  const tt = ty.reduce((a, b) => a + b, 0) || 1
  const kq: number[] = []
  let da = 0
  ty.forEach((t, n) => {
    const v = n === ty.length - 1 ? tongSo - da : lamTron100(tongSo * t / tt)
    da += v
    kq.push(v)
  })
  return kq
}

/** Định mức của cửa hàng k, hoặc bình quân gia quyền theo tỷ trọng doanh thu (k = -1); chưa đặt thì undefined */
export function dinhMuc(s: Pick<Session, 'donVi' | 'dinhMucCh'>, k: number, khoa: KhoaDinhMuc): number | undefined {
  if (k >= 0) return dinhMucCh(s, CUA_HANG[k].id, khoa)
  let t = 0, tt = 0
  CUA_HANG.forEach((c, n) => {
    const v = dinhMucCh(s, c.id, khoa)
    if (v !== undefined) { t += v * TY_TRONG[n]; tt += TY_TRONG[n] }
  })
  return tt ? Math.round(t / tt * 10) / 10 : undefined
}

/** Kết quả từng cửa hàng ở tháng thứ i của chuỗi 13 tháng (đồng) */
export function ketQuaCuaHang(i: number) {
  return CUA_HANG.map((c, k) => {
    const s = chuoiThang(k)
    const dt = s.dt[i], nvl = s.nvl[i], ln = s.ln[i]
    return { id: c.id, ten: c.ten, dt, nvl, ln, hoatDong: dt - nvl - ln, tyLeNvl: nvl / dt * 100, bien: ln / dt * 100 }
  })
}

// Cơ cấu minh hoạ; số tiền chia theo tỷ lệ từ doanh thu, số dư tháng đang xem. Khi có dữ liệu thật thì thay bằng số tính từ sổ
export const KENH = [
  { ten: 'Tại chỗ', ty: 46, bien: 69, mau: 'var(--blue)' },
  { ten: 'App giao hàng', ty: 24, bien: 60, mau: 'var(--green)' },
  { ten: 'Mang đi', ty: 13, bien: 68, mau: 'var(--orange)' },
  { ten: 'Đặt trước', ty: 8, bien: 73, mau: 'var(--amber)' },
  { ten: 'Tiệc, sự kiện', ty: 5, bien: 71, mau: 'var(--faint)' },
  { ten: 'Bán voucher', ty: 4, bien: 75, mau: 'var(--faint)' },
]
/** Chi phí hoạt động (doanh thu − NVL − lợi nhuận) chia theo khoản; NVL lấy đúng số thẻ Chi phí NVL */
export const CO_CAU_CHI_PHI = [
  { ten: 'Nhân sự', ty: 33.8, mau: 'var(--orange)' },
  { ten: 'Mặt bằng', ty: 11.3, mau: 'var(--green)' },
  { ten: 'Phí app', ty: 4.6, mau: 'var(--amber)' },
  { ten: 'Điện, nước, gas', ty: 4.2, mau: 'var(--faint)' },
  { ten: 'Marketing', ty: 2.6, mau: 'var(--faint)' },
  { ten: 'Khấu hao', ty: 2.4, mau: 'var(--faint)' },
  { ten: 'Khác', ty: 1.6, mau: 'var(--faint)' },
]
export const QUY_TIEN = [
  { ten: 'Vietcombank', ty: 52, mau: 'var(--blue)' },
  { ten: 'Techcombank', ty: 22, mau: 'var(--green)' },
  { ten: 'MB Bank', ty: 10, mau: 'var(--amber)' },
  { ten: 'Quỹ tiền mặt', ty: 8, mau: 'var(--orange)' },
  { ten: 'Ví MoMo', ty: 5, mau: 'var(--faint)' },
  { ten: 'VPBank', ty: 3, mau: 'var(--faint)' },
]
/** Công nợ trong kỳ (đồng): cuối kỳ = đầu kỳ + phát sinh − đã thanh toán */
const congNo = (dau: number, phatSinh: number, daThanhToan: number) => ({ dau, phatSinh, daThanhToan, cuoi: dau + phatSinh - daThanhToan })
export const CONG_NO = {
  thu: congNo(30_480_500, 392_012_300, 384_093_800),
  tra: congNo(36_812_400, 478_536_700, 474_045_100),
}
export const NHOM_HAO_HUT = [
  { ten: 'Thịt, hải sản', ty: 0.48, mau: 'var(--blue)' },
  { ten: 'Rau củ', ty: 0.29, mau: 'var(--orange)' },
  { ten: 'Đồ khô, gia vị', ty: 0.10, mau: 'var(--faint)' },
  { ten: 'Đồ uống', ty: 0.07, mau: 'var(--faint)' },
  { ten: 'Khác', ty: 0.06, mau: 'var(--green)' },
]

/** Hao hụt lấy từ đâu (tooltip dấu ? ở khối Hao hụt NVL): tỷ lệ % trên tổng hao hụt tháng */
export const NGUON_HAO_HUT = [
  { ten: 'Hủy hàng', tu: 'Phiếu xuất hủy hàng hỏng, hết hạn', ty: 58 },
  { ten: 'Thiếu khi kiểm kê', tu: 'Biên bản kiểm kê, số đếm thực tế thấp hơn sổ kho', ty: 42 },
]

/** Một phần của vành khuyên: ghi = "3 nhóm" khi dòng Khác gom nhiều mục */
export type PhanCoCau = { ten: string; v: number; mau: string; ghi?: string }

// Vành khuyên một màu đậm nhạt theo thứ hạng (mẫu docs/thiet-ke/T956-dashboard-plus-pro.html); dòng Khác màu xám
const THANG_MAU = {
  xanh: ['#1b5fbf', '#2f80ed', '#7fb0f3', '#bcd5f8'],
  cam: ['#b8600e', '#e0821f', '#f5a03a', '#f8c27f'],
  la: ['#137a52', '#3fb886', '#7fd0ab', '#bfe8d5'],
  tim: ['#5b3fc4', '#9a86ea', '#c4b8f3', '#e2dbfa'],
}
const MAU_KHAC = '#c7d2de'

/** n mục lớn nhất xếp giảm dần, mục còn lại và mục tên "Khác" gom thành một dòng Khác cuối */
function gomTop(phan: { ten: string; v: number }[], thang: string[], donVi: string, n: number): PhanCoCau[] {
  const xep = phan.filter(p => p.ten !== 'Khác').sort((a, b) => b.v - a.v), khac0 = phan.filter(p => p.ten === 'Khác')
  const du = xep.length + (khac0.length ? 1 : 0) <= n + 1
  const dau = du ? xep : xep.slice(0, n), con = (du ? [] : xep.slice(n)).concat(khac0)
  const kq: PhanCoCau[] = dau.map((p, k) => ({ ten: p.ten, v: p.v, mau: thang[k] }))
  if (con.length) kq.push({ ten: 'Khác', v: con.reduce((a, p) => a + p.v, 0), mau: MAU_KHAC, ghi: con.length > 1 ? `${con.length} ${donVi}` : undefined })
  return kq
}

/** Bốn vành khuyên của cửa hàng k (-1 = tất cả) ở tháng thứ i: kênh, cơ cấu chi phí, quỹ tiền (4 mục + Khác), nhóm hao hụt (2 mục + Khác) */
export function coCauThang(k: number, i: number): { kenh: PhanCoCau[]; chiPhi: PhanCoCau[]; quy: PhanCoCau[]; haoHut: PhanCoCau[] } {
  const c = chuoiThang(k), hh = haoHut(k, c), soDu = thuChi(k).soDu[i], hd = c.dt[i] - c.nvl[i] - c.ln[i]
  const chia = (tong: number, ds: { ten: string; ty: number }[]) => chiaTheoTy(tong, ds.map(r => r.ty)).map((v, n) => ({ ten: ds[n].ten, v }))
  return {
    kenh: gomTop(chia(c.dt[i], KENH), THANG_MAU.xanh, 'kênh', 4),
    chiPhi: gomTop([{ ten: 'NVL', v: c.nvl[i] }, ...chia(hd, CO_CAU_CHI_PHI)], THANG_MAU.cam, 'khoản', 4),
    quy: gomTop(chia(soDu, QUY_TIEN), THANG_MAU.la, 'quỹ', 4),
    haoHut: gomTop(chia(hh.gia[i], NHOM_HAO_HUT), THANG_MAU.tim, 'nhóm', 2),
  }
}
