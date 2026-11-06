// Phiếu mua hàng: tích Chi phí mua hàng cạnh Nhận kèm hoá đơn thì dải đáy form có ô số tiền và nút Phân bổ,
// chia vào từng mặt hàng theo giá trị hàng, cộng vào giá trị nhập kho (T757)
import { money } from '../format'
import { OSoGo } from '../OSoGo'
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

export function OChiPhiMua({ tien, onTien, dong, onPhanBo, sua }: {
  tien: number
  onTien: (v: number) => void
  dong: Dong[]
  onPhanBo: (dong: Dong[]) => void
  sua: boolean
}) {
  // So số đang có trên dòng với số chia lại: khác nhau là tiền hoặc hàng đã đổi sau lần phân bổ trước
  const khop = phanBoCp(dong, tien).every((d, i) => d.cpMua === (dong[i].cpMua || 0))
  return (
    <span className="ct-cpm">
      <small>Chi phí mua hàng</small>
      {sua ? <OSoGo val={tien} onChange={onTien} hien={money} className="inp sm num ct-cpm-o" /> : <b>{money(tien)}</b>}
      {sua && (
        <button type="button" className="btn sm pri" disabled={!dong.length} onClick={() => onPhanBo(phanBoCp(dong, tien))}>Phân bổ</button>
      )}
      {sua && !khop && <span className="ct-cpm-tt">Chưa phân bổ</span>}
    </span>
  )
}
