// Cài trang in của khung thiết kế: khổ, hướng, lề, số liên, cỡ chữ, phông. Bản gọn chỉ khổ và cỡ chữ (gói Free, Standard).
// phan tách đôi cho bảng thuộc tính chia nhóm (T112): 'giay' khổ, hướng, lề, liên; 'chu' cỡ chữ, phông
import type { MauIn } from '../../app/mau-in'
import { Select } from '../Dropdown'
import { OSo } from './OSo'

export type Trang = MauIn['trang']

// Cỡ chữ 8–14pt, bước 0,5
const CO_CHU = Array.from({ length: 13 }, (_, i) => 8 + i / 2)
const LE: [number, string][] = [[0, 'Trên'], [1, 'Phải'], [2, 'Dưới'], [3, 'Trái']]
export const coChuVi = (v: number) => `${String(v).replace('.', ',')} pt`

export function CaiTrang({ trang, onChange, gon, phan }: { trang: Trang; onChange: (t: Trang) => void; gon?: boolean; phan?: 'giay' | 'chu' }) {
  const doi = (p: Partial<Trang>) => onChange({ ...trang, ...p })
  const giay = phan !== 'chu'
  const chu = phan !== 'giay'
  return (
    <div className="tkmi-trang">
      {giay && <div className="tkmi-hang">
        <span className="tkmi-nhan-hang">Khổ giấy</span>
        <span className="seg">
          {(['A4', 'A5'] as const).map(k => <button key={k} type="button" className={trang.kho === k ? 'on' : ''} onClick={() => doi({ kho: k })}>{k}</button>)}
        </span>
      </div>}
      {!gon && giay && (
        <div className="tkmi-hang">
          <span className="tkmi-nhan-hang">Hướng</span>
          <span className="seg">
            <button type="button" className={trang.huong === 'doc' ? 'on' : ''} onClick={() => doi({ huong: 'doc' })}>Dọc</button>
            <button type="button" className={trang.huong === 'ngang' ? 'on' : ''} onClick={() => doi({ huong: 'ngang' })}>Ngang</button>
          </span>
        </div>
      )}
      {!gon && giay && (
        <div className="tkmi-hang tkmi-hang-le">
          <span className="tkmi-nhan-hang">Lề (mm)</span>
          <span className="tkmi-le">
            {LE.map(([i, ten]) => (
              <label key={i}>{ten}
                <OSo className="inp tkmi-o-so" value={trang.le[i]} min={0} max={40} aria-label={`Lề ${ten.toLowerCase()} (mm)`}
                  onChange={v => doi({ le: trang.le.map((x, j) => j === i ? v ?? x : x) as Trang['le'] })} />
              </label>
            ))}
          </span>
        </div>
      )}
      {!gon && giay && (
        <div className="tkmi-hang">
          <span className="tkmi-nhan-hang">Số liên</span>
          <span className="seg">
            {([1, 2] as const).map(l => <button key={l} type="button" className={trang.lien === l ? 'on' : ''} onClick={() => doi({ lien: l })}>{l} liên</button>)}
          </span>
        </div>
      )}
      {!gon && giay && trang.lien === 2 && !(trang.kho === 'A5' && trang.huong === 'ngang') && (
        <span className="tkmi-goi-y">2 liên chỉ in trên một tờ A4 khi khổ là A5 ngang</span>
      )}
      {chu && <div className="tkmi-hang">
        <span className="tkmi-nhan-hang">Cỡ chữ</span>
        <Select className="inp tkmi-o-chon" value={String(trang.coChu)} aria-label="Cỡ chữ" onChange={e => doi({ coChu: Number(e.target.value) })}>
          {CO_CHU.map(c => <option key={c} value={String(c)}>{coChuVi(c)}</option>)}
        </Select>
      </div>}
      {!gon && chu && (
        <div className="tkmi-hang">
          <span className="tkmi-nhan-hang">Phông chữ</span>
          <Select className="inp tkmi-o-chon" value={trang.phong} aria-label="Phông chữ" onChange={e => doi({ phong: e.target.value === 'times' ? 'times' : 'app' })}>
            <option value="app">Phông của app</option>
            <option value="times">Times New Roman</option>
          </Select>
        </div>
      )}
    </div>
  )
}
