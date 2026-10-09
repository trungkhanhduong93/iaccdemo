// Ctrl+K: tìm và mở nhanh bất kỳ màn nào trong 15 phân hệ, gõ không dấu vẫn ra
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, duongDan, hienMan, hienPhanHe, laBaoCao, maKhoa, moDuoc, tenMan } from './registry'
import { minGoi } from './plan'
import { fold } from '../ui/format'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { s } = useSession()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const all = useMemo(() => MODULES.flatMap(m =>
    m.screens
      .filter(sc => !(m.key !== 'bao-cao' && laBaoCao(sc)) && !sc.slug.startsWith('nhom-'))
      .map(sc => ({ m, sc, t: tenMan(sc), f: fold(tenMan(sc) + ' ' + m.ten + ' ' + (sc.code ?? '')) }))
  ), [])
  const list = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean)
    return all.filter(x => hienPhanHe(x.m, s.goi) && hienMan(x.sc, s.goi) && words.every(w => x.f.includes(w))).slice(0, 40)
  }, [q, all, s.goi])
  useEffect(() => setI(0), [q])

  const go = (n: number) => { const x = list[n]; if (!x) return; nav(duongDan(x.m, x.sc)); onClose() }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="palette" onMouseDown={e => e.stopPropagation()}>
        <div className="palette-in">
          <Icon n="search" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="vd: so quy, to khai, doi soat"
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(x + 1, list.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(x - 1, 0)) }
              if (e.key === 'Enter') go(i)
            }} />
          <span className="kbd">Esc</span>
        </div>
        <div className="palette-list">
          {list.length === 0 && <div className="empty"><b>Không có màn nào khớp "{q}"</b></div>}
          {list.map((x, n) => {
            const ok = moDuoc(x.sc, s.goi)
            const ma = maKhoa(x.sc)
            return (
              <button key={x.m.key + x.sc.slug} className={n === i ? 'on' : ''} onMouseEnter={() => setI(n)} onClick={() => go(n)}>
                <Icon n={x.sc.icon ?? x.m.icon} className="ic sm" />
                <span style={{ color: ok ? 'var(--ink)' : 'var(--faint)' }}>{x.t}</span>
                {!ok && ma && <Pk g={minGoi(ma)} o />}
                <small>{x.m.ten}{x.sc.code ? ` · ${x.sc.code}` : ''}</small>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
