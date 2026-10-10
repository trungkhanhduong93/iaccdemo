// Tiêu đề màn hình, nhãn gói, thẻ — dùng chung mọi phân hệ
import type { ReactNode } from 'react'
import { GOI, type Goi } from '../app/plan'
import { Icon } from './Icon'
import { GoiIconSvg } from './GoiLogo'

export function Pk({ g, o, logo }: { g: Goi; o?: boolean; logo?: boolean }) {
  return (
    <span className={`pk ${GOI[g].cls}${o ? ' o' : ''}${logo ? ' has-logo' : ''}`}>
      {logo && <GoiIconSvg g={g} size={13} />}
      {GOI[g].ten}
    </span>
  )
}

/** Tiêu đề màn. code giữ trong chữ ký cho các màn đang truyền, không còn hiện mã, giai đoạn, nhãn gói dưới tiêu đề (T39) */
export function PageHead({ crumb: _crumb, title, meta, children }: {
  crumb?: string[]; title: ReactNode; code?: string; meta?: ReactNode; children?: ReactNode
}) {
  return (
    <div className="ph">
      <div style={{ minWidth: 0 }}>
        {/* T42: Trum bỏ đường dẫn trên tiêu đề */}
        <h1>{title}</h1>
        {meta && <div className="ph-meta">{meta}</div>}
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
