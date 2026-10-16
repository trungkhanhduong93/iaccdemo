import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from './session'
import { MODULES, tenPhanHe } from './registry'
import { minGoi } from './plan'
import { fold } from '../ui/format'
import { Icon, ONen } from '../ui/Icon'
import { Pk } from '../ui/Page'
import {
  TOI_DA_THAO_TAC,
  useThaoTacNhanh,
  type ThaoTacMuc,
} from './thaoTacNhanh'

/** Tên thao tác, tô đậm phần khớp với từ đang gõ */
function Ten({ x, words }: { x: ThaoTacMuc; words: string[] }) {
  if (!words.length) return <>{x.ten}</>
  const tf = Array.from(x.ten, c => fold(c)[0] ?? c).join('')
  const dam = new Array<boolean>(x.ten.length).fill(false)
  for (const w of words) {
    const idx = tf.indexOf(w)
    if (idx >= 0) dam.fill(true, idx, idx + w.length)
  }
  const doan: [string, boolean][] = []
  Array.from(x.ten).forEach((c, idx) => {
    const cuoi = doan[doan.length - 1]
    if (cuoi && cuoi[1] === dam[idx]) cuoi[0] += c
    else doan.push([c, dam[idx]])
  })
  return (
    <>
      {doan.map(([str, b], idx) =>
        b ? <mark key={idx}>{str}</mark> : <Fragment key={idx}>{str}</Fragment>
      )}
    </>
  )
}

