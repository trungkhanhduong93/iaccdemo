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
import { MXuatBanPos } from './MXuatBanPos'
import { MCongThuc } from './MCongThuc'
import { MSoDuBanDau } from './MSoDuBanDau'
import { MHoaDonDauVao } from './MHoaDonDauVao'
import { MDuyetChungTu } from './MDuyetChungTu'
import { MCanhBao, MChuyenTrangChu } from './MCanhBao'
import { MDoiSoat } from './MDoiSoat'
import { CongThucScreen } from '../../modules/kho/CongThuc'

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

  // T186: Xuất bán POS (3.1.1)
  if (mod.key === 'ban-hang' && (sc.code === '3.1.1' || sc.slug === '3-1-1')) {
    return MXuatBanPos
  }

  // T188: Công thức sơ chế 5.1.5 và Công thức chế biến 9.1.3
  if ((sc.code === '5.1.5' || sc.slug === '5-1-5' || sc.code === '9.1.3' || sc.slug === '9-1-3') && (mod.key === 'kho' || sc.comp === CongThucScreen)) {
    return MCongThuc
  }

  // T189: Số dư ban đầu (10.1.3 và tien/so-du-ban-dau)
  if ((mod.key === 'tong-hop' && (sc.code === '10.1.3' || sc.slug === '10-1-3')) || (mod.key === 'tien' && sc.slug === 'so-du-ban-dau')) {
    return MSoDuBanDau
  }

  // T192: Tiện ích bổ sung trên điện thoại (11.4, 11.5, 11.6, 11.7, 11.16)
  if (mod.key === 'tien-ich') {
    if (sc.code === '11.4' || sc.slug === '11-4') return MHoaDonDauVao
    if (sc.code === '11.5' || sc.slug === '11-5') return MDuyetChungTu
    if (sc.code === '11.6' || sc.slug === '11-6') return MCanhBao
    if (sc.code === '11.7' || sc.slug === '11-7') return MDoiSoat
    if (sc.code === '11.16' || sc.slug === '11-16') return MChuyenTrangChu
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
