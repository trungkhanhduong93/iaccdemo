// Phân hệ Thuế GTGT: kê khai mua vào, bán ra, bảng kê, tờ khai
import type { Col, ModuleDef, Row } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { ToKhaiGTGT } from './ToKhaiGTGT'
import { DAILY, cnTen } from '../../data/mock'
import { dmy, pad } from '../../ui/format'

const bangKeBanRa = {
  cols: [{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'so', t: 'Số hoá đơn', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'mua', t: 'Người mua' },
    { k: 'dt', t: 'Doanh thu chưa thuế', num: true }, { k: 'vat', t: 'Thuế GTGT', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    const ds = DAILY.filter(x => x.date.getMonth() + 1 === thang)
    const rows: Row[] = ds.map((x, i) => ({ stt: i + 1, so: `C26MPM${pad(i + 1, 5)}`, ngay: dmy(x.date), mua: `Khách lẻ, hoá đơn tổng hợp ${cnTen(x.cn)}`, dt: x.dt, vat: x.vat }))
    return [...rows, { mua: 'Tổng cộng', dt: rows.reduce((a, r) => a + r.dt, 0), vat: rows.reduce((a, r) => a + r.vat, 0), _t: 1 }]
  },
}

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '6.1.1': 'Kê khai mua vào', '6.1.2': 'Kê khai bán ra', '6.2.3': 'Tờ khai thuế' }

const thue: ModuleDef = {
  key: 'thue', ten: 'Thuế GTGT', ngan: 'Thuế', icon: 'percent', mod: 5,
  mota: 'Kê khai, bảng kê hoá đơn, tờ khai, nộp qua kết nối cơ quan thuế',
  quyTrinh,
  screens: tuExcel(5, {
    '6.1.1': { voucher: { prefix: 'KKV', doiTuong: 'ncc', nhan: 'Người bán', them: 'Thêm dòng kê khai', dong: 'tien', tien: [1_500_000, 42_000_000], thue: 8, nguon: 'HĐ',
      dienGiai: ['Hoá đơn mua nguyên vật liệu', 'Hoá đơn tiền điện', 'Hoá đơn thuê mặt bằng'], noCo: [['1331', '331', 'Thuế GTGT được khấu trừ']] } },
    '6.1.2': { voucher: { prefix: 'KKR', doiTuong: 'kh', nhan: 'Người mua', them: 'Thêm dòng kê khai', dong: 'tien', tien: [5_000_000, 40_000_000], thue: 8, nguon: 'HĐ',
      dienGiai: ['Hoá đơn tổng hợp khách lẻ', 'Hoá đơn tiệc khách công ty'], noCo: [['131', '33311', 'Thuế GTGT đầu ra']] } },
    '6.2.1': { report: { kieu: 'bangke' } },
    '6.2.2': { report: { kieu: 'bangke', ...bangKeBanRa } },
    '6.2.3': { kind: 'custom', comp: ToKhaiGTGT, tab: true },
  }, NGAN),
}
export default thue
