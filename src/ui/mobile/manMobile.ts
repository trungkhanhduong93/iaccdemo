import type { ComponentType } from 'react'
import type { ModuleDef, ScreenDef, ScreenProps } from '../../modules/types'
import { MChiMayTinh } from './MChiMayTinh'

// Bảng riêng theo mod.key + '/' + sc.slug (đợt 1 rỗng)
const BANG_RIENG: Record<string, ComponentType<ScreenProps>> = {}

export function manMobile(sc: ScreenDef, mod: ModuleDef): ComponentType<ScreenProps> {
  const k = `${mod.key}/${sc.slug}`
  if (BANG_RIENG[k]) return BANG_RIENG[k]
  // Đợt 1: chưa có MChungTu, MDanhMuc, MSoBaoCao, mọi kind ra MChiMayTinh
  return MChiMayTinh
}
