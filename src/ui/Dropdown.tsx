// Menu thả xuống dùng chung: bấm để mở, bấm ra ngoài hoặc Esc để đóng, mũi tên lên xuống để chọn.
// Khung menu gắn vào body, định vị theo nút bấm, sát đáy màn hình thì tự lật lên. Không bị thẻ có overflow cắt mất.
import {
  Children, Fragment, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type KeyboardEvent as KE, type ReactNode, type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { heSoZoom } from './zoom'

type Align = 'start' | 'end'

export function Popover({ anchor, open, onClose, align = 'start', className = '', width, keep, role = 'menu', children }: {
  anchor: RefObject<HTMLElement | null>; open: boolean; onClose: () => void; align?: Align; className?: string
  width?: number; keep?: boolean; role?: string; children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Đặt vị trí thẳng vào style trước khi trình duyệt vẽ: không nháy, và khung đã hiện nên đưa con trỏ vào được ngay
  useLayoutEffect(() => {
    if (!open) return
    const tinh = () => {
      const a = anchor.current?.getBoundingClientRect(), p = ref.current
      if (!a || !p) return
      const z = heSoZoom()
      const aLeft = a.left / z, aRight = a.right / z, aTop = a.top / z, aBottom = a.bottom / z, aWidth = a.width / z
      p.style.minWidth = `${Math.round(aWidth)}px`
      const h = p.offsetHeight, w = p.offsetWidth
      const winH = window.innerHeight / z, winW = window.innerWidth / z
      const duoi = winH - aBottom, tren = aTop
      const len = duoi < h + 14 && tren > duoi
      const left = Math.max(8, Math.min(align === 'end' ? aRight - w : aLeft, winW - w - 8))
      p.style.top = `${len ? Math.max(8, aTop - h - 6) : aBottom + 6}px`
      p.style.left = `${left}px`
      p.style.transformOrigin = len ? 'bottom center' : 'top center'
    }
    tinh()
    // mở bằng bàn phím hay chuột đều đưa con trỏ vào menu để mũi tên lên xuống dùng được ngay
    // menu có ô tìm (Select dài) thì con trỏ vào ô tìm để gõ được ngay
    const chon = ref.current?.querySelector<HTMLElement>('input') ?? ref.current?.querySelector<HTMLElement>('[data-mi].on') ?? ref.current
    chon?.focus({ preventScroll: true })
    window.addEventListener('resize', tinh)
    window.addEventListener('scroll', tinh, true)
    return () => { window.removeEventListener('resize', tinh); window.removeEventListener('scroll', tinh, true) }
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => {
      const t = e.target as Element
      if (ref.current?.contains(t) || anchor.current?.contains(t)) return
      // bấm vào chữ của label bọc nút: để label tự chuyển cú bấm sang nút, nút sẽ đóng menu
      if (anchor.current && t.closest?.('label')?.contains(anchor.current)) return
      // bấm trong menu con (vd ô chọn trong khung Bộ lọc) cũng gắn vào body: không tính là bấm ra ngoài
      if (t.closest?.('.pop')) return
      onClose()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // menu con đang giữ con trỏ thì để menu con tự đóng, khung ngoài giữ nguyên
      const dangO = document.activeElement
      if (dangO && !ref.current?.contains(dangO) && dangO.closest('.pop')) return
      e.stopPropagation()          // Esc chỉ đóng menu, không đóng luôn form toàn màn hình phía sau
      onClose()
      anchor.current?.focus()
    }
    document.addEventListener('mousedown', down, true)
    document.addEventListener('keydown', key, true)
    return () => { document.removeEventListener('mousedown', down, true); document.removeEventListener('keydown', key, true) }
  }, [open, onClose])

  const phim = (e: KE) => {
    const ds = [...(ref.current?.querySelectorAll<HTMLElement>('[data-mi]') ?? [])]
    if (!ds.length) return
    const i = ds.indexOf(document.activeElement as HTMLElement)
    const toi = (j: number) => { e.preventDefault(); ds[(j + ds.length) % ds.length].focus() }
    if (e.key === 'ArrowDown') toi(i + 1)
    else if (e.key === 'ArrowUp') toi(i < 0 ? -1 : i - 1)
    else if (e.key === 'Home') toi(0)
    else if (e.key === 'End') toi(-1)
    else if (e.key === 'Tab') { onClose(); anchor.current?.focus() }   // Tab đi tiếp từ nút mở menu, không rơi xuống cuối trang
  }

  if (!open && !keep) return null
  return createPortal(
    <div ref={ref} role={role} tabIndex={-1} className={`pop ${className}`} hidden={!open} onKeyDown={phim}
      style={width ? { width } : undefined}>
      {children}
    </div>,
    document.body,
  )
}

/** Nút có menu thả xuống. children nhận hàm đóng menu, dùng khi mục là nút bấm chứ không phải liên kết. */
export function Dropdown({ label, btnClass = '', title, align, popClass, width, keep, children }: {
  label: ReactNode; btnClass?: string; title?: string; align?: Align; popClass?: string; width?: number
  keep?: boolean                       // giữ khung menu trong DOM khi đóng (ẩn), để script kiểm đọc được liên kết bên trong
  children: ReactNode | ((dong: () => void) => ReactNode)
}) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const loc = useLocation()
  const dong = useCallback(() => setOpen(false), [])
  useEffect(() => setOpen(false), [loc.pathname, loc.search])
  return (
    <>
      <button ref={btn} type="button" className={`${btnClass}${open ? ' open' : ''}`} title={title}
        aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>{label}</button>
      <Popover anchor={btn} open={open} onClose={dong} align={align} className={popClass} width={width} keep={keep}>
        {typeof children === 'function' ? children(dong) : children}
      </Popover>
    </>
  )
}

/** Một dòng trong menu: biểu tượng (tên biểu tượng hoặc phần tử tự vẽ), tên, mô tả, phần bên phải, dấu chọn */
export function MenuItem({ to, onClick, icon, desc, right, on, lock, danger, children }: {
  to?: string; onClick?: () => void; icon?: string | ReactNode; desc?: ReactNode; right?: ReactNode
  on?: boolean; lock?: boolean; danger?: boolean; children: ReactNode
}) {
  const cls = `mi${on ? ' on' : ''}${lock ? ' lock' : ''}${danger ? ' danger' : ''}`
  const body = (
    <>
      {icon !== undefined && <span className="mi-ic">{typeof icon === 'string' ? <Icon n={icon} className="ic sm" /> : icon}</span>}
      <span className="mi-t"><b>{children}</b>{desc && <small>{desc}</small>}</span>
      {right}
      {on && <Icon n="check" className="ic sm mi-ok" />}
    </>
  )
  return to
    ? <Link data-mi to={to} className={cls} onClick={onClick}>{body}</Link>
    : <button data-mi type="button" className={cls} onClick={onClick}>{body}</button>
}

export const MenuHead = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="mh"><span className="grow">{children}</span>{right}</div>
)
export const MenuSep = () => <div className="ms" />

