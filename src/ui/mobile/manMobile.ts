import type { ComponentType } from 'react'
import type { ModuleDef, ScreenDef, ScreenProps } from '../../modules/types'
import { hienMan, manDau, moDuoc, vaoBaoCao } from '../../app/registry'
import type { Goi } from '../../app/plan'
import { MChiMayTinh } from './MChiMayTinh'
import { MTrangChu } from './MTrangChu'
import { MChungTu } from './MChungTu'
import { MDanhMuc } from './MDanhMuc'
import { MBaoCao } from './MBaoCao'
import { MSoBaoCao } from './MSoBaoCao'
import { MToGiay } from './MToGiay'
import { MTaiKhoan } from './MTaiKhoan'
import { MCuaHang } from './MCuaHang'
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
import { MChiPhiThang } from './MChiPhiThang'
import { MLichSuQuy } from './MLichSuQuy'
import { MCcdc } from './MCcdc'
import { MKhoaSo } from './MKhoaSo'
import { MChiPhiNvl } from './MChiPhiNvl'
import { MToKhaiHKD } from './MToKhaiHKD'
import { MToKhaiGTGT } from './MToKhaiGTGT'

// Bảng riêng theo mod.key + '/' + sc.slug
const BANG_RIENG: Record<string, ComponentType<ScreenProps>> = {
  'trang-chu/tong-quan': MTrangChu,
  'trang-chu/ban-lam-viec': MTrangChu,
  'trang-chu/chi-phi-thang': MChiPhiThang,
  'trang-chu/chi-phi-nvl': MChiPhiNvl,
  'trang-chu/lich-su-quy': MLichSuQuy,
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
  // T187: Danh mục tài khoản 1.1 và Danh mục cửa hàng
  if (mod.key === 'danh-muc') {
    if (sc.code === '1.1' || sc.slug === '1-1') return MTaiKhoan
    if (sc.slug === 'cua-hang') return MCuaHang
  }

  // T191: Hệ thống (6 màn mở từ tab Khác)
  if (mod.key === 'he-thong') {
    if (sc.slug === 'nguoi-dung') return MNguoiDung
    if (sc.slug === 'phan-quyen') return MPhanQuyen
    if (sc.slug === 'nhat-ky') return MNhatKyThaoTac
    if (sc.slug === 'goi-thue-bao') return MGoiThueBao
    if (sc.slug === 'thong-tin') return MThongTinDonVi
    if (sc.slug === 'cau-hinh') return MCauHinh
    if (sc.slug === 'khoa-so') return MKhoaSo
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

  // T245: gói Free bỏ màn Số dư ban đầu riêng, đường dẫn cũ chuyển sang Danh mục Quỹ tiền
  if (mod.key === 'tien' && sc.slug === 'so-du-ban-dau' && sc.comp) return sc.comp
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
  // T240: Hai màn cho gói Free (Chi phí trong tháng, Lịch sử thu chi)
  if (mod.key === 'trang-chu') {
    if (sc.slug === 'chi-phi-thang') return MChiPhiThang
    if (sc.slug === 'chi-phi-nvl') return MChiPhiNvl
    if (sc.slug === 'lich-su-quy') return MLichSuQuy
  }

  // T281: Chi phí phân bổ (8.1.1 hoặc ccdc/8-1-1 / the-chi-phi)
  if (mod.key === 'ccdc' && (sc.code === '8.1.1' || sc.slug === '8-1-1' || sc.slug === 'the-chi-phi')) {
    return MCcdc
  }

  // T353: Khoá sổ kỳ kế toán trên điện thoại
  if (sc.code === '10.1.6' || sc.slug === '10-1-6') {
    return MKhoaSo
  }

  // T623: Kê khai thuế, gói Free danh sách tờ khai hộ kinh doanh, gói Standard trở lên tờ khai GTGT 6.2.3
  if (mod.key === 'thue') {
    if (sc.slug === 'to-khai') return MToKhaiHKD
    if (sc.code === '6.2.3' || sc.slug === '6-2-3') return MToKhaiGTGT
  }

  // T190: Màn tác vụ kind: 'tool', Kiểm tra cuối kỳ 10.1.4
  if (
    sc.kind === 'tool' ||
    Boolean(sc.tool) ||
    sc.code === '10.1.4' ||
    sc.slug === '10-1-4'
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

/** Màn mở khi bấm phân hệ trên điện thoại (T281): màn đầu trong gói có giao diện điện thoại, ưu tiên nhóm Chứng từ.
 *  Không có màn nào thì về manDau như web */
export function manDauMobile(mod: ModuleDef, goi: Goi): ScreenDef {
  const mo = mod.screens.filter(sc => sc.kind !== 'quytrinh' && moDuoc(sc, goi) && hienMan(sc, goi) && manMobile(sc, mod) !== MChiMayTinh)
  if (mo.length) return mo.find(sc => sc.nhom === 'Chứng từ') ?? mo[0]
  // Không màn nào chạy trên điện thoại: lấy màn đầu không phải sơ đồ, tránh MQuyTrinh chuyển hướng về chính nó
  const dau = manDau(mod, goi)
  return dau.kind !== 'quytrinh' ? dau : mod.screens.find(sc => sc.kind !== 'quytrinh') ?? dau
}

/** Phân hệ có ít nhất một màn trong gói có giao diện điện thoại; không có thì tab Nghiệp vụ ẩn phân hệ (T281) */
export const coManMobile = (mod: ModuleDef, goi: Goi) => manMobile(manDauMobile(mod, goi), mod) !== MChiMayTinh
