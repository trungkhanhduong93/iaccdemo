import type { ComponentType } from 'react'
import type { ModuleDef, ScreenDef, ScreenProps } from '../../modules/types'
import { MChiMayTinh } from './MChiMayTinh'
import { MTrangChu } from './MTrangChu'
import { MChungTu } from './MChungTu'
import { MDanhMuc } from './MDanhMuc'

// Bảng riêng theo mod.key + '/' + sc.slug
const BANG_RIENG: Record<string, ComponentType<ScreenProps>> = {
  'trang-chu/tong-quan': MTrangChu,
  'trang-chu/ban-lam-viec': MTrangChu,
}

export function manMobile(sc: ScreenDef, mod: ModuleDef): ComponentType<ScreenProps> {
  const k = `${mod.key}/${sc.slug}`
  if (BANG_RIENG[k]) return BANG_RIENG[k]
  if ((sc.kind === 'voucher' || sc.voucher) && sc.voucher) return MChungTu
  if (sc.kind === 'catalog' && sc.catalog) return MDanhMuc
  return MChiMayTinh
}
