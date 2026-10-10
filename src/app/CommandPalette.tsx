// Ctrl+K: tìm và mở nhanh bất kỳ màn nào trong 15 phân hệ, gõ không dấu vẫn ra.
// Chưa gõ: mục Vừa mở (lịch sử ở localStorage) và Gợi ý theo gói; gõ: một mục Kết quả (T80)
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, duongDan, hienMan, hienPhanHe, laBaoCao, maKhoa, moDuoc, tenMan } from './registry'
import { minGoi } from './plan'
import { fold } from '../ui/format'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'
import type { ModuleDef, ScreenDef } from '../modules/types'

const KHOA = 'cmdk-gan-day'

/** Màn gợi ý: Trang chủ, chứng từ Thu chi, Mua hàng, Tất cả báo cáo, Danh mục hàng hoá. Mỗi ô lấy màn đầu tiên mở được */
const GOI_Y = [['/app/trang-chu/tong-quan', '/app/trang-chu/ban-lam-viec'], ['/app/tien/2-1-1'], ['/app/mua-hang/4-1-1'], ['/app/bao-cao/tat-ca'], ['/app/danh-muc/1-2']]

function docGanDay(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KHOA) ?? '[]')
    return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []
  } catch { return [] }
}

/** Ghi màn vừa mở lên đầu lịch sử, giữ 10 màn. Gọi mỗi lần đổi đường dẫn (Shell) */
export function ghiGanDay(pathname: string) {
  const p = pathname.split('/').slice(0, 4).join('/')
  if (!/^\/app\/[^/]+\/[^/]+$/.test(p)) return
  try { localStorage.setItem(KHOA, JSON.stringify([p, ...docGanDay().filter(x => x !== p)].slice(0, 10))) } catch { /* trình duyệt chặn lưu thì thôi */ }
}

/** Tên gọi quen của người dùng cho màn có tên khác, gõ tên quen vẫn ra màn */
const TEN_QUEN: Record<string, string> = {
  '2.1.1': 'phiếu thu phiếu chi uỷ nhiệm chi báo có chuyển quỹ',
  '3.1.7': 'phiếu xuất bán hàng',
  '4.1.1': 'nhập mua hàng phiếu nhập mua',
  '4.1.4': 'xuất trả hàng mua',
  '5.1.4': 'chuyển kho',
}

interface Muc { m: ModuleDef; sc: ScreenDef; goc: ModuleDef; t: string; tf: string; q: string; f: string; p: string }

// Báo cáo nằm trong phân hệ Báo cáo, dòng phụ ghi phân hệ gốc: "Báo cáo · Kho"
const GOC = new Map(MODULES.filter(m => m.key !== 'bao-cao').flatMap(m => m.screens.filter(laBaoCao).map(sc => [sc.slug, m] as const)))

const TAT_CA: Muc[] = MODULES.flatMap(m =>
  m.screens
    .filter(sc => !(m.key !== 'bao-cao' && laBaoCao(sc)) && !sc.slug.startsWith('nhom-'))
    .map(sc => {
      const goc = (m.key === 'bao-cao' && GOC.get(sc.slug)) || m
      const t = (laBaoCao(sc) && sc.code ? sc.code + ' - ' : '') + tenMan(sc)
      // gấp từng chữ để vị trí trong chuỗi gấp trùng vị trí trong tên, tô đậm được phần khớp
      const tf = Array.from(t, c => fold(c)[0] ?? c).join('')
      const q = fold(TEN_QUEN[sc.code ?? ''] ?? '')
      return { m, sc, goc, t, tf, q, f: tf + ' ' + q + ' ' + fold(m.ten + ' ' + goc.ten + ' ' + (sc.code ?? '')), p: duongDan(m, sc) }
    })
)

