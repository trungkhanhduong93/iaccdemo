// Thanh chọn đổi nhanh báo cáo cùng phân hệ khi đang xem báo cáo trong phân hệ Báo cáo
import { Link, useNavigate } from 'react-router-dom'
import type { ScreenDef } from '../types'
import { MODULES, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { datChoThanhCongCu } from '../../ui/bao-cao/choThanh'

export function ThanhChonBaoCao({ sc }: { sc: ScreenDef }) {
  const { s } = useSession()
  const nav = useNavigate()
  const modGoc = MODULES.find(m => m.key === sc.goc)
  const tenPhanHeGoc = modGoc?.ten ?? ''
  const bcMod = MODULES.find(m => m.key === 'bao-cao')
  const cungGoc = bcMod?.screens.filter(x => x.goc === sc.goc && hienMan(x, s.goi)) ?? []

  return (
    <div className="bc-chon">
      <Link className="btn sm ghost" to="/app/bao-cao/tat-ca"><Icon n="chevl" className="ic sm" />Tất cả báo cáo</Link>
      <span className="bc-chon-nhan">{tenPhanHeGoc}</span>
      <Select value={sc.slug} onChange={e => nav(`/app/bao-cao/${e.target.value}`)} aria-label="Đổi báo cáo">
        {cungGoc.map(x => {
          const ok = moDuoc(x, s.goi)
          const code = maKhoa(x)
          return (
            <option key={x.slug} value={x.slug}>
              {tenMan(x)}{ok || !code ? '' : ` (gói ${GOI[minGoi(code)].ten})`}
            </option>
          )
        })}
      </Select>
      {/* Thanh công cụ của báo cáo (ngày, lọc, in, xuất) gắn vào đây, cùng hàng tên báo cáo (T55) */}
      <div className="bc-chon-phai" ref={datChoThanhCongCu} />
    </div>
  )
}