export function TuyChinhThaoTac({ onClose }: { onClose: () => void }) {
  const { s, toast } = useSession()
  const { tatCa, ids, luu, macDinhIds } = useThaoTacNhanh(s)
  const [chonIds, setChonIds] = useState<string[]>(() => [...ids])
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const thanRef = useRef<HTMLDivElement>(null)

  // Kéo thả đổi thứ tự
  const [keoId, setKeoId] = useState<string | null>(null)
  const [dichId, setDichId] = useState<string | null>(null)

  // Đóng khi bấm Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const mapTatCa = useMemo(() => new Map(tatCa.map(m => [m.id, m])), [tatCa])
  const chonItems = useMemo(
    () => chonIds.map(id => mapTatCa.get(id)).filter((x): x is ThaoTacMuc => Boolean(x)),
    [chonIds, mapTatCa]
  )

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setKeoId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (keoId && keoId !== id) {
      e.preventDefault()
      setDichId(id)
    }
  }

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (keoId && keoId !== id) {
      const moi = chonIds.filter(x => x !== keoId)
      const idx = moi.indexOf(id)
      moi.splice(chonIds.indexOf(keoId) < chonIds.indexOf(id) ? idx + 1 : idx, 0, keoId)
      setChonIds(moi)
    }
    setKeoId(null)
    setDichId(null)
  }

  const handleDragEnd = () => {
    setKeoId(null)
    setDichId(null)
  }

  const boChon = (id: string) => {
    setChonIds(prev => prev.filter(x => x !== id))
  }

  const toggle = (id: string) => {
    setChonIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= TOI_DA_THAO_TAC) {
        toast('Tối đa 8 thao tác')
        return prev
      }
      return [...prev, id]
    })
  }

  const words = useMemo(() => fold(q).split(/\s+/).filter(Boolean), [q])
  const muc = useMemo(() => {
    if (words.length) {
      const cum = words.join(' ')
      const hang = (x: ThaoTacMuc) => {
        const tf = fold(x.ten)
        return tf.startsWith(cum) ? 0 : tf.includes(' ' + cum) ? 1 : 2
      }
      const kq = tatCa
        .filter(x => {
          const tf = fold(x.ten) + ' ' + fold(x.tenMod ?? '')
          return words.every(w => tf.includes(w))
        })
        .map(x => [hang(x), x] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, x]) => x)
      return [{ ten: 'Kết quả', ds: kq }]
    }

    // Gom theo phân hệ như Ctrl K
    const theoMod = new Map<string, ThaoTacMuc[]>()
    for (const item of tatCa) {
      const k = item.modKey
      const list = theoMod.get(k) ?? []
      list.push(item)
      theoMod.set(k, list)
    }

    const res: { ten: string; ds: ThaoTacMuc[] }[] = []
    for (const m of MODULES) {
      const ds = theoMod.get(m.key)
      if (ds && ds.length > 0) {
        res.push({
          ten: tenPhanHe(m, s.goi).ten,
          ds,
        })
      }
    }
    return res
  }, [tatCa, words, s.goi])

  const list = useMemo(() => muc.flatMap(g => g.ds), [muc])

  useEffect(() => setI(0), [q])
  useEffect(() => {
    thanRef.current?.querySelector('.cmdk-dong.on')?.scrollIntoView({ block: 'nearest' })
  }, [i])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setI(x => Math.min(x + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setI(x => Math.max(x - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const x = list[i]
      if (x && !x.khoa) toggle(x.id)
    }
  }

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'INPUT') {
      e.preventDefault()
      const x = list[i]
      if (x && !x.khoa) toggle(x.id)
    }
  }

  const handleKhoiPhuc = () => {
    setChonIds([...macDinhIds])
    toast('Đã khôi phục thao tác mặc định')
  }

  const handleLuu = () => {
    luu(chonIds)
    toast('Đã lưu thao tác nhanh')
    onClose()
  }

  let n = -1

  return (
    <div className="overlay ttn-modal-overlay" onMouseDown={onClose}>
      <div
        className="cmdk ttn-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Tuỳ chỉnh thao tác nhanh"
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="cmdk-dau">
          <Icon n="search" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm thao tác hoặc màn hình..."
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="cmdk-dong-x"
            onClick={onClose}
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <Icon n="x" className="ic sm" />
          </button>
        </div>

        {/* Hàng đã chọn */}
        <div className="ttn-modal-da-chon">
          <div className="ttn-modal-da-chon-tieu">
            <span>Đã chọn ({chonIds.length}/{TOI_DA_THAO_TAC})</span>
            {chonIds.length >= TOI_DA_THAO_TAC && (
              <span className="ttn-nhac-toida">Tối đa {TOI_DA_THAO_TAC} thao tác</span>
            )}
          </div>
          <div className="ttn-modal-chips">
            {chonItems.map(item => (
              <div
                key={item.id}
                className={`ttn-chip${keoId === item.id ? ' dang-keo' : ''}${dichId === item.id ? ' dich' : ''}`}
                draggable
                onDragStart={e => handleDragStart(e, item.id)}
                onDragOver={e => handleDragOver(e, item.id)}
                onDrop={e => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                title="Kéo thả để đổi thứ tự"
              >
                <Icon n={item.icon} className="ic sm" />
                <span className="ttn-chip-ten">{item.ten}</span>
                <button
                  type="button"
                  className="ttn-chip-x"
                  onClick={() => boChon(item.id)}
                  title={`Bỏ ${item.ten}`}
                  aria-label={`Bỏ ${item.ten}`}
                >
                  <Icon n="x" className="ic sm" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách ứng viên gom phân hệ */}
        <div className="cmdk-than ttn-modal-than" ref={thanRef}>
          {list.length === 0 && (
            <div className="cmdk-trong">
              {q ? `Không có thao tác nào khớp "${q}"` : 'Không có thao tác nào'}
            </div>
          )}
          {muc.map(g => (
            <Fragment key={g.ten}>
              <div className="cmdk-muc">{g.ten}</div>
              {g.ds.map(x => {
                const k = ++n
                const isChon = chonIds.includes(x.id)
                const atLimit = chonIds.length >= TOI_DA_THAO_TAC && !isChon
                return (
                  <div
                    key={x.id}
                    className={`cmdk-dong ttn-modal-dong${k === i ? ' on' : ''}${x.khoa ? ' khoa' : ''}${atLimit ? ' mo-limit' : ''}`}
                    onMouseMove={() => k !== i && setI(k)}
                    onClick={() => !x.khoa && toggle(x.id)}
                  >
                    <input
                      type="checkbox"
                      className="ttn-dong-tich"
                      checked={isChon}
                      disabled={x.khoa || atLimit}
                      onChange={() => !x.khoa && toggle(x.id)}
                      onClick={e => e.stopPropagation()}
                      aria-label={x.ten}
                    />
                    <ONen n={x.icon} kieu="nhat" co="sm" />
                    <span className="cmdk-chu">
                      <b><Ten x={x} words={words} /></b>
                      <small>{x.tenMod}</small>
                    </span>
                    {x.khoa && x.ma && <Pk g={minGoi(x.ma)} o />}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>

        {/* Chân modal */}
        <div className="ttn-modal-chan">
          <button type="button" className="btn ghost" onClick={handleKhoiPhuc}>
            Khôi phục mặc định
          </button>
          <span className="grow" />
          <button type="button" className="btn" onClick={onClose}>
            Huỷ
          </button>
          <button type="button" className="btn pri" onClick={handleLuu}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
