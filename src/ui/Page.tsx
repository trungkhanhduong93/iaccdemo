// Tiêu đề màn hình, nhãn gói, thẻ — dùng chung mọi phân hệ
import type { ReactNode } from 'react'
import { FEATURE, GOI, GOIS, type Goi } from '../app/plan'
import { Icon } from './Icon'

export function Pk({ g, o }: { g: Goi; o?: boolean }) {
  return <span className={`pk ${GOI[g].cls}${o ? ' o' : ''}`}>{GOI[g].ten}</span>
}

/** Mã Excel, giai đoạn, các gói có tính năng, kế thừa IVT — để đối chiếu với file Dự kiến tính năng */
export function FeatureMeta({ code }: { code?: string }) {
  const f = code ? FEATURE[code] : undefined
  if (!f) return null
  return (
    <>
      <span className="chip" title="Mã STT trong file Dự kiến tính năng IACC Cloud">Mã {f.c}</span>
      <span className="chip">GĐ {f.gd}</span>
      {GOIS.filter(g => f.g.includes(g)).map(g => <Pk key={g} g={g} o />)}
      {f.ivt ? <span className="chip ivt">Kế thừa iPOS Inventory</span> : null}
    </>
  )
}

export function PageHead({ crumb, title, code, meta, children }: {
  crumb?: string[]; title: ReactNode; code?: string; meta?: ReactNode; children?: ReactNode
}) {
  return (
    <div className="ph">
      <div style={{ minWidth: 0 }}>
        {crumb && <div className="crumb">{crumb.map((c, i) => <span key={i} className="row" style={{ gap: 6 }}>{i > 0 && <Icon n="chevr" className="ic sm" />}{c}</span>)}</div>}
        <h1>{title}</h1>
        {(code || meta) && <div className="ph-meta"><FeatureMeta code={code} />{meta}</div>}
      </div>
      {children && <div className="ph-act">{children}</div>}
    </div>
  )
}

export function Card({ title, sub, act, children, pad = true, className = '' }: {
  title?: ReactNode; sub?: ReactNode; act?: ReactNode; children: ReactNode; pad?: boolean; className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {title && <div className="card-h"><h3>{title}</h3>{sub && <span className="sub">{sub}</span>}<span className="grow" />{act}</div>}
      {pad ? <div className="card-b">{children}</div> : children}
    </section>
  )
}

export function Kpi({ l, v, unit, d, icon }: { l: string; v: ReactNode; unit?: string; d?: ReactNode; icon?: string }) {
  return (
    <div className="card kpi">
      <div className="kpi-l">{icon && <Icon n={icon} className="ic sm" />}{l}</div>
      <div className="kpi-v">{v}{unit && <small>{unit}</small>}</div>
      {d && <div className="kpi-d">{d}</div>}
    </div>
  )
}

export function Note({ kind = '', icon = 'info', children }: { kind?: string; icon?: string; children: ReactNode }) {
  return <div className={`note ${kind}`}><Icon n={icon} className="ic sm" /><div>{children}</div></div>
}

export function Empty({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return <div className="empty"><b>{title}</b>{sub}{children && <div style={{ marginTop: 14 }}>{children}</div>}</div>
}
