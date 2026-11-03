// Điện thoại, phiếu chi gói Standard lý do Thanh toán công nợ nhà cung cấp (T718): mục Chi tiết là các thẻ phiếu mua còn nợ,
// tích thẻ nào thì trả phiếu đó, số Thanh toán mặc định bằng công nợ, sửa được nhưng không vượt công nợ. Cùng dữ liệu với bảng web
import { money } from '../format'
import { docSoVN, goSoVN } from '../OSoGo'
import type { TraNo } from '../generic/BangTraNoNcc'

export function MTraNoNcc({ ncc, ds, chon, onChange }: { ncc: string; ds: TraNo[]; chon: TraNo[]; onChange: (v: TraNo[]) => void }) {
  const daChon = (id: string) => chon.some(c => c.id === id)
  const doi = (x: TraNo, tien: number | null) => {
    const ngoai = chon.filter(c => c.id !== x.id)
    if (tien === null) { onChange(ngoai); return }
    const moi = { ...x, tien: Math.min(Math.max(0, tien), x.tong - x.da) }
    onChange(ds.filter(d => d.id === x.id || daChon(d.id)).map(d => d.id === x.id ? moi : ngoai.find(c => c.id === d.id)!))
  }
  const tatCa = ds.length > 0 && ds.every(x => daChon(x.id))

  if (!ncc) return <div className="m-t650-trong"><span>Chọn nhà cung cấp ở mục Đối tượng để hiện các phiếu mua còn nợ</span></div>
  if (!ds.length) return <div className="m-t650-trong"><span>{ncc} không còn phiếu mua nào chưa thanh toán ở cửa hàng này</span></div>
  return (
    <div className="m-tra-no">
      <label className="m-tra-no-tat-ca">
        <input type="checkbox" checked={tatCa}
          onChange={e => onChange(e.target.checked ? ds.map(x => chon.find(c => c.id === x.id) ?? { ...x, tien: x.tong - x.da }) : [])} />
        <span>Chọn tất cả {ds.length} phiếu</span>
      </label>
      {ds.map(goc => {
        const co = daChon(goc.id)
        const x = chon.find(c => c.id === goc.id) ?? goc
        return (
          <div key={x.id} className={`m-tra-no-the${co ? ' on' : ''}`}>
            <label className="m-tra-no-dau">
              <input type="checkbox" checked={co} aria-label={`Chọn ${x.so}`} onChange={e => doi(x, e.target.checked ? x.tong - x.da : null)} />
              <b>{x.so}</b>
              <span className="ngay">{x.ngay}</span>
            </label>
            <div className="m-tra-no-hang"><span>Giá trị đơn</span><span>{money(x.tong)}</span></div>
            <div className="m-tra-no-hang"><span>Đã thanh toán</span><span>{money(x.da)}</span></div>
            <div className="m-tra-no-hang no"><span>Công nợ</span><span>{money(x.tong - x.da)}</span></div>
            <div className="m-tra-no-hang tt">
              <span>Thanh toán</span>
              <div className="m-tc-lap-inp-tien-wrap">
                <input type="text" inputMode="numeric" className="m-tc-lap-inp" value={co ? money(x.tien) : ''} placeholder="0" aria-label={`Thanh toán ${x.so}`}
                  onChange={e => { const v = docSoVN(goSoVN(e.target.value, false)); doi(x, v > 0 ? v : null) }} />
                <span className="don-vi">đ</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
