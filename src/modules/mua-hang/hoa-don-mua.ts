// Hoá đơn mua hàng, mua hàng không qua kho (T821): chi phí dịch vụ, công cụ dụng cụ đưa thẳng vào chi phí hoặc phân bổ,
// có hoặc chưa có hoá đơn, chưa trả tiền thì ghi công nợ nhà cung cấp. Lý do nghiệp vụ lấy từ lý do chi:
// lý do Là chi phí vào Sổ chi phí, Chi phí trong tháng (KQKD); lý do Chi phí phân bổ nhiều kỳ lưu xong báo tạo thẻ chi phí
import type { Row, VoucherCfg } from '../types'
import { chungTu, type Dong } from '../../ui/generic/gen'
import { apKhoPhieu } from '../../ui/generic/daXoa'
import { CCDC_HANG, LY_CHI_PHI, NCC } from '../../data/mock'

export const MAN_HDM = 'mua-hang/4-1-2'

/** Dòng mẫu: [diễn giải, tiền, thuế suất, mã hàng]; dòng có mã công cụ dụng cụ thì tạo thẻ mặc định loại CCDC (T822) */
const MAU: { dg: string; ly: string; dong: [string, number, number, string?][] }[] = [
  { dg: 'Hoá đơn tiền điện tháng 9', ly: 'Thanh toán tiền điện', dong: [['Tiền điện kỳ tháng 9', 6_850_000, 8]] },
  { dg: 'Sửa chữa hệ thống hút khói bếp', ly: 'Chi phí sửa chữa', dong: [['Thay quạt hút khói', 3_200_000, 8], ['Vệ sinh đường ống hút khói', 1_500_000, 8]] },
  { dg: 'Mua bộ nồi inox, dao thớt cho bếp', ly: 'Chi phí chờ phân bổ', dong: [['Bộ nồi inox 50 lít', 9_600_000, 10, 'CCDC0001'], ['Dao thớt bếp trọn bộ', 2_400_000, 10, 'CCDC0005']] },
  { dg: 'Dịch vụ giặt khăn bàn tháng 9', ly: 'Chi phí giặt là', dong: [['Giặt khăn bàn, khăn ăn', 1_850_000, 8]] },
  { dg: 'Quảng cáo Facebook món mới', ly: 'Chi tiền quảng cáo, marketing', dong: [['Chạy quảng cáo Facebook 2 tuần', 5_000_000, 10]] },
  { dg: 'Hoá đơn tiền nước tháng 9', ly: 'Thanh toán tiền nước', dong: [['Tiền nước sinh hoạt kỳ tháng 9', 1_240_000, 5]] },
  { dg: 'Cước internet tháng 10', ly: 'Thanh toán tiền internet', dong: [['Cước cáp quang tháng 10', 660_000, 10]] },
  { dg: 'In thực đơn mới', ly: 'Chi phí in ấn tài liệu', dong: [['In thực đơn bìa cứng', 1_800_000, 8], ['In tờ rơi khuyến mại', 700_000, 8]] },
]

export const HOA_DON_MUA: VoucherCfg = {
  prefix: 'HDM', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm hoá đơn mua hàng', dong: 'nvl', tien: [0, 0], nguon: 'HĐ', khongKho: true,
  dienGiai: MAU.map(m => m.dg), noCo: [['6422', '331', 'Chi phí mua ngoài'], ['1331', '331', 'Thuế GTGT được khấu trừ']],
}

/** Hoá đơn mua mẫu: dòng không mã hàng, gõ diễn giải; mỗi phiếu một lý do nghiệp vụ */
export function hoaDonMuaMau(): Row[] {
  return chungTu(HOA_DON_MUA, '4.1.2').map((r, i) => {
    const m = MAU[i % MAU.length]
    const he = 1 + (Math.floor(i / MAU.length) % 3) / 10
    const dong: Dong[] = m.dong.map(([ten, t, ts, ma = '']) => {
      const tien = Math.round(t * he / 1000) * 1000
      return { ma, ten, dvt: CCDC_HANG.find(h => h.ma === ma)?.dvt ?? '', sl: 1, gia: tien, tien, ts, thue: Math.round(tien * ts / 100), ptCk: 0, ck: 0, ly: m.ly }
    })
    const tien = dong.reduce((a, d) => a + d.tien, 0), thue = dong.reduce((a, d) => a + d.thue, 0)
    // Nhà cung cấp hợp với khoản chi: điện, nước, internet của Điện lực; còn lại của Thiết bị bếp Gia Phát (danh mục mẫu chỉ có 7 nhà cung cấp)
    const ncc = NCC.find(x => x.ma === (/điện|nước|internet/i.test(m.ly) ? 'NCC007' : 'NCC006')) ?? NCC[0]
    return { ...r, doiTuong: ncc.ten, maDt: ncc.ma, dienGiai: m.dg, _lyDo: m.ly, _dong: dong, tien, thue, tong: tien + thue }
  })
}

/** Hoá đơn mua hàng có lý do Là chi phí trong tháng (phiếu mẫu, lập thêm, đã sửa, bỏ đã xoá): vào Sổ chi phí, Chi phí trong tháng KQKD.
 *  Lý do Chi phí phân bổ nhiều kỳ không cộng ở đây, vào chi phí dần qua thẻ chi phí. Số tiền trước thuế GTGT */
export function hoaDonMuaChiPhiThang(thang: number, nam = 2026): Row[] {
  return apKhoPhieu(MAN_HDM, hoaDonMuaMau()).filter(r => {
    const [, t, n] = String(r.ngay ?? '').split(' ')[0].split('/').map(Number)
    return t === thang && n === nam && LY_CHI_PHI.includes(String(r._lyDo ?? ''))
  })
}
