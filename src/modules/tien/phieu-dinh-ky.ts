// Phiếu chi mẫu định kỳ (T483): mỗi cửa hàng trả tiền thuê mặt bằng ngày 05 và trả lương ngày cuối tháng của chính tháng đó qua ngân hàng,
// từ tháng 7 (đầu dữ liệu mẫu) tới hôm nay (07/10/2026: tháng 10 mới có thuê mặt bằng). Lương theo bảng lương bộ phận ở Sổ bổ sung (bếp, phục vụ, quản lý 166 triệu chia theo cửa hàng),
// thuê mặt bằng như Sổ bổ sung (Lê Lợi 65, Nguyễn Trãi 42, Thảo Điền 55 triệu). Chi phí hoạt động trang chủ cộng từ các phiếu này
import type { Row } from '../types'
import { CUA_HANG, HOM_NAY } from '../../data/mock'
import { tkTheoLyDo } from '../../ui/generic/gen'

const LUONG: Record<string, number> = { q1: 64_000_000, q5: 47_000_000, td: 55_000_000 }
const THUE: Record<string, [number, string]> = { q1: [65_000_000, 'Bà Nguyễn Thị Hạnh'], q5: [42_000_000, 'Ông Trần Văn Lộc'], td: [55_000_000, 'Công ty TNHH Bất động sản Thảo Điền'] }
const p2 = (n: number) => String(n).padStart(2, '0')

function phieu(id: string, so: string, ngay: string, gio: string, thang: number, cn: string, doiTuong: string, dienGiai: string, ly: string, tien: number): Row {
  const tk = tkTheoLyDo('unc', ly)
  return {
    id, loai: 'unc', tenLoai: 'Chi ngân hàng', so, ngay, gio, thang, doiTuong, maDt: '', cn, dienGiai,
    tien, thue: 0, tong: tien, nguon: 'tay', tt: 'ghi', _lyDo: ly, _ghiChu: dienGiai,
    _dong: [{ ma: '', ten: dienGiai, dvt: '', sl: 1, gia: tien, tien, ts: 0, thue: 0, ly, km: '', cv: '', tkNo: tk.tkNo ?? '', tkCo: tk.tkCo ?? '1121' }],
  }
}

/** Phiếu chi thuê mặt bằng ngày 05, lương ngày cuối tháng, các tháng 7 tới hôm nay, mới nhất ở đầu */
export function phieuLuongThueNha(): Row[] {
  const out: Row[] = []
  for (let thang = 7; thang <= HOM_NAY.getMonth() + 1; thang++) {
    const cuoi = new Date(2026, thang, 0).getDate()
    CUA_HANG.forEach((c, i) => {
      const [thue, chuNha] = THUE[c.id] ?? [0, '']
      if (thue && new Date(2026, thang - 1, 5) <= HOM_NAY) out.push(phieu(`thue-${thang}-${c.id}`, `UNC26${p2(thang)}-09${i * 2 + 1}`, `05/${p2(thang)}/2026`, '09:00', thang, c.ten, chuNha,
        `Trả tiền thuê mặt bằng tháng ${thang} cửa hàng ${c.ngan}`, 'Chi tiền thuê nhà', thue))
      if (LUONG[c.id] && new Date(2026, thang - 1, cuoi) <= HOM_NAY) out.push(phieu(`luong-${thang}-${c.id}`, `UNC26${p2(thang)}-09${i * 2 + 2}`, `${cuoi}/${p2(thang)}/2026`, '16:00', thang, c.ten, 'Nhân viên cửa hàng',
        `Trả lương tháng ${thang} nhân viên ${c.ngan}`, 'Thanh toán tiền lương', LUONG[c.id]))
    })
  }
  return out.reverse()
}
