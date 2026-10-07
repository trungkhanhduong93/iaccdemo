// Biểu đồ SVG tự vẽ, không thư viện
import { short } from './format'

/** Cột đứng, có thể chồng 2 lớp (vd doanh thu và giá vốn) */
export function Bars({ data, h = 220, colors = ['#1b6fe0', '#f5871f'], hi }: {
  data: { l: string; v: number; v2?: number }[]; h?: number; colors?: string[]; hi?: number
}) {
  const W = 760, pl = 46, pb = 24, pt = 10
  const max = Math.max(...data.map(d => d.v)) * 1.12 || 1
  const bw = (W - pl) / data.length
  const y = (v: number) => pt + (h - pt - pb) * (1 - v / max)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max)
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${h}`} width="100%" role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W} y1={y(t)} y2={y(t)} stroke="#edf1f6" />
          <text x={pl - 8} y={y(t) + 4} textAnchor="end">{short(t).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pl + i * bw + bw * 0.18, w = bw * 0.64
        return (
          <g key={i}>
            <rect x={x} y={y(d.v)} width={w} height={h - pb - y(d.v)} rx={3} fill={colors[0]} opacity={hi === undefined || hi === i ? 1 : 0.55}>
              <title>{d.l}: {d.v.toLocaleString('vi-VN')} đ</title>
            </rect>
            {d.v2 !== undefined && <rect x={x + w * 0.22} y={y(d.v2)} width={w * 0.56} height={h - pb - y(d.v2)} rx={2} fill={colors[1]} opacity={0.9} />}
            {(data.length <= 16 || i % 3 === 0) && <text x={x + w / 2} y={h - 7} textAnchor="middle">{d.l}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export function Donut({ parts, size = 150 }: { parts: { l: string; v: number; c: string }[]; size?: number }) {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1
  const r = size / 2 - 12, C = 2 * Math.PI * r
  let off = 0
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#edf1f6" strokeWidth={18} />
      {parts.map((p, i) => {
        const len = (p.v / tot) * C
        const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.c} strokeWidth={18}
          strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform={`rotate(-90 ${size / 2} ${size / 2})`}><title>{p.l}</title></circle>
        off += len
        return el
      })}
    </svg>
  )
}

export function Spark({ values, w = 120, h = 34, color = '#1b6fe0' }: { values: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...values), min = Math.min(...values)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(' ')
  return <svg className="spark" width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" /></svg>
}

export function HBars({ data, color = '#1b6fe0', fmt = short }: { data: { l: string; v: number }[]; color?: string; fmt?: (n: number) => string }) {
  const max = Math.max(...data.map(d => d.v)) || 1
  return (
    <div>
      {data.map((d, i) => (
        <div className="hbar" key={i}>
          <span>{d.l}</span>
          <div className="bar"><i style={{ width: `${(d.v / max) * 100}%`, background: color }} /></div>
          <b className="num" style={{ color: 'var(--ink)' }}>{fmt(d.v)}</b>
        </div>
      ))}
    </div>
  )
}