/** Tên màn, tô đậm phần khớp với từ đang gõ */
function Ten({ x, words }: { x: Muc; words: string[] }) {
  if (!words.length) return <>{x.t}</>
  const dam = new Array<boolean>(x.t.length).fill(false)
  for (const w of words) {
    const i = x.tf.indexOf(w)
    if (i >= 0) dam.fill(true, i, i + w.length)
  }
  const doan: [string, boolean][] = []
  Array.from(x.t).forEach((c, i) => {
    const cuoi = doan[doan.length - 1]
    if (cuoi && cuoi[1] === dam[i]) cuoi[0] += c
    else doan.push([c, dam[i]])
  })
  return <>{doan.map(([s, b], i) => b ? <mark key={i}>{s}</mark> : <Fragment key={i}>{s}</Fragment>)}</>
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { s } = useSession()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const thanRef = useRef<HTMLDivElement>(null)

  const words = useMemo(() => fold(q).split(/\s+/).filter(Boolean), [q])
  const muc = useMemo(() => {
    const thay = TAT_CA.filter(x => hienPhanHe(x.m, s.goi) && hienMan(x.sc, s.goi))
    if (words.length) {
      // xếp: mã hoặc tên bắt đầu bằng chữ gõ, rồi cụm chữ nằm trong tên, rồi đủ từ trong tên, cuối cùng chỉ khớp tên phân hệ
      const cum = words.join(' ')
      const hang = (x: Muc) => x.sc.code === cum || [x.tf, x.q].some(t => t.startsWith(cum)) ? 0
        : [x.tf, x.q].some(t => t.includes(' ' + cum)) ? 1 : words.every(w => x.tf.includes(w) || x.q.includes(w)) ? 2 : 3
      const kq = thay.filter(x => words.every(w => x.f.includes(w))).map(x => [hang(x), x] as const)
      return [{ ten: 'Kết quả', ds: kq.sort((a, b) => a[0] - b[0]).map(([, x]) => x).slice(0, 40) }]
    }
    const theoDuong = new Map(thay.map(x => [x.p, x]))
    const vuaMo = docGanDay().map(p => theoDuong.get(p)).filter((x): x is Muc => !!x).slice(0, 5)
    const daCo = new Set(vuaMo.map(x => x.p))
    const goiY = GOI_Y.map(o => o.map(p => theoDuong.get(p)).find(x => x && moDuoc(x.sc, s.goi))).filter((x): x is Muc => !!x && !daCo.has(x.p))
    return [{ ten: 'Vừa mở', ds: vuaMo }, { ten: 'Gợi ý', ds: goiY }].filter(g => g.ds.length)
  }, [words, s.goi])
  const list = useMemo(() => muc.flatMap(g => g.ds), [muc])
  useEffect(() => setI(0), [q])
  useEffect(() => { thanRef.current?.querySelector('.cmdk-dong.on')?.scrollIntoView({ block: 'nearest' }) }, [i])

  const go = (n: number) => { const x = list[n]; if (!x) return; nav(x.p); onClose() }

  let n = -1
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="cmdk" role="dialog" aria-label="Tìm màn hình" onMouseDown={e => e.stopPropagation()}>
        <div className="cmdk-dau">
          <Icon n="search" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Nhập tên màn hình cần mở, ví dụ: nhập mua hàng"
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(x + 1, list.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(x - 1, 0)) }
              if (e.key === 'Enter') go(i)
            }} />
          <button type="button" className="cmdk-dong-x" onClick={onClose} title="Đóng (Esc)" aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="cmdk-than" ref={thanRef}>
          {list.length === 0 && <div className="cmdk-trong">{q ? `Không có màn nào khớp "${q}"` : 'Gõ tên màn hình để tìm'}</div>}
          {muc.map(g => (
            <Fragment key={g.ten}>
              <div className="cmdk-muc">{g.ten}</div>
              {g.ds.map(x => {
                const k = ++n
                const ok = moDuoc(x.sc, s.goi)
                const ma = maKhoa(x.sc)
                return (
                  <button key={x.p} type="button" className={`cmdk-dong${k === i ? ' on' : ''}${ok ? '' : ' khoa'}`} onMouseMove={() => k !== i && setI(k)} onClick={() => go(k)}>
                    <span className="cmdk-ic"><Icon n={x.sc.icon ?? x.goc.icon} className="ic sm" /></span>
                    <span className="cmdk-chu">
                      <b><Ten x={x} words={words} /></b>
                      <small>{x.m === x.goc ? x.m.ngan : `${x.m.ngan} · ${x.goc.ngan}`}{x.sc.nhom && x.m === x.goc && x.sc.nhom !== x.m.ngan ? ` · ${x.sc.nhom}` : ''}</small>
                    </span>
                    {!ok && ma && <Pk g={minGoi(ma)} o />}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
        <div className="cmdk-day">
          <span><span className="kbd">↑</span><span className="kbd">↓</span> di chuyển</span>
          <span><span className="kbd">Enter</span> để mở màn hình</span>
          <span><span className="kbd">Esc</span> đóng</span>
        </div>
      </div>
    </div>
  )
}
