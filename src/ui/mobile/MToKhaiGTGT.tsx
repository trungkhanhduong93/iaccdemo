// Tờ khai thuế GTGT quý trên điện thoại theo app iFaster (T623): thẻ kỳ, hạn nộp, ô số tổng, chỉ tiêu tờ khai dạng dòng,
// Xuất XML, Nộp tờ khai ở đáy. Số liệu dùng chung với web (soLieuGTGT trong ToKhaiGTGT.tsx).
import { useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { soLieuGTGT } from '../../modules/thue/ToKhaiGTGT'
import { Icon } from '../Icon'
import { moneyD } from '../format'

const so = (v: unknown) => (typeof v === 'number' ? moneyD(v) : '')

export const MToKhaiGTGT: FC<ScreenProps> = () => {
  const { s, toast } = useSession()
  const [gui, setGui] = useState(false)
  const truocThang = s.cheDo === 'TT58'
  const { dt, vat, thueVao, c40, dong04, dong01 } = soLieuGTGT()
  const tong04 = dong04[dong04.length - 1]

  // Dòng chỉ tiêu 01/GTGT: dòng tiêu đề nhóm in đậm, dòng số ghi mã chỉ tiêu cạnh giá trị
  const dongChiTieu = (r: Row, i: number) => {
    const coSo = r.gt !== undefined || r.thue !== undefined
    return (
      <div key={i} className={`m-tk-ct${r._b && !coSo ? ' nhom' : ''}${r._t ? ' tong' : ''}${r._i ? ' con' : ''}`}>
        <span className="m-tk-ct-ten"><i>{r.stt}</i>{r.ct}</span>
        {coSo && (
          <span className="m-tk-ct-so">
            {r.gt !== undefined && <span><small>{r.ma1} Giá trị</small>{so(r.gt)}</span>}
            {r.thue !== undefined && <span><small>{r.ma2} Thuế</small>{so(r.thue)}</span>}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="m-tacvu m-tk">
      <div className="m-tk-noi">
        <div className="m-tk-noi-dau">
          <span>Tờ khai thuế GTGT</span>
          <span className={`m-tacvu-badge ${gui ? 'ok' : 'warn'}`}>{gui ? 'Đã nộp' : 'Chưa nộp'}</span>
        </div>
        <b className="m-tk-noi-ky">Quý 3/2026</b>
        <span className="m-tk-noi-ma">
          {truocThang ? 'Mẫu 04/GTGT · Tính trực tiếp trên doanh thu' : 'Mẫu 01/GTGT · Phương pháp khấu trừ'} · Hạn nộp 30/10/2026
        </span>
        {truocThang ? (
          <div className="m-tk-noi-so">
            <div><span>Doanh thu chịu thuế</span><b>{so(tong04.dt)}</b></div>
            <div><span>Thuế GTGT phải nộp</span><b>{so(tong04.thue)}</b></div>
          </div>
        ) : (
          <div className="m-tk-noi-so ba">
            <div><span>Thuế bán ra [35]</span><b>{moneyD(vat)}</b></div>
            <div><span>Được khấu trừ [25]</span><b>{moneyD(thueVao)}</b></div>
            <div><span>Còn phải nộp [40]</span><b>{moneyD(c40)}</b></div>
          </div>
        )}
        {gui && <span className="m-tk-noi-ma">Đã nộp qua kết nối cơ quan thuế, chờ phản hồi</span>}
      </div>

      {truocThang ? (
        <div className="m-tacvu-the">
          <div className="m-tacvu-the-tieu">Doanh thu và thuế theo nhóm ngành</div>
          {dong04.slice(0, -1).map((r, i) => (
            <div key={i} className="m-tk-ct">
              <span className="m-tk-ct-ten"><i>{r.stt}</i>{r.nhom} ({r.tl})</span>
              {r.dt !== undefined && (
                <span className="m-tk-ct-so">
                  <span><small>Doanh thu</small>{so(r.dt)}</span>
                  <span><small>Thuế</small>{so(r.thue)}</span>
                </span>
              )}
            </div>
          ))}
          <div className="m-tk-hang tong"><span>Tổng thuế GTGT phải nộp</span><b>{so(tong04.thue)}</b></div>
        </div>
      ) : (
        <div className="m-tacvu-the">
          <div className="m-tacvu-the-tieu">Chỉ tiêu tờ khai</div>
          {dong01.map(dongChiTieu)}
          <p className="m-tacvu-mota">Doanh thu bán ra chịu thuế trong kỳ: {moneyD(dt)}</p>
        </div>
      )}

      <div className="m-tacvu-ks-note warn">Số liệu giả để xem bố cục. Mẫu tờ khai và cách kê hàng giảm thuế cần kế toán trưởng duyệt trước khi dùng thật.</div>

      <div className="m-tacvu-day m-tk-day">
        <button type="button" className="btn" onClick={() => toast('Đã xuất tờ khai quý 3/2026 dạng XML')}>
          <Icon n="download" className="ic sm" /><span>Xuất XML</span>
        </button>
        <button type="button" className="btn pri" disabled={gui} onClick={() => { setGui(true); toast('Đã nộp tờ khai qua kết nối cơ quan thuế') }}>
          <Icon n="upload" className="ic sm" /><span>{gui ? 'Đã nộp' : 'Nộp tờ khai'}</span>
        </button>
      </div>
    </div>
  )
}
