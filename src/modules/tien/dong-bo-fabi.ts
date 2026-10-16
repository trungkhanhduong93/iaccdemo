// Đồng bộ phiếu thu, chi lập trên máy POS FABi (T264), mọi gói.
// Bật, tắt theo từng cửa hàng ở Hệ thống › Cấu hình kế toán. Mỗi phiếu FABi có cửa hàng và phương thức thanh toán (PTTT); quỹ nhận phiếu lấy theo
// map 'cửa hàng|PTTT' → quỹ khai ở Danh mục Quỹ tiền (một PTTT của một cửa hàng chỉ thuộc một quỹ). PTTT chưa map thì phiếu chờ, không vào sổ.
import type { Row } from '../types'
import type { Session } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { DS_PTTT, DS_QUY_TIEN_112 } from '../danh-muc/data'

type SDongBo = Pick<Session, 'donVi' | 'dongBoThuChi' | 'mapPttt'>

export const khoaMap = (cn: string, pttt: string) => `${cn}|${pttt}`

/** Map mặc định: tiền mặt về quỹ tiền mặt của cửa hàng; chuyển khoản, thẻ về Vietcombank; App giao đồ ăn chưa map */
const MAP_MAC_DINH: Record<string, string> = Object.fromEntries(CUA_HANG.flatMap((c, i) => [
  [khoaMap(c.id, 'TM'), `TM0${i + 1}`], [khoaMap(c.id, 'CK'), 'NH01'], [khoaMap(c.id, 'THE'), 'NH01'],
]))

export const batDongBoThuChi = (s: SDongBo, cn: string) => s.dongBoThuChi?.[s.donVi]?.[cn] ?? true
/** Bật, tắt đồng bộ một cửa hàng */
export const datDongBoThuChi = (s: SDongBo, cn: string, bat: boolean): Partial<Session> =>
  ({ dongBoThuChi: { ...s.dongBoThuChi, [s.donVi]: { ...s.dongBoThuChi?.[s.donVi], [cn]: bat } } })
export const mapPtttCua = (s: SDongBo) => s.mapPttt?.[s.donVi] ?? MAP_MAC_DINH

/** Các khoá 'cửa hàng|PTTT' đang map về quỹ này */
export const ptttCuaQuy = (s: SDongBo, maQuy: string) => Object.entries(mapPtttCua(s)).filter(([, q]) => q === maQuy).map(([k]) => k)

/** Lưu map của một quỹ: bỏ các khoá cũ của quỹ, gán các khoá đã chọn về quỹ */
export function luuPtttQuy(s: SDongBo, maQuy: string, khoa: string[]): Partial<Session> {
  const cu = mapPtttCua(s)
  const moi: Record<string, string> = Object.fromEntries(Object.entries(cu).filter(([, q]) => q !== maQuy))
  khoa.forEach(k => { moi[k] = maQuy })
  return { mapPttt: { ...s.mapPttt, [s.donVi]: moi } }
}

/** Dòng tóm tắt PTTT của quỹ ở danh sách Quỹ tiền, vd "Tiền mặt (Lê Lợi)" hoặc "Chuyển khoản, QR · 3 cửa hàng" */
export function tomTatPttt(khoa: string[]) {
  const theoPt = new Map<string, string[]>()
  khoa.forEach(k => { const [cn, pt] = k.split('|'); theoPt.set(pt, [...(theoPt.get(pt) ?? []), cn]) })
  return [...theoPt].map(([pt, cns]) => {
    const ten = DS_PTTT.find(x => x.ma === pt)?.ten ?? pt
    return cns.length === 1 ? `${ten} (${CUA_HANG.find(c => c.id === cns[0])?.ngan ?? cns[0]})` : `${ten} · ${cns.length} cửa hàng`
  }).join('; ')
}

