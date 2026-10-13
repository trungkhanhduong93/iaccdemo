import { type FC } from 'react'
import type { Col, Row, ScreenDef } from '../../modules/types'
import { CatalogPanel } from '../generic/CatalogScreen'
import type { CauHinhDM } from '../../modules/danh-muc/truong-dm'

export interface MFormDmProps {
  sc: ScreenDef
  cauHinh?: CauHinhDM
  edit: Row | null
  dienSan?: Row
  nhomLoc?: string
  all?: Row[]
  cols0?: Col[]
  nhoms?: string[]
  ten?: string
  tenNgan?: string
  onDong: () => void
  onLuu?: (formVal: Record<string, any>, themTiep: boolean) => void
}

export const MFormDm: FC<MFormDmProps> = ({
  sc,
  cauHinh,
  edit,
  dienSan,
  nhomLoc,
  all,
  cols0,
  nhoms,
  ten,
  tenNgan,
  onDong,
  onLuu,
}) => {
  if (!edit) return null

  return (
    <div className="m-form-dm">
      <CatalogPanel
        key={String(edit.ma ?? edit.username ?? (edit.ten ? edit.ten : 'moi'))}
        cauHinh={cauHinh}
        edit={edit}
        dienSan={dienSan}
        nhomLoc={nhomLoc}
        all={all}
        cols0={cols0}
        nhoms={nhoms}
        ten={ten}
        tenNgan={tenNgan ?? sc.ngan ?? ten}
        scSlug={sc.slug}
        onDong={onDong}
        onLuu={onLuu}
      />
    </div>
  )
}
