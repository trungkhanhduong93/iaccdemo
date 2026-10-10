// Biểu đồ SVG tự vẽ, không thư viện
import { short } from './format'

/** Cột đứng, có thể chồng 2 lớp (vd doanh thu và giá vốn) */
export function Bars({ data, h = 220, colors = ['#1b6fe0', '#f28020'], hi }: {
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

/** Thác nước lợi nhuận: Doanh thu thuần → giá vốn → chi phí bán hàng → chi phí quản lý → tài chính, khác → Lợi nhuận trước thuế */
export function WaterfallChart({ data, h = 240 }: {
  data: { l: string; v: number; isTotal?: boolean; c?: string }[]
  h?: number
}) {
  const W = 680, pl = 54, pb = 32, pt = 18, pr = 16
  let run = 0
  const steps = data.map(d => {
    if (d.isTotal) {
      const top = Math.max(0, d.v)
      const bot = Math.min(0, d.v)
      run = d.v
      return { ...d, start: bot, end: top, val: d.v, isTotal: true }
    } else {
      const start = run
      const end = run + d.v
      run = end
      return { ...d, start: Math.min(start, end), end: Math.max(start, end), val: d.v, isTotal: false }
    }
  })

  const allVals = [0, ...steps.flatMap(s => [s.start, s.end])]
  const max = Math.max(...allVals) * 1.08 || 1
  const min = Math.min(0, ...allVals)
  const range = max - min || 1
  const bw = (W - pl - pr) / (data.length || 1)
  const y = (v: number) => pt + (h - pt - pb) * (1 - (v - min) / range)
  const ticks = [min, min + range * 0.33, min + range * 0.66, max]

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${h}`} width="100%" role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#edf1f6" />
          <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
            {short(t).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
          </text>
        </g>
      ))}
      <line x1={pl} x2={W - pr} y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeWidth={1} />
      {steps.map((s, i) => {
        const x = pl + i * bw + bw * 0.14
        const w = bw * 0.72
        const yTop = y(s.end)
        const yBot = y(s.start)
        const barH = Math.max(2, yBot - yTop)
        const fill = s.c ?? (s.isTotal ? '#0560a6' : s.val >= 0 ? '#138a52' : '#c2362b')
        const next = steps[i + 1]
        const connY = y(s.isTotal ? s.val : (s.val >= 0 ? s.end : s.start))

        return (
          <g key={i}>
            <rect x={x} y={yTop} width={w} height={barH} rx={3} fill={fill}>
              <title>{s.l}: {s.val >= 0 && !s.isTotal ? '+' : ''}{s.val.toLocaleString('vi-VN')} đ</title>
            </rect>
            <text x={x + w / 2} y={yTop - 5} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="var(--ink)">
              {short(Math.abs(s.val)).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
            </text>
            <text x={x + w / 2} y={h - 10} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {s.l}
            </text>
            {next && !next.isTotal && (
              <line
                x1={x + w}
                x2={pl + (i + 1) * bw + bw * 0.14}
                y1={connY}
                y2={connY}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Xu hướng theo tháng: cột doanh thu, đường lợi nhuận trước thuế, đường biên lãi % */
export function TrendChart({ data, h = 240 }: {
  data: { l: string; dt: number; ln: number; bien: number }[]
  h?: number
}) {
  const W = 680, pl = 54, pr = 44, pb = 32, pt = 22
  const maxDt = Math.max(...data.map(d => d.dt)) * 1.15 || 1
  const maxPct = 35
  const bw = (W - pl - pr) / (data.length || 1)

  const yLeft = (v: number) => pt + (h - pt - pb) * (1 - v / maxDt)
  const yRight = (p: number) => pt + (h - pt - pb) * (1 - p / maxPct)

  const ticksLeft = [0, 0.33, 0.66, 1].map(f => f * maxDt)
  const ticksRight = [0, 10, 20, 30]

  const ptsLn = data.map((d, i) => {
    const cx = pl + i * bw + bw * 0.5
    const cy = yLeft(d.ln)
    return `${cx},${cy}`
  }).join(' ')

  const ptsBien = data.map((d, i) => {
    const cx = pl + i * bw + bw * 0.5
    const cy = yRight(Math.max(0, d.bien))
    return `${cx},${cy}`
  }).join(' ')

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${h}`} width="100%" role="img">
      {ticksLeft.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={yLeft(t)} y2={yLeft(t)} stroke="#edf1f6" />
          <text x={pl - 8} y={yLeft(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
            {short(t).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
          </text>
        </g>
      ))}
      {ticksRight.map((p, i) => (
        <text key={i} x={W - pr + 8} y={yRight(p) + 4} textAnchor="start" fontSize={10.5} fill="#f28020">
          {p}%
        </text>
      ))}
      {data.map((d, i) => {
        const x = pl + i * bw + bw * 0.22
        const w = bw * 0.56
        const yb = yLeft(d.dt)
        const isT10 = d.l.includes('T10')
        return (
          <g key={i}>
            <rect
              x={x}
              y={yb}
              width={w}
              height={h - pb - yb}
              rx={3}
              fill="#0560a6"
              opacity={isT10 ? 0.45 : 0.88}
              stroke={isT10 ? '#0560a6' : 'none'}
              strokeWidth={isT10 ? 1.5 : 0}
              strokeDasharray={isT10 ? '3 2' : undefined}
            >
              <title>{d.l}: Doanh thu {d.dt.toLocaleString('vi-VN')} đ{isT10 ? ' — Tháng 10 mới có dữ liệu đến 07/10' : ''}</title>
            </rect>
            <text x={x + w / 2} y={yb - 5} textAnchor="middle" fontSize={10.5} fill="#0560a6" fontWeight={600}>
              {short(d.dt).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
            </text>
            <text x={x + w / 2} y={h - 10} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {d.l}
            </text>
          </g>
        )
      })}
      <polyline points={ptsLn} fill="none" stroke="#138a52" strokeWidth={2.4} strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = pl + i * bw + bw * 0.5
        const cy = yLeft(d.ln)
        const isT10 = d.l.includes('T10')
        return (
          <circle key={i} cx={cx} cy={cy} r={4} fill="#138a52" stroke="#fff" strokeWidth={1.5}>
            <title>{d.l}: LNTT {d.ln.toLocaleString('vi-VN')} đ{isT10 ? ' — Tháng 10 mới có dữ liệu đến 07/10' : ''}</title>
          </circle>
        )
      })}
      <polyline points={ptsBien} fill="none" stroke="#f28020" strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = pl + i * bw + bw * 0.5
        const cy = yRight(Math.max(0, d.bien))
        const isT10 = d.l.includes('T10')
        return (
          <circle key={i} cx={cx} cy={cy} r={3.5} fill="#f28020" stroke="#fff" strokeWidth={1.5}>
            <title>{d.l}: Biên lãi {d.bien.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%{isT10 ? ' — Tháng 10 mới có dữ liệu đến 07/10' : ''}</title>
          </circle>
        )
      })}
    </svg>
  )
}

