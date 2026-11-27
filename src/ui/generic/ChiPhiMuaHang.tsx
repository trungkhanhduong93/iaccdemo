// Phiếu mua hàng: tích Chi phí mua hàng cạnh Nhận kèm hoá đơn thì dải đáy form có ô số tiền và nút Phân bổ,
// chia vào từng mặt hàng theo giá trị hàng, cộng vào giá trị nhập kho (T757)
import { money } from '../format'
import { OSoGo } from '../OSoGo'
import { NCC } from '../../data/mock'
import { ChonDanhMuc } from '../ChonDanhMuc'
import type { Dong } from './gen'

const giaTri = (d: Dong) => Math.max((d.tien || 0) - (d.ck || 0), 0)

/** Chia tổng chi phí theo giá trị hàng (thành tiền trừ chiết khấu); phần lẻ do làm tròn dồn vào dòng giá trị lớn nhất */
export function phanBoCp(dong: Dong[], tong: number): Dong[] {
  const tongGt = dong.reduce((a, d) => a + giaTri(d), 0)
  if (tongGt <= 0) return dong.map(d => ({ ...d, cpMua: 0 }))
  const moi = dong.map(d => ({ ...d, cpMua: Math.round(tong * giaTri(d) / tongGt) }))
  const lon = dong.reduce((k, d, i) => giaTri(d) > giaTri(dong[k]) ? i : k, 0)
  moi[lon].cpMua += tong - moi.reduce((a, d) => a + d.cpMua, 0)
  return moi
}

export function OChiPhiMua({ tien, onTien, dong, onPhanBo, sua, dvVc, onDvVc }: {
  tien: number
  onTien: (v: number) => void
  dong: Dong[]
  onPhanBo: (dong: Dong[]) => void
  sua: boolean
  dvVc: string                      // đơn vị vận chuyển; trống là nhà cung cấp tự vận chuyển
  onDvVc: (v: string) => void
}) {
  return (
    <span className="ct-cpm">
      <small>Chi phí mua hàng</small>
      {sua ? <OSoGo val={tien} onChange={onTien} hien={money} className="inp sm num ct-cpm-o" /> : <b>{money(tien)}</b>}
      {sua && (
        <button type="button" className="btn sm pri" disabled={!dong.length} onClick={() => onPhanBo(phanBoCp(dong, tien))}>Phân bổ</button>
      )}
      <small>Đối tượng LQ</small>
      {sua
        ? (
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            <ChonDanhMuc dm="ncc" nhan="đối tượng liên quan" value={dvVc} onChange={onDvVc} ds={NCC.map(n => n.ten)} trong="NCC tự vận chuyển" className="inp sm" style={{ width: 400, paddingRight: dvVc ? 52 : undefined }} />
            {dvVc && (
              <button type="button" title="Bỏ chọn: nhà cung cấp tự vận chuyển" aria-label="Bỏ chọn đối tượng liên quan"
                onClick={e => { e.stopPropagation(); onDvVc('') }}
                style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: 'var(--muted)', padding: '0 4px' }}>×</button>
            )}
          </span>
        )
        : <b>{dvVc || 'NCC tự vận chuyển'}</b>}
    </span>
  )
}
