// Danh sách mục kéo đổi thứ tự của khung thiết kế (kế hoạch mục 8.7): cột bảng, trường thông tin, khối. Tuỳ chỉnh báo cáo (mục 10) dùng lại
import { useEffect, useRef } from 'react'
import { Icon } from '../Icon'
import { OSo } from './OSo'
import { doiCho, useKeoDong } from './keo'

export type Can = 'trai' | 'giua' | 'phai'
export interface MucDs { k: string; ten: string; an?: boolean; batBuoc?: boolean; rong?: number; can?: Can }

const LY_DO_KHOA = 'Nội dung bắt buộc của chứng từ kế toán'
const CAN: [Can, string, string][] = [
  ['trai', 'Căn trái', 'M4 6h16M4 12h10M4 18h13'],
  ['giua', 'Căn giữa', 'M4 6h16M7 12h10M5.5 18h13'],
  ['phai', 'Căn phải', 'M4 6h16M10 12h10M7 18h13'],
]

export const Net = ({ d }: { d: string }) => <svg className="ic sm" viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>
export const TayNam = () => <Net d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
export const LEN = 'M7 14l5-5 5 5'
export const XUONG = 'M7 10l5 5 5-5'

export function DsCot({ items, onChange, coRong, coCan, suaTen = true, rongTrong, nhanRong = 'Rộng (mm)', chon, onChon }: {
  items: MucDs[]; onChange: (items: MucDs[]) => void
  coRong?: boolean            // hiện ô độ rộng (mm)
  coCan?: boolean             // hiện nhóm nút căn
  suaTen?: boolean            // cho sửa tên mục
  rongTrong?: boolean         // ô độ rộng để trống được (tự động)
  nhanRong?: string
  chon?: string               // mục đang chọn trên tờ xem trước: tô sáng, cuộn tới
  onChon?: (k: string) => void
}) {
  const goc = useRef<HTMLDivElement>(null)
  const keo = useKeoDong((tu, den) => onChange(doiCho(items, tu, den)))
  const doi = (i: number, p: Partial<MucDs>) => onChange(items.map((x, j) => j === i ? { ...x, ...p } : x))
  const coAn = items.some(x => x.an && !x.batBuoc)

  useEffect(() => {
    if (!chon) return
    goc.current?.querySelector(`[data-k="${CSS.escape(chon)}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [chon])

  return (
    <div className="tkmi-ds" ref={goc}>
      <div className="tkmi-ds-dau">
        <span>{items.filter(x => !x.an || x.batBuoc).length}/{items.length} đang hiện</span>
        <span className="grow" />
        <button type="button" className="btn ghost sm" disabled={!coAn} onClick={() => onChange(items.map(x => ({ ...x, an: false })))}>Hiện tất cả</button>
      </div>
      {items.map((x, i) => {
        const hienMuc = !x.an || !!x.batBuoc
        return (
          <div key={x.k} data-k={x.k} {...keo.dong(i)} onFocusCapture={() => onChon?.(x.k)}
            className={`tkmi-dong${chon === x.k ? ' on' : ''}${hienMuc ? '' : ' tat'}${keo.keo === i ? ' dang-keo' : ''}${keo.dich === i ? ' dich' : ''}`}>
            <span className="tkmi-tay" title="Kéo để đổi thứ tự" {...keo.tay(i)}><TayNam /></span>
            <span className="tkmi-tick">
              <input type="checkbox" checked={hienMuc} disabled={x.batBuoc} aria-label={`Hiện ${x.ten}`}
                title={x.batBuoc ? LY_DO_KHOA : undefined} onChange={e => doi(i, { an: !e.target.checked })} />
              {x.batBuoc && <span className="tkmi-khoa" title={LY_DO_KHOA}><Icon n="lock" className="ic sm" title={LY_DO_KHOA} /></span>}
            </span>
            {suaTen
              ? <input className="inp tkmi-o-ten" value={x.ten} aria-label="Tên" onChange={e => doi(i, { ten: e.target.value })} />
              : <span className="tkmi-ten">{x.ten}</span>}
            <span className="tkmi-len-xuong">
              <button type="button" className="icon-btn sm" title="Lên" aria-label={`Đưa ${x.ten} lên`} disabled={i === 0} onClick={() => onChange(doiCho(items, i, i - 1))}><Net d={LEN} /></button>
              <button type="button" className="icon-btn sm" title="Xuống" aria-label={`Đưa ${x.ten} xuống`} disabled={i === items.length - 1} onClick={() => onChange(doiCho(items, i, i + 1))}><Net d={XUONG} /></button>
            </span>
            {(coRong || coCan) && (
              <span className="tkmi-dong-phu">
                {coRong && (
                  <label className="tkmi-rong">
                    {nhanRong}
                    <OSo className="inp tkmi-o-so" value={x.rong} min={1} max={500} trong={rongTrong} placeholder={rongTrong ? 'Tự động' : undefined}
                      aria-label={`${nhanRong} ${x.ten}`} onChange={v => doi(i, { rong: v })} />
                  </label>
                )}
                {coCan && (
                  <span className="seg tkmi-can">
                    {CAN.map(([c, ten, d]) => (
                      <button key={c} type="button" className={(x.can ?? 'trai') === c ? 'on' : ''} title={ten} aria-label={`${ten} ${x.ten}`} onClick={() => doi(i, { can: c })}><Net d={d} /></button>
                    ))}
                  </span>
                )}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
