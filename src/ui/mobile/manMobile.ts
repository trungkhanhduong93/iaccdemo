import type { ComponentType } from 'react'
import type { ModuleDef, ScreenDef, ScreenProps } from '../../modules/types'
import { MChiMayTinh } from './MChiMayTinh'
import { MTrangChu } from './MTrangChu'

// Bảng riêng theo mod.key + '/' + sc.slug
const BANG_RIENG: Record<string, ComponentType<ScreenProps>> = {
  'trang-chu/tong-quan': MTrangChu,
  'trang-chu/ban-lam-viec': MTrangChu,
}

export function manMobile(sc: ScreenDef, mod: ModuleDef): ComponentType<ScreenProps> {
  const k = `${mod.key}/${sc.slug}`
  if (BANG_RIENG[k]) return BANG_RIENG[k]
  // Đợt 1: chưa có MChungTu, MDanhMuc, MSoBaoCao, mọi kind ra MChiMayTinh
  return MChiMayTinh
}
