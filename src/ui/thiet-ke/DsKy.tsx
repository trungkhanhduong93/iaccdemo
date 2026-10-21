// Danh sách ô ký của khung thiết kế: thêm bớt (0–5 ô), kéo đổi thứ tự, sửa chức danh, dòng gợi ý, họ tên in sẵn
import type { OKyIn } from '../../app/mau-in'
import { Icon } from '../Icon'
import { LEN, Net, TayNam, XUONG } from './DsCot'
import { doiCho, useKeoDong } from './keo'

const TOI_DA = 5

export function DsKy({ ds, onChange, hoTenDonVi = {}, kieu = 'the' }: {
  ds: OKyIn[]; onChange: (ds: OKyIn[]) => void
  hoTenDonVi?: Record<string, string>      // người ký mặc định của đơn vị, hiện làm gợi ý khi ô ký chưa có họ tên
  kieu?: 'the' | 'dong'
}) {
  const keo = useKeoDong((tu, den) => onChange(doiCho(ds, tu, den)))
  const doi = (i: number, p: Partial<OKyIn>) => onChange(ds.map((x, j) => j === i ? { ...x, ...p } : x))

  if (kieu === 'dong') {
    return (
      <div className="tc-ds-ky-dong">
        <div className="tc-ky-tieu-de">
          <span />
          <span />
          <span className="tc-cot-ten">Chức danh</span>
          <span className="tc-cot-ten">Dòng gợi ý</span>
          <span className="tc-cot-ten">Họ tên in sẵn</span>
          <span />
        </div>
        {ds.map((x, i) => (
          <div
            key={i}
            {...keo.dong(i)}
            className={`tc-o-ky${keo.keo === i ? ' dang-keo' : ''}${keo.dich === i ? ' dich' : ''}`}
          >
            <span className="tc-keo" title="Kéo để đổi thứ tự" aria-hidden="true" {...keo.tay(i)}>
              <TayNam />
            </span>
            <span className="tc-so">{i + 1}</span>
            <input
              className="tc-o"
              value={x.chucDanh}
              onChange={e => doi(i, { chucDanh: e.target.value })}
              aria-label={`Chức danh ô ký ${i + 1}`}
            />
            <input
              className="tc-o tc-phu"
              value={x.goiY ?? ''}
              placeholder="(Ký, họ tên)"
              onChange={e => doi(i, { goiY: e.target.value })}
              aria-label={`Dòng gợi ý ô ký ${i + 1}`}
            />
            <input
              className="tc-o"
              value={x.hoTen ?? ''}
              placeholder="Để trống, ký tay"
              onChange={e => doi(i, { hoTen: e.target.value || undefined })}
              aria-label={`Họ tên ô ký ${i + 1}`}
            />
            <div style={{ display: 'flex' }}>
              <button
                type="button"
                className="tc-x"
                onClick={() => onChange(doiCho(ds, i, i - 1))}
                disabled={i === 0}
                aria-label={`Đưa ô ký ${i + 1} lên`}
              >
                <Net d={LEN} />
              </button>
              <button
                type="button"
                className="tc-x"
                onClick={() => onChange(doiCho(ds, i, i + 1))}
                disabled={i === ds.length - 1}
                aria-label={`Đưa ô ký ${i + 1} xuống`}
              >
                <Net d={XUONG} />
              </button>
              <button
                type="button"
                className="tc-x"
                onClick={() => onChange(ds.filter((_, j) => j !== i))}
                aria-label={`Bỏ ô ký ${i + 1}`}
              >
                <Icon n="trash" className="ic sm" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="tc-them"
          disabled={ds.length >= TOI_DA}
          onClick={() => onChange([...ds, { chucDanh: 'Người ký', goiY: '(Ký, họ tên)' }])}
        >
          <Icon n="plus" className="ic sm" />
          {ds.length >= TOI_DA ? 'Đủ 5 ô ký' : `Thêm ô ký (còn ${TOI_DA - ds.length})`}
        </button>

        <section className="tc-khung-in">
          <h3 className="tc-tieu-de-in">Chân trang khi in</h3>
          <div className="tc-chan-trang-hop">
            <div className="tc-ngay-in">Ngày ... tháng ... năm ...</div>
            <div
              className="tc-chan-trang-luoi"
              style={{ gridTemplateColumns: `repeat(${Math.max(ds.length, 1)}, minmax(0, 1fr))` }}
            >
              {ds.map((k, i) => (
                <div key={i} className="tc-o-chan-trang">
                  <b>{k.chucDanh}</b>
                  <i>{k.goiY ?? '(Ký, họ tên)'}</i>
                  <div className="tc-khoang-ky" />
                  <b>{k.hoTen || hoTenDonVi[k.chucDanh] || ''}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }
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
