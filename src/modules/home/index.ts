import type { ModuleDef } from '../types'
import { TongQuan } from './TongQuan'
import { BanLamViec } from './BanLamViec'
import { ChiPhiThang } from './ChiPhiThang'
import { LichSuQuy } from './LichSuQuy'
import { ChiPhiNvl } from './ChiPhiNvl'

const home: ModuleDef = {
  key: 'trang-chu', ten: 'Trang chủ', ngan: 'Trang chủ', icon: 'home',
  mota: 'Chủ doanh nghiệp xem Tổng quan, kế toán xem Bàn làm việc',
  screens: [
    { slug: 'tong-quan', code: '11.16', ten: 'Tổng quan', nhom: 'Trang chủ', kind: 'custom', comp: TongQuan },
    // Gói Free bỏ Bàn làm việc, Trang chủ chỉ còn Tổng quan ba bài toán, PhuongXT chốt 14/10/2026 (T230)
    // Chi phí trong tháng theo lý do chi, mở từ thẻ Chi phí trong tháng ở trang chủ gói Free; không có tab riêng (T230)
    { slug: 'chi-phi-thang', ten: 'Chi phí hoạt động', nhom: 'Trang chủ', kind: 'custom', comp: ChiPhiThang, tabCha: 'tong-quan', goi: ['S'] },
    // Chi phí NVL theo cách tính từng cửa hàng, nhập giá thành món; mở từ thẻ Chi phí nguyên vật liệu, dòng Chi phí NVL ở KQKD (T232)
    { slug: 'chi-phi-nvl', ten: 'Chi phí NVL', nhom: 'Trang chủ', kind: 'custom', comp: ChiPhiNvl, tabCha: 'tong-quan', goi: ['S'] },
    // Lịch sử thu chi một quỹ kiểu app ngân hàng, mở từ khối Tồn quỹ trang chủ gói Free (T230)
    { slug: 'lich-su-quy', ten: 'Lịch sử thu chi', nhom: 'Trang chủ', kind: 'custom', comp: LichSuQuy, tabCha: 'tong-quan', goi: ['S'] },
    { slug: 'ban-lam-viec', ten: 'Bàn làm việc', nhom: 'Trang chủ', kind: 'custom', comp: BanLamViec, goi: ['PL', 'PR'] },
  ],
}
export default home
