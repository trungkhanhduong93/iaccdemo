// Hàng thẻ công thức chi phí NVL (T944): Tồn đầu kỳ + Mua trong tháng − Tồn cuối kỳ = Chi phí NVL, thẻ cuối có thanh % trên doanh thu.
// Dùng chung màn Chi phí NVL máy tính và điện thoại; điện thoại xếp dọc bằng CSS.
import { moneyD, pct } from '../../ui/format'
import type { nvlKy } from './chi-phi-nvl'

/** Mức tỷ lệ chi phí NVL trên doanh thu để tô màu: dưới 35% xanh, 35–40% vàng, trên 40% đỏ (T944) */
export const mucTyLeNvl = (tl: number) => tl < 0.35 ? 'tot' : tl <= 0.4 ? 'vua' : 'cao'

/** Thanh ngang nhỏ tỷ lệ trên doanh thu, đầy thanh là 100% */
export function ThanhTyLeNvl({ tl }: { tl: number }) {
  return <span className={`nvl-tl nvl-tl-${mucTyLeNvl(tl)}`} aria-hidden><i style={{ width: `${Math.min(tl, 1) * 100}%` }} /></span>
}

export function TheCongThucNvl({ tong, ten }: { tong: ReturnType<typeof nvlKy>; ten?: string }) {
  // Chỉ cộng cửa hàng đã tính được chi phí, để bốn thẻ khớp công thức khi có cửa hàng chưa kiểm kê (T902)
  const ds = tong.ds.filter(x => !x.chuaKk)
  const cong = (f: (x: typeof ds[number]) => number | undefined) => ds.reduce((a, x) => a + (f(x) ?? 0), 0)
  const dt = cong(x => x.dt)
  const tl = dt ? tong.tien / dt : 0
  const soChua = tong.ds.length - ds.length
  const the = (dau: string, nhan: string, so: number, phu: string) => (
    <div className="nvl-ct-the" data-dau={dau || undefined}>
      <span className="nvl-ct-nhan">{nhan}</span>
      <b className="nvl-ct-so">{moneyD(so)}</b>
      <small className="nvl-ct-phu">{phu}</small>
    </div>
  )
  return (
    <div className="nvl-ct-hang">
      {tong.cach === 'kk' ? <>
        {the('', 'Tồn đầu kỳ', cong(x => x.tonDau), 'Kiểm kê cuối tháng trước')}
        {the('+', 'Mua trong tháng', cong(x => x.mua), 'Phiếu mua hàng')}
        {the('−', 'Tồn cuối kỳ', cong(x => x.tonCuoi), 'Kiểm kê cuối tháng này')}
      </> : the('', 'Mua trong tháng', cong(x => x.mua), 'Phiếu mua hàng')}
      <div className="nvl-ct-the chinh" data-dau="=">
        <span className="nvl-ct-nhan">Chi phí NVL{ten ? ` · ${ten}` : ''}</span>
        <b className="nvl-ct-so">{moneyD(tong.tien)}</b>
        <div className="nvl-ct-tl"><ThanhTyLeNvl tl={tl} /><span><b>{pct(tl)}</b> doanh thu</span></div>
        {soChua > 0 && <small className="cht-chua-gom">Chưa gồm {soChua} cửa hàng chưa kiểm kê</small>}
      </div>
    </div>
  )
}
