// Sổ cái giả: sinh bút toán từng tháng từ DAILY và kqkd(), cộng dồn số dư từ 01/08/2026.
// KQKD, bảng cân đối số phát sinh, bảng cân đối kế toán, lưu chuyển tiền tệ, Tổng quan đều đọc từ đây nên khớp tới từng đồng.
import { kqkd } from '../../data/mock'
import { k } from '../../ui/format'

export type BT = [no: string, co: string, tien: number, nhom: string]

/** Số dư 01/08/2026: dương là dư Nợ, âm là dư Có. Tài khoản 421 là phần còn lại để cân. */
const MO_DAU: Record<string, number> = {
  '1111': 286_400_000, '1121': 404_650_000, '131': 168_200_000, '1331': 18_640_000, '152': 398_700_000,
  '211': 1_606_300_000, '214': -427_000_000, '242': 1_250_000_000,
  '331': -352_800_000, '33311': 0, '3334': -96_300_000, '334': -642_000_000, '341': -650_000_000, '411': -1_500_000_000,
}
MO_DAU['421'] = -Object.values(MO_DAU).reduce((a, v) => a + v, 0)

export const TEN_TK: Record<string, string> = {
  '1111': 'Tiền mặt', '1121': 'Tiền gửi ngân hàng', '131': 'Phải thu của khách hàng', '1331': 'Thuế GTGT được khấu trừ', '152': 'Nguyên liệu, vật liệu',
  '211': 'Tài sản cố định', '214': 'Hao mòn tài sản cố định', '242': 'Chi phí trả trước', '331': 'Phải trả cho người bán', '33311': 'Thuế GTGT đầu ra',
  '3334': 'Thuế thu nhập doanh nghiệp', '334': 'Phải trả người lao động', '341': 'Vay và nợ thuê tài chính', '411': 'Vốn đầu tư của chủ sở hữu',
  '421': 'Lợi nhuận sau thuế chưa phân phối', '5111': 'Doanh thu bán hàng hoá', '515': 'Doanh thu hoạt động tài chính', '632': 'Giá vốn hàng bán',
  '635': 'Chi phí tài chính', '6421': 'Chi phí bán hàng', '6422': 'Chi phí quản lý doanh nghiệp', '711': 'Thu nhập khác', '811': 'Chi phí khác',
  '821': 'Chi phí thuế thu nhập doanh nghiệp', '911': 'Xác định kết quả kinh doanh',
}

export function butToan(thang: number): BT[] {
  const q = kqkd(thang, 2026), t = q.t, cp = q.cp
  const mua = k(t.gv * 1.03), thueVao = k(mua * 0.068)
  const bh = [k(cp.luong * 0.62), k(cp.matBang * 0.8), k(cp.dienNuoc * 0.85)]
  const ql = [k(cp.luong * 0.38), k(cp.matBang * 0.2), k(cp.dienNuoc * 0.15), cp.khauHao]
  const bhCcdc = q.cpBh - bh.reduce((a, v) => a + v, 0)           // phần còn lại vào phân bổ CCDC để tổng đúng KQKD
  const qlKhac = q.cpQl - ql.reduce((a, v) => a + v, 0)
  const bt: BT[] = [
    ['131', '5111', t.dt, 'ban'], ['131', '33311', t.vat, 'ban'],
    ['1111', '131', t.tm, 'thu'], ['1121', '131', t.ck + t.the, 'thu'], ['1121', '131', k(t.app * 0.86), 'thu'],
    ['5111', '131', q.giamTru, 'ban'],
    ['632', '152', t.gv, 'gv'],
    ['152', '331', mua, 'mua'], ['1331', '331', thueVao, 'mua'], ['331', '1121', mua + thueVao, 'trancc'],
    ['6421', '334', bh[0], 'cp'], ['6422', '334', ql[0], 'cp'], ['334', '1121', bh[0] + ql[0], 'luong'],
    ['6421', '242', bh[1], 'cp'], ['6422', '242', ql[1], 'cp'],
    ['6421', '331', bh[2], 'cp'], ['6422', '331', ql[2], 'cp'], ['331', '1121', bh[2] + ql[2], 'trancc'],
    ['6422', '214', ql[3], 'cp'], ['6421', '242', bhCcdc, 'cp'], ['6422', '1111', qlKhac, 'chikhac'],
    ['1121', '515', q.dtTc, 'tc'], ['635', '1121', q.cpTc, 'laivay'], ['1111', '711', q.tnKhac, 'thukhac'], ['811', '1111', q.cpKhac, 'chikhac'],
    ['1121', '1111', k(t.tm * 0.78), 'noptien'], ['341', '1121', 25_000_000, 'travay'],
    ['33311', '1331', Math.min(t.vat, thueVao), 'thue'], ['821', '3334', q.thue, 'thue'],
    ...(thang === 9 ? [['242', '1121', 1_104_000_000, 'thuetruoc'] as BT] : []),      // trả trước tiền thuê mặt bằng quý 4
  ]
  // Kết chuyển cuối kỳ
  const ps = (tk: string, ben: 0 | 1) => bt.reduce((a, b) => a + (b[ben] === tk ? b[2] : 0), 0)
  const kc: BT[] = [
    ['5111', '911', ps('5111', 1) - ps('5111', 0), 'kc'], ['515', '911', q.dtTc, 'kc'], ['711', '911', q.tnKhac, 'kc'],
    ['911', '632', t.gv, 'kc'], ['911', '6421', ps('6421', 0), 'kc'], ['911', '6422', ps('6422', 0), 'kc'],
    ['911', '635', q.cpTc, 'kc'], ['911', '811', q.cpKhac, 'kc'], ['911', '821', q.thue, 'kc'],
  ]
  const lai = kc.reduce((a, b) => a + (b[1] === '911' ? b[2] : 0) - (b[0] === '911' ? b[2] : 0), 0)
  kc.push(lai >= 0 ? ['911', '421', lai, 'kc'] : ['421', '911', -lai, 'kc'])
  return [...bt, ...kc].filter(b => b[2] !== 0)
}

export interface SoDu { mo: Record<string, number>; no: Record<string, number>; co: Record<string, number>; cuoi: Record<string, number>; bt: BT[] }

/** Số dư đầu kỳ, phát sinh, cuối kỳ của tháng (8, 9 hoặc 10/2026) */
export function soCai(thang: number): SoDu {
  let mo = { ...MO_DAU }
  for (let m = 8; m < thang; m++) mo = soCai1(m, mo).cuoi
  return soCai1(thang, mo)
}

function soCai1(thang: number, mo: Record<string, number>): SoDu {
  const bt = butToan(thang)
  const no: Record<string, number> = {}, co: Record<string, number> = {}
  for (const [n, c, v] of bt) { no[n] = (no[n] ?? 0) + v; co[c] = (co[c] ?? 0) + v }
  const cuoi: Record<string, number> = {}
  for (const tk of new Set([...Object.keys(mo), ...Object.keys(no), ...Object.keys(co)])) cuoi[tk] = (mo[tk] ?? 0) + (no[tk] ?? 0) - (co[tk] ?? 0)
  return { mo, no, co, cuoi, bt }
}

export const du = (s: Record<string, number>, ...tks: string[]) => tks.reduce((a, t) => a + (s[t] ?? 0), 0)