/** Dòng tiền kỳ: tiền đầu kỳ, thu, chi, tiền cuối kỳ */
export function CashFlowChart({
  dau, thu, chi, cuoi, h = 230
}: {
  dau: number; thu: number; chi: number; cuoi: number; h?: number
}) {
  const W = 620, pl = 54, pr = 20, pb = 32, pt = 20
  const max = Math.max(dau, dau + thu, cuoi) * 1.12 || 1
  const bw = (W - pl - pr) / 4
  const y = (v: number) => pt + (h - pt - pb) * (1 - v / max)
  const ticks = [0, 0.33 * max, 0.66 * max, max]

  const bars = [
    { l: 'Đầu kỳ', val: dau, start: 0, end: dau, c: '#0b2c6b' },
    { l: 'Tổng thu', val: thu, start: dau, end: dau + thu, c: '#138a52' },
    { l: 'Tổng chi', val: -chi, start: dau + thu - chi, end: dau + thu, c: '#c2362b' },
    { l: 'Cuối kỳ', val: cuoi, start: 0, end: cuoi, c: '#0560a6' },
  ]

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${h}`} width="100%" role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#edf1f6" />
          <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
            {short(t).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
          </text>
        </g>
      ))}
      {bars.map((b, i) => {
        const x = pl + i * bw + bw * 0.16
        const w = bw * 0.68
        const yTop = y(b.end)
        const yBot = y(b.start)
        const barH = Math.max(2, yBot - yTop)
        return (
          <g key={i}>
            <rect x={x} y={yTop} width={w} height={barH} rx={3} fill={b.c}>
              <title>{b.l}: {b.val >= 0 ? '+' : ''}{b.val.toLocaleString('vi-VN')} đ</title>
            </rect>
            <text x={x + w / 2} y={yTop - 5} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ink)">
              {short(Math.abs(b.val)).replace(' tr', 'tr').replace(' tỷ', 'tỷ')}
            </text>
            <text x={x + w / 2} y={h - 10} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {b.l}
            </text>
            {i === 0 && (
              <line x1={x + w} x2={pl + bw + bw * 0.16} y1={y(dau)} y2={y(dau)} stroke="#94a3b8" strokeDasharray="2 2" />
            )}
            {i === 1 && (
              <line x1={x + w} x2={pl + 2 * bw + bw * 0.16} y1={y(dau + thu)} y2={y(dau + thu)} stroke="#94a3b8" strokeDasharray="2 2" />
            )}
            {i === 2 && (
              <line x1={x + w} x2={pl + 3 * bw + bw * 0.16} y1={y(cuoi)} y2={y(cuoi)} stroke="#94a3b8" strokeDasharray="2 2" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** So sánh chi nhánh: Doanh thu và Biên lãi gộp */
export function BranchBarChart({
  data
}: {
  data: { id: string; ten: string; dt: number; gv: number; lnGop: number; bienGop: number }[]
}) {
  const maxDt = Math.max(...data.map(d => d.dt)) || 1
  return (
    <div className="branch-bars">
      {data.map(d => (
        <div key={d.id} className="branch-bar-item" style={{ marginBottom: 12 }}>
          <div className="row" style={{ marginBottom: 4, fontSize: 13 }}>
            <b style={{ color: 'var(--ink)' }}>{d.ten}</b>
            <span className="grow" />
            <span className="chip" style={{ background: 'var(--green-t)', color: 'var(--green)', fontWeight: 600, fontSize: 11.5 }}>
              Biên gộp {(d.bienGop * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
            </span>
            <b className="num" style={{ color: 'var(--ink)', marginLeft: 8 }}>
              {short(d.dt)}
            </b>
          </div>
          <div className="bar" style={{ height: 10, borderRadius: 5, background: 'var(--line-2)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(d.dt / maxDt) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0560a6, #1b6fe0)',
                borderRadius: 5,
              }}
            />
          </div>
          <div className="row muted" style={{ fontSize: 11.5, marginTop: 3 }}>
            <span>Lãi gộp: {short(d.lnGop)}</span>
            <span className="grow" />
            <span>Giá vốn: {short(d.gv)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Cơ cấu chi phí hoạt động: thanh ngang 100% kèm danh sách tỷ lệ */
export function CostStructureChart({
  parts
}: {
  parts: { l: string; v: number; c: string }[]
}) {
  const total = parts.reduce((s, p) => s + p.v, 0) || 1
  return (
    <div>
      <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', background: '#edf1f6', marginBottom: 14 }}>
        {parts.map((p, i) => {
          const w = (p.v / total) * 100
          if (w < 0.5) return null
          return (
            <div
              key={i}
              style={{ width: `${w}%`, background: p.c, transition: 'width 0.3s' }}
              title={`${p.l}: ${p.v.toLocaleString('vi-VN')} đ (${w.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', fontSize: 12.5 }}>
        {parts.map((p, i) => {
          const w = (p.v / total) * 100
          return (
            <div key={i} className="row" style={{ gap: 6 }}>
              <i style={{ width: 10, height: 10, borderRadius: 3, background: p.c, flex: 'none' }} />
              <span className="muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.l}</span>
              <span className="grow" />
              <b style={{ color: 'var(--ink)' }}>{w.toFixed(0)}%</b>
              <span className="num muted" style={{ fontSize: 11.5 }}>({short(p.v)})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

