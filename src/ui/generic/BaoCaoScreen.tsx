// Tab Báo cáo của phân hệ: đủ sổ sách, báo cáo, chia theo nhóm Excel. Giống mục "Tất cả báo cáo" của AMIS.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { duongDan, hienMan, laBaoCao, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Icon } from '../Icon'
import { PageHead, Pk } from '../Page'
import { fold } from '../format'
import { ThanhLoc } from '../ThanhLoc'

export function BaoCaoScreen({ mod }: ScreenProps) {
  const { s } = useSession()
  const [q, setQ] = useState('')
  const ds = mod.screens.filter(laBaoCao).filter(sc => hienMan(sc, s.goi)).filter(sc => !q || fold(`${tenMan(sc)} ${sc.code ?? ''} ${sc.report?.mau ?? ''}`).includes(fold(q)))
  const nhom: [string, typeof ds][] = []
  for (const sc of ds) {
    const n = sc.nhom ?? ''
    const g = nhom.find(x => x[0] === n)
    if (g) g[1].push(sc); else nhom.push([n, [sc]])
  }
  const co = mod.screens.filter(laBaoCao).filter(sc => moDuoc(sc, s.goi)).length

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, 'Báo cáo']} title="Tất cả báo cáo" meta={anNgoaiGoi(s.goi) ? undefined : <span className="chip">Gói đang dùng mở {co}/{mod.screens.filter(laBaoCao).length} báo cáo</span>}>
        <ThanhLoc tim={{ value: q, onChange: setQ, placeholder: 'Tìm báo cáo' }} />
      </PageHead>
      {nhom.length === 0 && <div className="card"><div className="empty"><b>Không có báo cáo khớp "{q}"</b></div></div>}
      {nhom.map(([n, scs]) => (
        <div key={n}>
          <div className="rpt-g">{n}</div>
          <div className="rpt-grid">
            {scs.map(sc => {
              const ok = moDuoc(sc, s.goi)
              const ma = maKhoa(sc)
              return (
                <Link key={sc.slug} to={duongDan(mod, sc)} className={`rpt-card ${ok ? '' : 'lock'}`}>
                  <span className="ri"><Icon n={sc.report?.kieu === 'so' ? 'book' : 'chart'} /></span>
                  <span className="grow" style={{ minWidth: 0 }}>
                    <b>{tenMan(sc)}</b>
                    <small>Mã {sc.code}{sc.report?.mau && s.goi === 'PL' ? ` · Mẫu ${sc.report.mau}` : ''}</small>
                  </span>
                  {!ok && ma ? <Pk g={minGoi(ma)} o /> : <Icon n="chevr" className="ic sm" />}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
