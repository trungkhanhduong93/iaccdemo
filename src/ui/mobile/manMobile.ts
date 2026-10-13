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
