import type { ModuleDef } from '../types'
import { TongQuan } from './TongQuan'
import { BanLamViec } from './BanLamViec'

const home: ModuleDef = {
  key: 'trang-chu', ten: 'Trang chủ', ngan: 'Trang chủ', icon: 'home',
  mota: 'Chủ doanh nghiệp xem Tổng quan, kế toán xem Bàn làm việc',
  screens: [
    { slug: 'tong-quan', code: '11.16', ten: 'Tổng quan', nhom: 'Trang chủ', kind: 'custom', comp: TongQuan },
    { slug: 'ban-lam-viec', ten: 'Bàn làm việc', nhom: 'Trang chủ', kind: 'custom', comp: BanLamViec },
  ],
}
export default home
