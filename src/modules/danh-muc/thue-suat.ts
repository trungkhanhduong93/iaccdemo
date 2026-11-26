// Danh mục loại thuế suất GTGT (1.11): nguồn duy nhất cho mã, tên và các ô chọn thuế suất ở
// nhóm hàng hoá, hàng hoá, mua hàng, bán hàng. Giá trị lưu ở chứng từ vẫn là số % ('0', '5', '8', '10') hoặc 'KCT'.
export interface LoaiThueSuat {
  ma: string          // mã loại thuế hiện ở danh mục
  ten: string
  gt: string          // giá trị lưu ở hàng hoá, dòng chứng từ; '' nếu không có mức %
  ts: string          // chữ hiện ở cột Thuế suất của danh mục
  ap: string          // ghi chú áp dụng
  chon: boolean       // có cho chọn ở ô Thuế suất GTGT không
}

export const DM_THUE_SUAT: LoaiThueSuat[] = [
  { ma: '00', ten: 'Thuế GTGT 0%', gt: '0', ts: '0%', ap: 'Hàng xuất khẩu', chon: true },
  { ma: '05', ten: 'Thuế GTGT 5%', gt: '5', ts: '5%', ap: 'Nước sạch, một số nông sản', chon: true },
  { ma: '08', ten: 'Thuế GTGT 8%', gt: '8', ts: '8%', ap: 'Dịch vụ ăn uống được giảm thuế', chon: true },
  { ma: '10', ten: 'Thuế GTGT 10%', gt: '10', ts: '10%', ap: 'Bia, rượu và hàng hoá khác', chon: true },
  { ma: 'KCT', ten: 'Không chịu thuế', gt: 'KCT', ts: '—', ap: 'Rau, thịt tươi sống chưa chế biến', chon: true },
  { ma: 'KKKNT', ten: 'Không kê khai, tính nộp', gt: '', ts: '—', ap: 'Khoản thu hộ', chon: false },
]

/** Giá trị lưu của các loại thuế cho chọn ở ô Thuế suất GTGT: KCT, 0, 5, 8, 10 (KCT đứng đầu như trước). */
export const DS_GT_THUE_SUAT: string[] = [
  ...DM_THUE_SUAT.filter(t => t.chon && t.gt === 'KCT').map(t => t.gt),
  ...DM_THUE_SUAT.filter(t => t.chon && t.gt !== 'KCT').map(t => t.gt),
]

/** Nhãn trong ô chọn: mã và tên theo danh mục, vd "08 - Thuế GTGT 8%". */
export const nhanThueSuat = (gt: string): string => {
  const t = DM_THUE_SUAT.find(x => x.gt === gt)
  return t ? `${t.ma} - ${t.ten}` : gt
}

/** Các mức % cho ô áp thuế chung ở chứng từ (không có KCT): { v: '8', t: '8%' }. */
export const DS_MUC_THUE_SUAT = DM_THUE_SUAT.filter(t => t.chon && /^\d+$/.test(t.gt)).map(t => ({ v: t.gt, t: t.ts }))
