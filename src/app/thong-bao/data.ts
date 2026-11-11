// Thông báo ở thanh trên và điện thoại (T803, QD108): dữ liệu mẫu, cài đặt loại thông báo, ngôn ngữ.
// Trạng thái đã đọc, cài đặt, ngôn ngữ lưu ở localStorage để chuông, khung thông báo, trang Xem tất cả và điện thoại dùng chung.
import { useSyncExternalStore } from 'react'

export type TheTb = 'vh' | 'nn' | 'ht'
export type NgonNgu = 'vi' | 'en'

/** Biểu tượng theo loại sự kiện: màu nét và đường vẽ khung 24 */
export const BIEU_TUONG: Record<string, { mau: string; d: string }> = {
  gia:   { mau: 'var(--orange-d)', d: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01' },
  vuot:  { mau: 'var(--red)', d: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01' },
  hd:    { mau: 'var(--blue)', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5' },
  quy:   { mau: 'var(--amber)', d: 'M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7M16 14h.01' },
  duyet: { mau: 'var(--st)', d: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3' },
  han:   { mau: 'var(--amber)', d: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18' },
  khoa:  { mau: '#475569', d: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4' },
  no:    { mau: 'var(--md)', d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2' },
  goi:   { mau: 'var(--orange-d)', d: 'M3 8h18v4H3zM12 8v13M5 12v9h14v-9M12 8S10 3 7.5 3a2.5 2.5 0 0 0 0 5M12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5' },
  moi:   { mau: 'var(--blue)', d: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z' },
}

export const DS_THE: { id: TheTb; ten: string }[] = [
  { id: 'vh', ten: 'Vận hành' }, { id: 'nn', ten: 'Nhắc nhở' }, { id: 'ht', ten: 'Hệ thống' },
]

export const DS_LOAI: { id: string; ten: string }[] = [
  { id: 'ct', ten: 'Chứng từ' }, { id: 'kho', ten: 'Hàng hóa và kho' }, { id: 'tien', ten: 'Tiền và công nợ' },
  { id: 'thue', ten: 'Thuế và hóa đơn' }, { id: 'dk', ten: 'Nhắc nhở định kỳ' }, { id: 'ht', ten: 'Hệ thống' },
]

export interface ThongBao {
  id: string; the: TheTb; k: string; loai: string
  /** số ngày tính từ hôm nay; ngày, giờ ghi ở trang Xem tất cả; luc ghi ở khung thông báo */
  ago: number; ngay: string; gio: string; luc: string
  moi?: boolean                 // chưa đọc lúc đầu
  tieuDe: string; nd: string    // nd: chữ giữa hai cặp ** in đậm
  viec?: string; di?: string    // nút thao tác và màn mở ra
}

export const DS_THONG_BAO: ThongBao[] = [
  { id: 'v1', the: 'vh', k: 'gia', loai: 'kho', ago: 0, ngay: '11/11/2026', gio: '10:12', luc: '4 giờ trước', moi: true, tieuDe: 'Giá nhập tăng', viec: 'Xem phiếu nhập', di: '/app/mua-hang/4-1-1',
    nd: 'Hàng hóa **CAFE4 – Cà phê sữa tươi** nhập ngày 11/11/2026 tại **Kho tổng** giá **44.444 đ/Ly**, tăng **44.000 đ** so với lần nhập trước.' },
  { id: 'v2', the: 'vh', k: 'vuot', loai: 'ct', ago: 0, ngay: '11/11/2026', gio: '10:05', luc: '4 giờ trước', moi: true, tieuDe: 'Chứng từ vượt hạn mức', viec: 'Xem chứng từ', di: '/app/mua-hang/4-1-1',
    nd: 'Phiếu nhập mua **NMH00332/T11** tại **Kho tổng** có tổng tiền **922.213 đ**, vượt **912.213 đ** so với hạn mức 10.000 đ/phiếu.' },
  { id: 's1', the: 'ht', k: 'goi', loai: 'ht', ago: 0, ngay: '11/11/2026', gio: '09:00', luc: '5 giờ trước', moi: true, tieuDe: 'Gói Pro hết hạn sau 15 ngày', viec: 'Gia hạn', di: '/app/he-thong/goi-thue-bao',
    nd: 'Gói thuê bao của **Demo-Pro** hết hạn ngày **26/11/2026**. Gia hạn trước để không gián đoạn.' },
  { id: 'v3', the: 'vh', k: 'hd', loai: 'thue', ago: 0, ngay: '11/11/2026', gio: '08:20', luc: '6 giờ trước', moi: true, tieuDe: 'Có 3 hóa đơn đầu vào mới', viec: 'Lập phiếu mua', di: '/app/tien-ich/11-4',
    nd: 'Cơ quan thuế trả về **3 hóa đơn** của **Công ty TNHH Minh Phát**. Chưa có phiếu mua hàng tương ứng.' },
  { id: 'n1', the: 'nn', k: 'han', loai: 'thue', ago: 0, ngay: '11/11/2026', gio: '06:00', luc: '8 giờ trước', moi: true, tieuDe: 'Sắp đến hạn nộp tờ khai GTGT', viec: 'Lập tờ khai', di: '/app/thue/6-2-3',
    nd: 'Tờ khai GTGT **tháng 10/2026** hết hạn nộp ngày **20/11/2026**, còn **9 ngày**.' },
  { id: 'n2', the: 'nn', k: 'khoa', loai: 'dk', ago: 0, ngay: '11/11/2026', gio: '06:00', luc: '8 giờ trước', tieuDe: 'Chưa khóa sổ tháng 10', viec: 'Khóa sổ', di: '/app/tong-hop/10-1-6',
    nd: 'Kỳ **10/2026** đã qua 11 ngày nhưng chưa khóa sổ. Chứng từ trong kỳ vẫn sửa được.' },
  { id: 'v4', the: 'vh', k: 'quy', loai: 'tien', ago: 1, ngay: '10/11/2026', gio: '19:24', luc: '19:24, hôm qua', tieuDe: 'Tồn quỹ tiền mặt âm', viec: 'Xem sổ quỹ', di: '/app/tien/2-2-1',
    nd: 'Quỹ **Tiền mặt cửa hàng Q1** âm **1.250.000 đ** sau phiếu chi **PC00118** ngày 10/11/2026.' },
  { id: 'v5', the: 'vh', k: 'duyet', loai: 'ct', ago: 1, ngay: '10/11/2026', gio: '16:02', luc: '16:02, hôm qua', tieuDe: 'Chứng từ chờ duyệt',
    nd: '**Lê Thu Hà** gửi duyệt phiếu chi **PC00121**, số tiền **5.400.000 đ**.' },
  { id: 'n3', the: 'nn', k: 'no', loai: 'tien', ago: 1, ngay: '10/11/2026', gio: '08:00', luc: '08:00, hôm qua', tieuDe: 'Công nợ nhà cung cấp đến hạn', viec: 'Xem công nợ', di: '/app/mua-hang/4-2-2',
    nd: '**4 khoản** phải trả đến hạn trong 3 ngày tới, tổng **38.600.000 đ**.' },
  { id: 'v7', the: 'vh', k: 'vuot', loai: 'ct', ago: 2, ngay: '09/11/2026', gio: '14:40', luc: '14:40, 09/11', tieuDe: 'Chứng từ vượt hạn mức', viec: 'Xem chứng từ', di: '/app/mua-hang/4-1-1',
    nd: 'Đặt mua hàng **PO00188/T11** có tổng tiền **95.000 đ**, vượt **85.000 đ** so với hạn mức 10.000 đ/đơn.' },
  { id: 's2', the: 'ht', k: 'moi', loai: 'ht', ago: 2, ngay: '09/11/2026', gio: '07:30', luc: 'Thứ Hai', tieuDe: 'Phiên bản mới 2.14',
    nd: 'Xuất bán POS tính giảm thuế GTGT theo từng món.' },
  { id: 'v8', the: 'vh', k: 'gia', loai: 'kho', ago: 10, ngay: '01/11/2026', gio: '11:10', luc: '11:10, 01/11', tieuDe: 'Giá nhập tăng',
    nd: 'Hàng hóa **CHOIQUETBUI – Chổi quét bụi** nhập tại **Kho tổng** giá **22.222 đ/Chiếc**, tăng **22.222 đ** so với lần nhập trước.' },
  { id: 'n4', the: 'nn', k: 'han', loai: 'thue', ago: 22, ngay: '20/10/2026', gio: '06:00', luc: '06:00, 20/10', tieuDe: 'Hôm nay hết hạn nộp tờ khai GTGT',
    nd: 'Tờ khai GTGT **tháng 9/2026** hết hạn nộp hôm nay.' },
]

/** Nhóm ngày ở khung thông báo */
export const nhomNgay = (n: ThongBao) => n.ago === 0 ? 'Hôm nay' : n.ago === 1 ? 'Hôm qua' : n.ago < 7 ? 'Tuần này' : 'Trước đó'

/** Loại thông báo bật tắt được; md: bật sẵn */
export const DS_CAI_DAT: { ten: string; ds: { id: string; ten: string; md: boolean }[] }[] = [
  { ten: 'Chứng từ', ds: [
    { id: 'duyet', ten: 'Trạng thái duyệt chứng từ', md: true },
    { id: 'vuot', ten: 'Chứng từ vượt hạn mức', md: true },
    { id: 'suakhoa', ten: 'Sửa chứng từ kỳ đã khóa', md: true } ] },
  { ten: 'Hàng hóa và kho', ds: [
    { id: 'gia', ten: 'Giá nhập thay đổi', md: false },
    { id: 'tonam', ten: 'Tồn kho âm', md: true } ] },
  { ten: 'Tiền và công nợ', ds: [
    { id: 'quy', ten: 'Tồn quỹ âm', md: true },
    { id: 'no', ten: 'Công nợ đến hạn', md: false } ] },
  { ten: 'Thuế và hóa đơn', ds: [
    { id: 'hd', ten: 'Hóa đơn đầu vào mới', md: true },
    { id: 'tk', ten: 'Hạn nộp tờ khai thuế', md: true } ] },
  { ten: 'Nhắc nhở định kỳ', ds: [
    { id: 'khoa', ten: 'Khóa sổ cuối kỳ', md: false },
    { id: 'pos', ten: 'Đối soát bán hàng POS', md: false } ] },
  { ten: 'Hệ thống', ds: [
    { id: 'goi', ten: 'Gói thuê bao và gia hạn', md: false },
    { id: 'moi', ten: 'Phiên bản mới', md: false } ] },
]

export const caiDatMacDinh = (): Record<string, boolean> =>
  Object.fromEntries(DS_CAI_DAT.flatMap(g => g.ds.map(r => [r.id, r.md])))

export const DS_NGON_NGU: { id: NgonNgu; ten: string }[] = [{ id: 'vi', ten: 'Tiếng Việt' }, { id: 'en', ten: 'English' }]

/** Trang tài liệu hướng dẫn, mở ở thẻ mới */
export const LINK_TAI_LIEU = 'https://docs.gitbook.com'

// ── Kho dùng chung ──
interface Kho { doc: Record<string, boolean>; caiDat: Record<string, boolean>; nn: NgonNgu }
const KEY = 'iacc-thong-bao'
function docKho(): Kho {
  const md: Kho = { doc: Object.fromEntries(DS_THONG_BAO.map(n => [n.id, !n.moi])), caiDat: caiDatMacDinh(), nn: 'vi' }
  try {
    const luu = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (luu) return { doc: { ...md.doc, ...luu.doc }, caiDat: { ...md.caiDat, ...luu.caiDat }, nn: luu.nn === 'en' ? 'en' : 'vi' }
  } catch { /* dữ liệu lưu hỏng thì dùng mặc định */ }
  return md
}
let kho = docKho()
const nghe = new Set<() => void>()
function ghi(p: Partial<Kho>) {
  kho = { ...kho, ...p }
  try { localStorage.setItem(KEY, JSON.stringify(kho)) } catch { /* trình duyệt chặn lưu: vẫn chạy trong phiên */ }
  nghe.forEach(f => f())
}
const dangKy = (f: () => void) => { nghe.add(f); return () => { nghe.delete(f) } }

export function useThongBao() {
  const k = useSyncExternalStore(dangKy, () => kho)
  const chuaDoc = (n: ThongBao) => !k.doc[n.id]
  return {
    ...k, chuaDoc,
    soChuaDoc: DS_THONG_BAO.filter(n => n.ago < 7 && chuaDoc(n)).length,
    /** đánh dấu một loạt thông báo đã đọc (true) hoặc chưa đọc (false) */
    danhDau: (ids: string[], daDoc = true) => ghi({ doc: { ...kho.doc, ...Object.fromEntries(ids.map(id => [id, daDoc])) } }),
    docHet: () => ghi({ doc: Object.fromEntries(DS_THONG_BAO.map(n => [n.id, true])) }),
    luuCaiDat: (caiDat: Record<string, boolean>) => ghi({ caiDat }),
    doiNgonNgu: (nn: NgonNgu) => ghi({ nn }),
  }
}

/** Mã hỗ trợ 7 ký tự, bỏ chữ dễ nhầm với số */
export function maHoTroMoi() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 7 }, () => c[Math.floor(Math.random() * c.length)]).join('')
}
/** Giờ hết hạn của mã hỗ trợ: 2 giờ kể từ lúc tạo */
export function hanMaHoTro() {
  const d = new Date(Date.now() + 2 * 3600 * 1000), p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())} ngày ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}
