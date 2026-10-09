// Trung tâm báo cáo: gom toàn bộ sổ sách, báo cáo của mọi phân hệ chia theo nhóm
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ModuleDef, ScreenDef, ScreenProps } from '../types'
import { MODULES, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { PageHead, Pk } from '../../ui/Page'
import { fold } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'

export function TrungTamBaoCao({ sc }: ScreenProps) {
  const { s } = useSession()
  const [q, setQ] = useState('')

  const phanHeBC = MODULES.find(m => m.key === 'bao-cao')
  const tatCaBC = phanHeBC?.screens.filter(x => x.goc) ?? []

  // Gom theo x.goc theo thứ tự phân hệ trong MODULES
  const nhomGoc: { mod: ModuleDef; screens: ScreenDef[] }[] = []
  for (const m of MODULES) {
    if (m.key === 'bao-cao') continue
    const scs = tatCaBC.filter(x => x.goc === m.key)
    if (scs.length > 0) {
      nhomGoc.push({ mod: m, screens: scs })
    }
  }

  // Số báo cáo hiện được ở rail (ẩn màn theo hienMan)
  const nhomRail = nhomGoc
    .map(g => ({
      mod: g.mod,
      hienCount: g.screens.filter(x => hienMan(x, s.goi)).length,
    }))
    .filter(g => g.hienCount > 0)

  const tongHienRail = nhomRail.reduce((acc, g) => acc + g.hienCount, 0)

  // Lọc theo sc.slug: 'tat-ca' là mọi nhóm; 'nhom-<key>' chỉ nhóm của phân hệ <key>
  const keyHienTai = sc.slug.startsWith('nhom-') ? sc.slug.slice(5) : null
  const nhomHienThi = keyHienTai
    ? nhomGoc.filter(g => g.mod.key === keyHienTai)
    : nhomGoc

  const modHienTai = keyHienTai ? nhomHienThi[0]?.mod : null
  const title = modHienTai ? `Báo cáo ${modHienTai.ten}` : 'Báo cáo'

  const manTrongNhom = nhomHienThi.flatMap(g => g.screens)
  const co = manTrongNhom.filter(x => moDuoc(x, s.goi)).length
  const meta = anNgoaiGoi(s.goi) ? undefined : (
    <span className="chip">Gói đang dùng mở {co}/{manTrongNhom.length} báo cáo</span>
  )

  // Tìm kiếm không dấu theo tên, mã, mẫu
  const match = (x: ScreenDef) =>
    !q || fold(`${tenMan(x)} ${x.code ?? ''} ${x.report?.mau ?? ''}`).includes(fold(q))

  const nhomKetQua = nhomHienThi
    .map(g => ({
      mod: g.mod,
      screens: g.screens.filter(x => hienMan(x, s.goi)).filter(match),
    }))
    .filter(g => g.screens.length > 0)

  return (
    <div className="page">
      <PageHead title={title} meta={meta}>
        <ThanhLoc tim={{ value: q, onChange: setQ, placeholder: 'Tìm báo cáo' }} />
      </PageHead>
      <div className="bc-tt">
        <nav className="bc-rail">
          <Link to="/app/bao-cao/tat-ca" className={sc.slug === 'tat-ca' ? 'on' : ''}>
            <Icon n="chart" />
            <span>Tất cả</span>
            <span className="bc-dem">{tongHienRail}</span>
          </Link>
          {nhomRail.map(g => (
            <Link
              key={g.mod.key}
              to={`/app/bao-cao/nhom-${g.mod.key}`}
              className={sc.slug === `nhom-${g.mod.key}` ? 'on' : ''}
            >
              <Icon n={g.mod.icon} />
              <span>{g.mod.ngan}</span>
              <span className="bc-dem">{g.hienCount}</span>
            </Link>
          ))}
        </nav>
        <div className="bc-ds">
          {nhomKetQua.length === 0 ? (
            <div className="card">
              <div className="empty"><b>Không có báo cáo khớp "{q}"</b></div>
            </div>
          ) : (
            nhomKetQua.map(g => (
              <div key={g.mod.key}>
                <div className="rpt-g">{g.mod.ten}</div>
                <div className="rpt-grid">
                  {g.screens.map(x => {
                    const ok = moDuoc(x, s.goi)
                    const ma = maKhoa(x)
                    const isBook = x.report?.kieu === 'so' || /^(Sổ|Thẻ)/i.test(tenMan(x))
                    return (
                      <Link
                        key={x.slug}
                        to={`/app/bao-cao/${x.slug}`}
                        className={`rpt-card${ok ? '' : ' lock'}`}
                      >
                        <span className="ri"><Icon n={isBook ? 'book' : 'chart'} /></span>
                        <span className="grow" style={{ minWidth: 0 }}>
                          <b>{tenMan(x)}</b>
                          <small>Mã {x.code}{x.report?.mau && s.cheDo === 'TT133' ? ` · Mẫu ${x.report.mau}` : ''}</small>
                        </span>
                        {!ok && ma ? <Pk g={minGoi(ma)} o /> : <Icon n="chevr" className="ic sm" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