// Phiếu thu, chi lập trên máy POS FABi tuần đầu tháng 10/2026 (mẫu): cửa hàng, ngày, giờ, thu hay chi, PTTT, diễn giải, số tiền
const MAU: [string, string, string, 'thu' | 'chi', string, string, number][] = [
  ['q1', '01/10/2026', '07:40', 'chi', 'TM', 'Chi mua đá viên đầu ca', 180_000],
  ['q1', '02/10/2026', '21:15', 'thu', 'TM', 'Thu phụ thu đóng gói mang về', 320_000],
  ['q1', '03/10/2026', '11:05', 'chi', 'CK', 'Chi trả tiền ship hàng gấp', 250_000],
  ['q5', '01/10/2026', '09:30', 'chi', 'TM', 'Chi mua rau thơm bổ sung', 145_000],
  ['q5', '04/10/2026', '19:20', 'thu', 'TM', 'Thu tiền khách đặt cọc bàn', 1_000_000],
  ['q5', '05/10/2026', '14:10', 'chi', 'THE', 'Chi mua văn phòng phẩm', 410_000],
  ['td', '02/10/2026', '08:00', 'chi', 'TM', 'Chi tiền gửi xe nhân viên', 120_000],
  ['td', '03/10/2026', '20:45', 'thu', 'CK', 'Thu tiền bán vỏ chai, thùng giấy', 260_000],
  ['td', '06/10/2026', '10:25', 'chi', 'APP', 'Chi hoàn tiền đơn app giao lỗi', 95_000],
  ['q1', '06/10/2026', '22:10', 'chi', 'TM', 'Chi tạm ứng ca tối', 500_000],
]

/** Quỹ theo mã: quỹ mẫu ở Danh mục Quỹ tiền; quỹ thêm mới trong phiên chưa có ở danh sách mẫu thì coi là ngân hàng nếu mã bắt đầu NH */
const quyTheoMa = (ma: string) => DS_QUY_TIEN_112.find(q => q.ma === ma) ?? { ma, ten: ma, loai: ma.startsWith('NH') ? 'Ngân hàng' : 'Tiền mặt' }

/** Phiếu FABi trong kỳ của các cửa hàng đang bật đồng bộ: đã map thì thành phiếu thu, chi của quỹ; chưa map thì vào danh sách chờ */
export function phieuThuChiFabi(s: SDongBo) {
  const map = mapPtttCua(s)
  const da: Row[] = [], cho: { cn: string; pttt: string; dienGiai: string; tien: number }[] = []
  MAU.forEach(([cn, ngay, gio, kieu, pttt, dg, tien], i) => {
    if (!batDongBoThuChi(s, cn)) return
    const maQuy = map[khoaMap(cn, pttt)]
    const tenCn = CUA_HANG.find(c => c.id === cn)?.ten ?? cn
    if (!maQuy) { cho.push({ cn: tenCn, pttt: DS_PTTT.find(x => x.ma === pttt)?.ten ?? pttt, dienGiai: dg, tien }); return }
    const quy = quyTheoMa(maQuy)
    const nh = quy.loai === 'Ngân hàng'
    const loai = kieu === 'thu' ? (nh ? 'bc' : 'thu') : (nh ? 'unc' : 'chi')
    const tk = nh ? '1121' : '1111'
    const [d, m] = ngay.split('/')
    da.push({
      id: `fabi-tc-${i + 1}`, loai, tenLoai: { thu: 'Thu tiền mặt', chi: 'Chi tiền mặt', bc: 'Thu ngân hàng', unc: 'Chi ngân hàng' }[loai],
      so: `FBTC26${m}${d}-${String(i + 1).padStart(2, '0')}`, ngay, gio, thang: Number(m),
      doiTuong: kieu === 'thu' ? 'Khách lẻ' : 'Nhân viên cửa hàng', maDt: '', cn: tenCn, dienGiai: dg, tien, thue: 0, tong: tien,
      nguon: 'FABi', tt: 'ghi', _quy: quy.ten, _pttt: pttt, _lyDo: kieu === 'thu' ? 'Thu khác' : 'Chi phí khác',
      _dong: [{ ma: '', ten: dg, dvt: '', sl: 1, gia: tien, tien, ts: 0, thue: 0, ly: kieu === 'thu' ? 'Thu khác' : 'Chi phí khác', km: '', cv: '',
        tkNo: kieu === 'thu' ? tk : '6422', tkCo: kieu === 'thu' ? '711' : tk }],
    })
  })
  return { da, cho }
}
