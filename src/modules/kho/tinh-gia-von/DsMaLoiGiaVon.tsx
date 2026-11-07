import { useEffect, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { NutXuatExcel } from '../../../ui/CongCuDs'
import { xuatBangExcel } from '../../../ui/xuatBangExcel'
import type { Thang, DongLoi } from './du-lieu'

export function DsMaLoiGiaVon(props: {
  thang: Thang
  ds: DongLoi[]
  tong: number
  onDong: () => void
}): JSX.Element {
  const { thang, ds, tong, onDong } = props

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onDong()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDong])

  const onXuatExcel = () => {
    const tieuDe = `Danh sách mã lỗi tính giá vốn tháng ${thang.t}/${thang.n}`
    const phu = `Tháng ${thang.t}/${thang.n}, ${ds.length.toLocaleString('vi-VN')} mã lỗi trên ${tong.toLocaleString('vi-VN')} mã hàng theo kho.`
    const cot = [
      { t: 'STT', rong: 8 },
      { t: 'Mã hàng', rong: 15 },
      { t: 'Tên hàng', rong: 35 },
      { t: 'Kho', rong: 30 },
      { t: 'Lý do lỗi', rong: 50 },
    ]
    const dong = ds.map((x, i) => [i + 1, x.ma, x.hang, x.kho, x.loi])
    xuatBangExcel(tieuDe, phu, cot, dong)
  }

  return createPortal(
    <div
      className="tgv-phu tang-2"
      onClick={e => {
        if (e.target === e.currentTarget) onDong()
      }}
    >
      <section className="tgv-hop loi" role="dialog" aria-modal="true" aria-labelledby="loi-ten">
        <header className="hop-dau">
          <div>
            <h2 id="loi-ten">Danh sách mã lỗi</h2>
            <p id="loi-phu">
              Tháng {thang.t}/{thang.n}, {ds.length.toLocaleString('vi-VN')} mã lỗi trên {tong.toLocaleString('vi-VN')} mã hàng theo kho.
            </p>
          </div>
          <button
            className="nut-x"
            type="button"
            aria-label="Đóng danh sách mã lỗi"
            onClick={onDong}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </header>

        <div className="hop-than">
          <div className="thanh-cong-cu">
            <p>Các mã này chưa được cập nhật đơn giá. Sửa phiếu theo lý do rồi chạy tính giá lại.</p>
            <div className="ds-toolbar-phai">
              <NutXuatExcel onXuat={onXuatExcel} />
            </div>
          </div>

          <div className="cuon-bang">
            <table>
              <colgroup>
                <col style={{ width: 52 }} />
                <col style={{ width: 96 }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '20%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th className="stt">STT</th>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Kho</th>
                  <th>Lý do lỗi</th>
                </tr>
              </thead>
              <tbody>
                {ds.map((x, i) => (
                  <tr key={`${x.ma}-${x.kho}-${i}`}>
                    <td className="stt">{i + 1}</td>
                    <td className="ma-hang">{x.ma}</td>
                    <td className="ten-hang">
                      <span className="cat2" title={x.hang}>
                        {x.hang}
                      </span>
                    </td>
                    <td className="kho">
                      <span className="cat2" title={x.kho}>
                        {x.kho}
                      </span>
                    </td>
                    <td className="ly-do">{x.loi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="hop-chan">
          <button className="nut" type="button" onClick={onDong}>
            Đóng
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
