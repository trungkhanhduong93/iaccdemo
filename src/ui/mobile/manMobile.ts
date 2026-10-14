import type { ComponentType } from 'react'
import type { ModuleDef, ScreenDef, ScreenProps } from '../../modules/types'
import { vaoBaoCao } from '../../app/registry'
import { MChiMayTinh } from './MChiMayTinh'
import { MTrangChu } from './MTrangChu'
import { MChungTu } from './MChungTu'
import { MDanhMuc } from './MDanhMuc'
import { MBaoCao } from './MBaoCao'
import { MSoBaoCao } from './MSoBaoCao'
import { MToGiay } from './MToGiay'
import { MTaiKhoan } from './MTaiKhoan'
import { MChiNhanh } from './MChiNhanh'
import { MGoiThueBao } from './MGoiThueBao'
import { MCauHinh, MNguoiDung, MNhatKyThaoTac, MPhanQuyen, MThongTinDonVi } from './MHeThong'
import { MTacVu } from './MTacVu'
import { MQuyTrinh } from './MQuyTrinh'

// Bảng riêng theo mod.key + '/' + sc.slug
const BANG_RIENG: Record<string, ComponentType<ScreenProps>> = {
  'trang-chu/tong-quan': MTrangChu,
  'trang-chu/ban-lam-viec': MTrangChu,
}

export function manMobile(sc: ScreenDef, mod: ModuleDef): ComponentType<ScreenProps> {
  const k = `${mod.key}/${sc.slug}`
  if (BANG_RIENG[k]) return BANG_RIENG[k]

  // Báo cáo trung tâm, nhóm báo cáo và tab Báo cáo của phân hệ
  if (
    (mod.key === 'bao-cao' && sc.slug === 'tat-ca') ||
    (mod.key === 'bao-cao' && sc.slug.startsWith('nhom-')) ||
    sc.kind === 'baocao'
  ) {
    return MBaoCao
  }

  // ── Luật Anti A thêm ngay dưới dòng này (đợt 11–13) ──
  // T187: Danh mục tài khoản 1.1 và Danh mục chi nhánh
  if (mod.key === 'danh-muc') {
    if (sc.code === '1.1' || sc.slug === '1-1') return MTaiKhoan
    if (sc.slug === 'chi-nhanh') return MChiNhanh
  }

  // T191: Hệ thống (6 màn mở từ tab Khác)
  if (mod.key === 'he-thong') {
    if (sc.slug === 'nguoi-dung') return MNguoiDung
    if (sc.slug === 'phan-quyen') return MPhanQuyen
    if (sc.slug === 'nhat-ky') return MNhatKyThaoTac
    if (sc.slug === 'goi-thue-bao') return MGoiThueBao
    if (sc.slug === 'thong-tin') return MThongTinDonVi
    if (sc.slug === 'cau-hinh') return MCauHinh
  }
  if (mod.key === 'tien-ich' && (sc.slug === 'x2' || sc.code === 'X2')) {
    return MNhatKyThaoTac
  }

  // ── Luật Anti B thêm ngay dưới dòng này (đợt 11–13) ──
  // T190: Màn tác vụ kind: 'tool', Kiểm tra cuối kỳ 10.1.4, Khoá sổ 10.1.6
  if (
    sc.kind === 'tool' ||
    Boolean(sc.tool) ||
    sc.code === '10.1.4' ||
    sc.code === '10.1.6' ||
    sc.slug === '10-1-4' ||
    sc.slug === '10-1-6'
  ) {
    return MTacVu
  }

  // T210: Sơ đồ quy trình (kind: 'quytrinh') của 11 phân hệ
  if (sc.kind === 'quytrinh' || sc.slug === 'quy-trinh') {
    return MQuyTrinh
  }

  // Chứng từ và danh mục
  if ((sc.kind === 'voucher' || sc.voucher) && sc.voucher) return MChungTu
  if (sc.kind === 'catalog' && sc.catalog) return MDanhMuc

  // Báo cáo sổ sách dạng bảng
  if (sc.kind === 'report') return MSoBaoCao

  // T202: Sổ quỹ tiền mặt trên điện thoại hiện bằng MSoBaoCao thay vì MToGiay
  if (sc.code === '2.2.1' || sc.slug === '2-2-1' || k === 'tien/2-2-1') {
    return MSoBaoCao
  }

  // Báo cáo tuỳ chỉnh (xuất nhập tồn, sổ quỹ, thẻ kho, BCTC, tờ khai thuế...)
  if (sc.kind === 'custom' && (vaoBaoCao(sc) || Boolean(sc.goc) || mod.key === 'bao-cao')) {
    return MToGiay
  }

  return MChiMayTinh
}
