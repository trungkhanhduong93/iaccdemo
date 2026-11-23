// Hộp Chốt tồn cuối tháng theo tồn hệ thống (T902): cửa hàng chưa kiểm kê, xem trước chi phí NVL sẽ ra rồi mới chốt.
// Dùng chung cho màn Chi phí NVL, hộp Khoá sổ, máy tính và điện thoại. Bản vẽ backup/mau-T902/ban-ve.html, Màn 2.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { ThongBao } from '../../ui/ThongBao'
import { moneyD, pct } from '../../ui/format'
import { DI_DOI_CACH_NVL, chotTonHeThong, xemTruocChotHt } from './chi-phi-nvl'

export function HopChotTonHt({ thang, cns, onDong }: { thang: number; cns: string[]; onDong: () => void }) {
  const { s, toast } = useSession()
  const di = useNavigate()
  const ds = xemTruocChotHt(s, cns, thang)
  const [chon, setChon] = useState(() => new Set(cns))
  const daChon = ds.filter(x => chon.has(x.cn))
  const tien = daChon.reduce((a, x) => a + x.tien, 0), dt = daChon.reduce((a, x) => a + x.dt, 0)
  const doi = (cn: string) => setChon(c => { const n = new Set(c); if (n.has(cn)) n.delete(cn); else n.add(cn); return n })
  const chot = () => {
    chotTonHeThong(daChon.map(x => x.cn), thang, s.ten)
    toast(`Đã chốt tồn cuối tháng ${thang} cho ${daChon.length} cửa hàng`)
    onDong()
  }
  return (
    <ThongBao loai="canhBao" nhan="Chốt tồn" tieuDe={`Chốt tồn cuối tháng ${thang} theo tồn hệ thống`}
      moTa={`Tạo phiếu kiểm kê ngày cuối tháng ${thang} cho từng cửa hàng đã chọn, tồn thực tế ghi bằng tồn hệ thống, không lệch.`}
      nut={{ ten: `Chốt ${daChon.length} cửa hàng`, onClick: chot, tat: daChon.length === 0 }}
      nutThem={{ ten: 'Lập phiếu kiểm kê', onClick: () => di('/app/kho/5-1-10/moi') }}
      onDong={onDong}>
      <div className="cht-ds">
        <div className="cht-dong cht-dau"><span /><span>Cửa hàng chưa kiểm kê</span><span className="num">Tồn cuối kỳ</span><span className="num">Chi phí NVL</span></div>
        {ds.map(x => (
          <label key={x.cn} className="cht-dong">
            <input type="checkbox" checked={chon.has(x.cn)} onChange={() => doi(x.cn)} />
            <span>{x.ten}</span>
            <span className="num">{moneyD(x.tonCuoi)}</span>
            <b className="num cht-moi">{moneyD(x.tien)}</b>
          </label>
        ))}
      </div>
      {daChon.length > 0 && (
        <p className="cht-canh">Chi phí NVL tháng {thang} của {daChon.length} cửa hàng sẽ là <b>{moneyD(tien)}</b>, tức {pct(dt ? tien / dt : 0)} doanh thu.
          Tồn hệ thống chưa trừ nguyên liệu đã dùng để bán hàng, nên số này thấp hơn thực tế. Phần chênh dồn sang tháng sau qua tồn đầu kỳ.</p>
      )}
      <div className="cht-goi-y">
        <span>Không kiểm kê hằng tháng? Tính chi phí NVL theo tổng chi phí mua hàng sẽ sát thực tế hơn.</span>
        <button type="button" className="btn sm" onClick={() => di(DI_DOI_CACH_NVL)}>Đổi cách tính</button>
      </div>
    </ThongBao>
  )
}