/** Thay cho thẻ select: giữ cách viết <option>, value, defaultValue, onChange(e.target.value).
 *  Danh sách dài thì truyền `ds` (mảng dữ liệu) thay cho <option> để khỏi dựng JSX mỗi lần vẽ; trên 8 lựa chọn có ô tìm (T81) */
export function Select({ value, defaultValue, onChange, children, ds, className = '', style, disabled, 'aria-label': ariaLabel }: {
  value?: string; defaultValue?: string; onChange?: (e: { target: { value: string } }) => void
  children?: ReactNode; ds?: { v: string; t: string }[]; className?: string; style?: CSSProperties; disabled?: boolean; 'aria-label'?: string
}) {
  const opts = ds ?? docOption(children)
  const [trong, setTrong] = useState(defaultValue ?? opts[0]?.v ?? '')
  const v = value ?? trong
  const cur = opts.find(o => o.v === v) ?? opts[0]
  const [open, setOpen] = useState(false)
  const [tim, setTim] = useState('')
  const btn = useRef<HTMLButtonElement>(null)
  const dong = useCallback(() => { setOpen(false); setTim('') }, [])
  const coTim = opts.length > 8
  const boDau = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
  const hien = open && coTim && tim ? opts.filter(o => boDau(o.t).includes(boDau(tim))) : opts
  const chon = (x: string) => {
    if (value === undefined) setTrong(x)
    onChange?.({ target: { value: x } })
    setOpen(false)
    setTim('')
    btn.current?.focus()
  }
  return (
    <>
      <button ref={btn} type="button" className={`sel ${className}${open ? ' open' : ''}`} style={style} aria-label={ariaLabel} disabled={disabled}
        title={opts.find(o => o.v === v)?.t}
        aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true) } }}>
        <span className="sel-v">{cur?.t}</span><Icon n="chevd" className="ic sm sel-c" />
      </button>
      <Popover anchor={btn} open={open} onClose={dong} role="listbox" className={`pop-sel${coTim ? ' co-tim' : ''}`}>
        {coTim && (
          <div className="pop-sel-tim">
            <Icon n="search" className="ic sm" />
            <input autoFocus value={tim} placeholder="Tìm…" aria-label="Tìm trong danh sách" onChange={e => setTim(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && hien[0]) { e.preventDefault(); chon(hien[0].v) } }} />
          </div>
        )}
        {coTim && hien.length === 0 && <div className="pop-sel-trong">Không có lựa chọn khớp</div>}
        {hien.map(o => (
          <button key={o.v} data-mi type="button" role="option" aria-selected={o.v === v} className={`mi${o.v === v ? ' on' : ''}`} onClick={() => chon(o.v)}>
            <span className="mi-t"><b>{o.t}</b></span>{o.v === v && <Icon n="check" className="ic sm mi-ok" />}
          </button>
        ))}
      </Popover>
    </>
  )
}

function docOption(children: ReactNode): { v: string; t: string }[] {
  const out: { v: string; t: string }[] = []
  Children.forEach(children, c => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode }>(c)) return
    if (c.type === Fragment) { out.push(...docOption(c.props.children)); return }
    if (c.type !== 'option') return
    const t = Children.toArray(c.props.children).join('')
    out.push({ v: c.props.value !== undefined ? String(c.props.value) : t, t })
  })
  return out
}
