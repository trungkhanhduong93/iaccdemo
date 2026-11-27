// Vành khuyên và icon thẻ số của dashboard nhà hàng gói Plus, Pro, web và điện thoại dùng chung (T956).
// Mẫu: docs/thiet-ke/T956-dashboard-plus-pro.html
import { useState, type CSSProperties } from 'react'
import { locSo, money } from '../../ui/format'
import type { PhanCoCau } from './soLieuDashboardNhaHang'

const so1 = (n: number) => n.toLocaleString(locSo(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const gon = (v: number) => Math.abs(v) >= 1e9
  ? (v / 1e9).toLocaleString(locSo(), { maximumFractionDigits: 2 }) + ' tỷ'
  : Math.abs(v) >= 1e6
    ? (v / 1e6).toLocaleString(locSo(), { maximumFractionDigits: 1 }) + ' tr'
    : money(v)

/** Vành khuyên + bảng: các dòng phần, dòng Tổng cộng; ngang = vành khuyên trái 140px, bảng phải */
export function VanhKhuyen({ phan, nhan, tenCot, ngang }: { phan: PhanCoCau[]; nhan: string; tenCot: string; ngang?: boolean }) {
  const [re, setRe] = useState<number | null>(null)
  const tong = phan.reduce((a, p) => a + p.v, 0)
  const coSo = phan.filter(p => p.v > 0).length
  const R = 72, C = 2 * Math.PI * R, GAP = 3
  let di = 0
  const cung = phan.map(p => {
    if (p.v <= 0 || tong <= 0) return null
    const dai = (p.v / tong) * C
    const off = -di
    di += dai
    const net = coSo === 1 ? C : Math.max(dai - GAP, 0.5)
    return { net, off }
  })
  const hien = re !== null ? phan[re] : null

  return (
    <div className={ngang ? 'vk-nh ngang' : 'vk-nh'} aria-label={nhan}>
      <div className={re !== null ? 'vk-nh-donut dim' : 'vk-nh-donut'}>
        <svg viewBox="0 0 184 184" role="img" aria-label={`${nhan} ${money(tong)} đồng`}>
          <circle cx={92} cy={92} r={R} fill="none" stroke="var(--dnh-track, #eef1f5)" strokeWidth={16} />
          {phan.map((p, i) => {
            const c = cung[i]
            if (!c) return null
            return (
              <circle key={p.ten}
                className={re === i ? 'cung on' : 'cung'}
                cx={92} cy={92} r={R} fill="none" stroke={p.mau} strokeWidth={16}
                strokeDasharray={`${c.net} ${C}`} strokeDashoffset={c.off}
                transform="rotate(-90 92 92)"
                onMouseEnter={() => setRe(i)} onMouseLeave={() => setRe(null)} />
            )
          })}
          <text className="c-l" x={92} y={76} textAnchor="middle">{hien ? hien.ten : nhan}</text>
          <text className="c-v" x={92} y={101} textAnchor="middle">{gon(hien ? hien.v : tong)}</text>
          <text className="c-d" x={92} y={120} textAnchor="middle" style={hien ? { fill: hien.mau } : undefined}>
            {hien ? (tong > 0 ? `${so1(hien.v / tong * 100)}%` : '0,0%') : '100%'}
          </text>
        </svg>
      </div>
      <div className="vk-nh-tbl">
        <table>
          <thead><tr><th>{tenCot || 'Khoản'}</th><th>Số tiền</th><th>Tỷ trọng</th></tr></thead>
          <tbody>
            {phan.map((p, i) => (
              <tr key={p.ten} className={re === i ? 'chon' : undefined}
                onMouseEnter={() => setRe(i)} onMouseLeave={() => setRe(null)}>
                <td>
                  <span className="dnh-dot" style={{ background: p.mau }} />
                  {p.ten}
                  {p.ghi && <small className="dnh-ghi-nho"> {p.ghi}</small>}
                </td>
                <td>{money(p.v)}</td>
                <td>{tong > 0 ? `${so1(p.v / tong * 100)}%` : '0,0%'}</td>
              </tr>
            ))}
            <tr className="tong"><td>Tổng cộng</td><td>{money(tong)}</td><td>100%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MAU_KPI: Record<'dt' | 'nvl' | 'hd' | 'ln', string> = {
  dt: 'var(--dnh-dt, #2f80ed)',
  nvl: 'var(--dnh-cp, #f5a03a)',
  hd: 'var(--dnh-cp, #f5a03a)',
  ln: 'var(--dnh-ln, #1f9d6b)',
}

/** Icon 2 tông trong ô màu của thẻ số */
export function IconKpi({ loai }: { loai: 'dt' | 'nvl' | 'hd' | 'ln' }) {
  return (
    <span className={`kpi-ic-nh ${loai}`} style={{ '--k': MAU_KPI[loai] } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {loai === 'dt' && <>
          <rect x="3" y="13" width="4.6" height="8" rx="1.2" fill="#fff" opacity=".6" />
          <rect x="9.7" y="9" width="4.6" height="12" rx="1.2" fill="#fff" opacity=".8" />
          <rect x="16.4" y="4.5" width="4.6" height="16.5" rx="1.2" fill="#fff" />
        </>}
        {loai === 'nvl' && <>
          <rect x="2.5" y="12.5" width="9" height="8.5" rx="1.3" fill="#fff" />
          <rect x="12.5" y="12.5" width="9" height="8.5" rx="1.3" fill="#fff" />
          <rect x="7.5" y="3" width="9" height="8.5" rx="1.3" fill="#fff" />
          <path d="M5.6 12.5v3h2.8v-3M15.6 12.5v3h2.8v-3M10.6 3v3h2.8V3" fill="none" stroke="var(--k)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>}
        {loai === 'hd' && <>
          <path d="M5 3h14v18l-2.3-1.6L14.3 21 12 19.4 9.7 21l-2.4-1.6L5 21z" fill="#fff" />
          <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" fill="none" stroke="var(--k)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>}
        {loai === 'ln' && <>
          <circle cx="12" cy="12" r="9.5" fill="#fff" />
          <path d="M12 6v12M15.2 8.6c-.6-.8-1.7-1.3-3.1-1.3-1.8 0-3 .9-3 2.3s1.2 1.9 3 2.4 3 1 3 2.4-1.2 2.3-3 2.3c-1.4 0-2.6-.5-3.2-1.4" fill="none" stroke="var(--k)" strokeWidth="2" strokeLinecap="round" />
        </>}
      </svg>
    </span>
  )
}
