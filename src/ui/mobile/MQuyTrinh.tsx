import { useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { ModuleDef, NutQT, QuyTrinhDef, ScreenProps } from '../../modules/types'
import { dich, hienMan, moDuoc } from '../../app/registry'
import { anNgoaiGoi } from '../../app/plan'
import { useSession, type Session } from '../../app/session'
import { Icon } from '../Icon'

export interface NutMobile {
  id: string
  ten: string
  moTa?: string
  icon: string
  di: string
  path: string
  tinh?: boolean
}

export interface BuocMobile {
  id: string
  so: number
  ten: string
  nut: NutMobile[]
}

export function layDsBuoc(mod: ModuleDef, s: Session): BuocMobile[] {
  const goc0 = mod.quyTrinh
  if (!goc0) return []

  // Gói Free có sơ đồ hội tụ riêng thì thay sơ đồ chung (T98)
  const goc1: QuyTrinhDef =
    s.goi === 'S' && goc0.hoiTuStandard
      ? { ...goc0, buoc: [], hoiTu: goc0.hoiTuStandard }
      : goc0

  // Gói Free có khối báo cáo riêng thì thay khối báo cáo, giữ các làn (T262)
  const goc: QuyTrinhDef =
    s.goi === 'S' && goc0.raStandard && goc1.hoiTu
      ? { ...goc1, hoiTu: { ...goc1.hoiTu, ra: goc0.raStandard } }
      : goc1

  // Gói Free có sơ đồ luồng theo cột thì thay sơ đồ chung (T123)
  const luong = s.goi === 'S' && goc.luongStandard ? goc.luongStandard : null

  const locNutCuaBuoc = (nutList: NutQT[]): NutMobile[] => {
    const ketQua: NutMobile[] = []
    let coNutHanhDong = false

    for (const n of nutList) {
      if (!n.di) {
        // Nút chữ tĩnh
        ketQua.push({
          id: `tinh-${n.ten}`,
          ten: n.ten,
          moTa: n.noi,
          icon: n.icon || 'doc',
          di: '',
          path: '',
          tinh: true,
        })
      } else {
        const d = dich(n.di, mod.key)
        if (!d.sc) continue

        // Ẩn ngoài gói ở MQuyTrinh.tsx, áp cho MỌI gói:
        // 1. !moDuoc(sc, s.goi)
        if (!moDuoc(d.sc, s.goi)) continue

        // 2. Màn không qua luật T194 (T299: gói Free ẩn màn ngoài gói)
        if (anNgoaiGoi(s.goi) ? !moDuoc(d.sc, s.goi) : !(moDuoc(d.sc, 'S') || moDuoc(d.sc, 'PL'))) continue

        // 3. !hienMan(sc, s.goi, s.cheDo, s)
        if (!hienMan(d.sc, s.goi, s.cheDo, s)) continue

        coNutHanhDong = true
        // Nếu là chứng từ, link vào danh sách chứng từ (bỏ /moi nếu có)
        const path =
          d.sc.voucher || d.sc.kind === 'voucher'
            ? d.path.replace(/\/moi(?=[?#]|$)/, '')
            : d.path

        ketQua.push({
          id: `link-${n.di}-${n.ten}`,
          ten: n.ten,
          moTa: n.noi,
          icon: n.icon || 'doc',
          di: n.di,
          path,
          tinh: false,
        })
      }
    }

    // Nút không có di (chữ tĩnh) giữ nguyên nếu bước còn nút khác.
    // Nếu bước không còn nút hành động nào, bỏ cả bước
    if (!coNutHanhDong) {
      return []
    }

    return ketQua
  }

  interface BuocTam {
    id: string
    ten: string
    nut: NutMobile[]
  }

  const buocRaw: BuocTam[] = []

  // 1. Sơ đồ hội tụ (hoiTu)
  if (goc.hoiTu) {
    goc.hoiTu.lan.forEach((l, idx) => {
      const nutLoc = locNutCuaBuoc(l.nut)
      if (nutLoc.length > 0) {
        buocRaw.push({
          id: `lan-${idx}-${l.ten}`,
          ten: l.ten,
          nut: nutLoc,
        })
      }
    })

    const raNut = locNutCuaBuoc(goc.hoiTu.ra.nut)
    if (raNut.length > 0) {
      buocRaw.push({
        id: `ra-${goc.hoiTu.ra.ten}`,
        ten: goc.hoiTu.ra.ten,
        nut: raNut,
      })
    }
  } else if (luong) {
    // 2. Sơ đồ luồng cột (luongStandard)
    luong.forEach((c, idx) => {
      const nutLoc = locNutCuaBuoc(c.nut)
      if (nutLoc.length > 0) {
        const tenBuoc = c.noi
          ? c.noi.charAt(0).toUpperCase() + c.noi.slice(1)
          : nutLoc.length === 1
            ? nutLoc[0].ten
            : nutLoc.map(n => n.ten).join(', ')
        buocRaw.push({
          id: `luong-${idx}`,
          ten: tenBuoc,
          nut: nutLoc,
        })
      }
    })
  } else if (goc.buoc) {
    // 3. Sơ đồ bước trục ngang (buoc)
    goc.buoc.forEach((b, idx) => {
      const tatCa = [...(b.tren ?? []), b.chinh, ...(b.duoi ?? [])]
      const nutLoc = locNutCuaBuoc(tatCa)
      if (nutLoc.length > 0) {
        buocRaw.push({
          id: `buoc-${idx}`,
          ten: b.ten || b.chinh.ten,
          nut: nutLoc,
        })
      }
    })
  }

  // Đánh số lại liên tục: 1, 2, 3...
  return buocRaw.map((b, idx) => ({
    ...b,
    so: idx + 1,
  }))
}

import { Navigate } from 'react-router-dom'
import { duongDan } from '../../app/registry'
import { manDauMobile } from './manMobile'
import { MChiMayTinh } from './MChiMayTinh'

export interface MQuyTrinhProps {
  mod: ModuleDef
  sc?: ScreenProps['sc']
}

export const MQuyTrinh: FC<MQuyTrinhProps> = ({ mod }) => {
  const { s } = useSession()
  const manDich = manDauMobile(mod, s.goi)
  // Phân hệ chỉ có sơ đồ: không chuyển hướng về chính nó (T295)
  if (manDich.kind === 'quytrinh') return <MChiMayTinh />
  return <Navigate to={duongDan(mod, manDich)} replace />
}
