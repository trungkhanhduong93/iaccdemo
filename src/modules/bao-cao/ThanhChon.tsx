// Thanh chọn đổi nhanh báo cáo cùng phân hệ khi đang xem báo cáo trong phân hệ Báo cáo
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ModuleDef, ScreenDef } from '../types'
import { MODULES, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { kyHieuBC } from './danh-sach'
import { laTuTrangChu } from '../../app/tuTrangChu'

/** trongPhanHe: báo cáo mở ngay trong phân hệ gốc (T384): nút quay lại về tab Báo cáo của phân hệ, đổi báo cáo vẫn ở phân hệ */
export function ThanhChonBaoCao({ sc, trongPhanHe }: { sc: ScreenDef; trongPhanHe?: ModuleDef }) {
  const { s } = useSession()
  const nav = useNavigate()
  const tuTrangChu = laTuTrangChu(useLocation().state)   // mở từ trang chủ gói Free thì có nút về Trang chủ (T232)
  const bcMod = MODULES.find(m => m.key === 'bao-cao')
  const cungGoc = bcMod?.screens.filter(x => x.goc === sc.goc && (x.slug === sc.slug || hienMan(x, s.goi, s.cheDo, s))) ?? []   // báo cáo đang xem luôn có trong ô chọn, kể cả báo cáo chỉ mở từ báo cáo khác (T200)

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
    <div className={`bc-chon${trongPhanHe ? ' bc-chon-phan-he' : ''}`}>
      {tuTrangChu && <Link className="btn sm ghost bc-ve-tc" to="/app/trang-chu/tong-quan"><Icon n="chevl" className="ic sm" />Trang chủ</Link>}
      {trongPhanHe
        ? <Link className="btn sm ghost" to={`/app/${trongPhanHe.key}/bao-cao`}><Icon n="chevl" className="ic sm" />Báo cáo {trongPhanHe.ngan ?? trongPhanHe.ten}</Link>
        : <Link className="btn sm ghost" to="/app/bao-cao/tat-ca"><Icon n="chevl" className="ic sm" />Tất cả báo cáo</Link>}
      <Select value={sc.slug} onChange={e => nav(`/app/${trongPhanHe ? trongPhanHe.key : 'bao-cao'}/${e.target.value}`)} aria-label="Đổi báo cáo">
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
