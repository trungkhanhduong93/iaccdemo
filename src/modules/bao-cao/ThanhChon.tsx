// Thanh chọn đổi nhanh báo cáo cùng phân hệ khi đang xem báo cáo trong phân hệ Báo cáo
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ScreenDef } from '../types'
import { MODULES, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { kyHieuBC } from './danh-sach'

export function ThanhChonBaoCao({ sc }: { sc: ScreenDef }) {
  const { s } = useSession()
  const nav = useNavigate()
  const bcMod = MODULES.find(m => m.key === 'bao-cao')
  const cungGoc = bcMod?.screens.filter(x => x.goc === sc.goc && hienMan(x, s.goi, s.cheDo, s)) ?? []

  // Ghi nhận báo cáo vừa mở vào danh sách mở gần đây (tối đa 8, mới nhất trước, T58)
  useEffect(() => {
    if (!sc.slug) return
    try {
      const raw = localStorage.getItem('bc-gan-day')
      const ds: string[] = raw ? JSON.parse(raw) : []
      const loc = Array.isArray(ds) ? ds.filter(x => typeof x === 'string' && x !== sc.slug) : []
      const moi = [sc.slug, ...loc].slice(0, 8)
      localStorage.setItem('bc-gan-day', JSON.stringify(moi))
    } catch {}
  }, [sc.slug])

  return (
    <div className="bc-chon">
      <Link className="btn sm ghost" to="/app/bao-cao/tat-ca"><Icon n="chevl" className="ic sm" />Tất cả báo cáo</Link>
      <Select value={sc.slug} onChange={e => nav(`/app/bao-cao/${e.target.value}`)} aria-label="Đổi báo cáo">
        {cungGoc.map(x => {
          const ok = moDuoc(x, s.goi)
          const code = maKhoa(x)
          const kh = kyHieuBC(x.code, s.cheDo, s)   // ký hiệu mẫu viết liền sau tên báo cáo (T179)
          return (
            <option key={x.slug} value={x.slug}>
              {tenMan(x)}{kh ? ` · ${kh}` : ''}{ok || !code ? '' : ` (gói ${GOI[minGoi(code)].ten})`}
            </option>
          )
        })}
      </Select>
    </div>
  )
}
