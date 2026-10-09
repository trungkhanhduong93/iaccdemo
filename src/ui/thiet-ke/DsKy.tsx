// Danh sách ô ký của khung thiết kế: thêm bớt (0–5 ô), kéo đổi thứ tự, sửa chức danh, dòng gợi ý, họ tên in sẵn
import type { OKyIn } from '../../app/mau-in'
import { Icon } from '../Icon'
import { LEN, Net, TayNam, XUONG } from './DsCot'
import { doiCho, useKeoDong } from './keo'

const TOI_DA = 5

export function DsKy({ ds, onChange, hoTenDonVi = {} }: {
  ds: OKyIn[]; onChange: (ds: OKyIn[]) => void
  hoTenDonVi?: Record<string, string>      // người ký mặc định của đơn vị, hiện làm gợi ý khi ô ký chưa có họ tên
}) {
  const keo = useKeoDong((tu, den) => onChange(doiCho(ds, tu, den)))
  const doi = (i: number, p: Partial<OKyIn>) => onChange(ds.map((x, j) => j === i ? { ...x, ...p } : x))
  return (
    <div className="tkmi-ds">
      {ds.map((x, i) => (
        <div key={i} {...keo.dong(i)} className={`tkmi-ky${keo.keo === i ? ' dang-keo' : ''}${keo.dich === i ? ' dich' : ''}`}>
          <div className="tkmi-ky-dau">
            <span className="tkmi-tay" title="Kéo để đổi thứ tự" {...keo.tay(i)}><TayNam /></span>
            <b>Ô ký {i + 1}</b>
            <span className="grow" />
            <button type="button" className="icon-btn sm" title="Lên" aria-label={`Đưa ô ký ${i + 1} lên`} disabled={i === 0} onClick={() => onChange(doiCho(ds, i, i - 1))}><Net d={LEN} /></button>
            <button type="button" className="icon-btn sm" title="Xuống" aria-label={`Đưa ô ký ${i + 1} xuống`} disabled={i === ds.length - 1} onClick={() => onChange(doiCho(ds, i, i + 1))}><Net d={XUONG} /></button>
            <button type="button" className="icon-btn sm" title="Bỏ ô ký" aria-label={`Bỏ ô ký ${i + 1}`} onClick={() => onChange(ds.filter((_, j) => j !== i))}><Icon n="trash" className="ic sm" /></button>
          </div>
          <label className="tkmi-nhan">Chức danh
            <input className="inp" value={x.chucDanh} onChange={e => doi(i, { chucDanh: e.target.value })} />
          </label>
          <label className="tkmi-nhan">Dòng gợi ý
            <input className="inp" value={x.goiY} placeholder="(Ký, họ tên)" onChange={e => doi(i, { goiY: e.target.value })} />
          </label>
          <label className="tkmi-nhan">Họ tên in sẵn
            <input className="inp" value={x.hoTen ?? ''} placeholder={hoTenDonVi[x.chucDanh] ?? 'Để trống để ký tay'}
              onChange={e => doi(i, { hoTen: e.target.value || undefined })} />
          </label>
        </div>
      ))}
      <button type="button" className="btn sm" disabled={ds.length >= TOI_DA}
        onClick={() => onChange([...ds, { chucDanh: 'Người ký', goiY: '(Ký, họ tên)' }])}>
        <Icon n="plus" className="ic sm" />Thêm ô ký
      </button>
      {ds.length >= TOI_DA && <span className="tkmi-goi-y">Tối đa {TOI_DA} ô ký trên một phiếu</span>}
    </div>
  )
}
