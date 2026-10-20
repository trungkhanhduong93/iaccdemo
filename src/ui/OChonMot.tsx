// Ô lọc chọn 1 giá trị (T510): danh sách thả, mỗi dòng tên đậm, dưới là mã, dòng phụ; trên 8 mục thì có ô tìm
import { useRef, useState } from 'react'
import { Popover } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'

export interface MucChonMot { v: string; t: string; ma?: string; phu?: string }

export function OChonMot({ ds, value, onChange, nhan, goiY = 'Chọn' }: {
  ds: MucChonMot[]; value: string; onChange: (v: string) => void; nhan: string; goiY?: string
}) {
  const [mo, setMo] = useState(false)
  const [tim, setTim] = useState('')
  const nut = useRef<HTMLDivElement>(null)
  const chon = ds.find(m => m.v === value)
  const loc = tim.trim() ? ds.filter(m => fold(`${m.t} ${m.ma ?? ''}`).includes(fold(tim.trim()))) : ds
  const dat = (v: string) => { onChange(v); setMo(false); setTim('') }

  return (
    <>
      <div ref={nut} role="combobox" tabIndex={0} aria-expanded={mo} aria-haspopup="listbox" aria-label={nhan}
        className={`inp chc-o ocm-o${mo ? ' open' : ''}`}
        onClick={() => setMo(o => !o)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); setMo(true) } }}>
        <span className="chc-gia-tri-wrap" title={chon?.t}>
          {chon ? <span className="chc-gia-tri">{chon.t}</span> : <span className="chc-goi-y">{goiY}</span>}
        </span>
        {chon && (
          <button type="button" className="chc-xoa" title={`Bỏ lọc ${nhan}`} aria-label={`Bỏ lọc ${nhan}`}
            onClick={e => { e.stopPropagation(); onChange('') }}>
            <Icon n="x" className="ic xs" />
          </button>
        )}
        <Icon n="chevd" className="ic sm chc-mui-ten" />
      </div>
      <Popover anchor={nut} open={mo} onClose={() => { setMo(false); setTim('') }} align="start" width={300} role="listbox" className="ocm-pop">
        {ds.length > 8 && (
          <div className="ocm-tim">
            <Icon n="search" className="ic sm" />
            <input autoFocus value={tim} placeholder="Tìm kiếm" aria-label={`Tìm ${nhan}`} onChange={e => setTim(e.target.value)} />
          </div>
        )}
        <div className="ocm-ds">
          {loc.map(m => (
            <button key={m.v} type="button" role="option" aria-selected={m.v === value}
              className={`ocm-muc${m.v === value ? ' on' : ''}`} onClick={() => dat(m.v)}>
              <b>{m.t}</b>
              {m.ma && <small>Mã: {m.ma}</small>}
              {m.phu && <small>{m.phu}</small>}
            </button>
          ))}
          {loc.length === 0 && <div className="ocm-trong">Không có kết quả</div>}
        </div>
      </Popover>
    </>
  )
}
