import { useMemo, useState, type FC } from 'react'
import type { ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { dsHoaDonDauVao, TT_HD, type HoaDonDauVaoRow } from '../../modules/tien-ich/TienIch'
import { money } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'

export const MHoaDonDauVao: FC<ScreenProps> = () => {
  const { toast } = useSession()
  const [rows, setRows] = useState<HoaDonDauVaoRow[]>(() => dsHoaDonDauVao())
  const [loc, setLoc] = useState<string>('all')
  const [dangXem, setDangXem] = useState<HoaDonDauVaoRow | null>(null)

  const soOk = useMemo(() => rows.filter(r => r.tt === 'ok').length, [rows])
  const soHt = useMemo(() => rows.filter(r => r.tt === 'ht').length, [rows])
  const soLoi = useMemo(() => rows.filter(r => ['huy', 'mst', 'trung'].includes(r.tt)).length, [rows])

  const dsLoc = useMemo(() => {
    if (loc === 'ok') return rows.filter(r => r.tt === 'ok')
    if (loc === 'ht') return rows.filter(r => r.tt === 'ht')
    if (loc === 'loi') return rows.filter(r => ['huy', 'mst', 'trung'].includes(r.tt))
    return rows
  }, [rows, loc])

  const dongSheet = () => setDangXem(null)

  const hachToanMot = (hd: HoaDonDauVaoRow) => {
    setRows(prev => prev.map(x => (x.id === hd.id ? { ...x, tt: 'ht' } : x)))
    toast(`Đã hạch toán hoá đơn ${hd.so}`)
    setDangXem(null)
  }

  const boQuaMot = (hd: HoaDonDauVaoRow) => {
    toast(`Đã bỏ qua hoá đơn ${hd.so}`)
    setDangXem(null)
  }

  const hachToanHangLoat = () => {
    setRows(prev => prev.map(x => (x.tt === 'ok' ? { ...x, tt: 'ht' } : x)))
    toast('Đã hạch toán 13 hoá đơn hợp lệ')
  }

  const taiTuInvoice = () => {
    toast('Đã tải 23 hoá đơn từ iPOS Invoice')
  }

  return (
    <div className="m-hddv">
      {/* Chip lọc trạng thái */}
      <div className="m-hddv-loc">
        <button
          type="button"
          className={`m-hddv-chip ${loc === 'all' ? 'on' : ''}`}
          onClick={() => setLoc('all')}
        >
          <span>Tất cả</span>
          <span className="m-hddv-chip-so">{rows.length}</span>
        </button>
        <button
          type="button"
          className={`m-hddv-chip ${loc === 'ok' ? 'on' : ''}`}
          onClick={() => setLoc('ok')}
        >
          <span>Chờ hạch toán</span>
          <span className="m-hddv-chip-so">{soOk}</span>
        </button>
        <button
          type="button"
          className={`m-hddv-chip ${loc === 'ht' ? 'on' : ''}`}
          onClick={() => setLoc('ht')}
        >
          <span>Đã hạch toán</span>
          <span className="m-hddv-chip-so">{soHt}</span>
        </button>
        <button
          type="button"
          className={`m-hddv-chip ${loc === 'loi' ? 'on' : ''}`}
          onClick={() => setLoc('loi')}
        >
          <span>Cảnh báo</span>
          <span className="m-hddv-chip-so">{soLoi}</span>
        </button>
      </div>

      {/* Danh sách hoá đơn */}
      {dsLoc.length === 0 ? (
        <MTrong kieu="chung" tieuDe="Không có hoá đơn nào" moTa="Hoá đơn tải về sẽ hiển thị ở đây" />
      ) : (
        <div className="m-hddv-ds">
          {dsLoc.map(r => {
            const ttCfg = TT_HD[r.tt] ?? ['dim', r.tt]
            return (
              <div
                key={r.id}
                className="m-hddv-the"
                onClick={() => setDangXem(r)}
                role="button"
                tabIndex={0}
              >
                <div className="m-hddv-the-dau">
                  <span className="m-hddv-ban">{r.ban}</span>
                  <span className={`m-hddv-tt ${ttCfg[0]}`}>{ttCfg[1]}</span>
                </div>
                <div className="m-hddv-the-than">
                  <span className="m-hddv-so">{r.so}</span>
                  <span className="m-hddv-mst">MST: {r.mst}</span>
                </div>
                <div className="m-hddv-the-chan">
                  <span className="m-hddv-ngay">{r.ngay}</span>
                  <span className="m-hddv-tien">
                    {money(r.tien + r.thue)} đ
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hàng nút dính đáy */}
      <div className="m-hddv-day">
        <button type="button" className="btn" onClick={taiTuInvoice}>
          <Icon n="refresh" className="ic sm" />
          <span>Tải từ Invoice</span>
        </button>
        <button
          type="button"
          className="btn pri"
          onClick={hachToanHangLoat}
          disabled={soOk === 0}
        >
          <Icon n="check" className="ic sm" />
          <span>Hạch toán hợp lệ ({soOk})</span>
        </button>
      </div>

      {/* Tấm nổi từ đáy: Chi tiết hoá đơn */}
      {dangXem && (
        <div className="m-hddv-hop">
          <div className="overlay" onClick={dongSheet} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangXem.so}</h3>
                <small className="muted">{dangXem.ban}</small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={dongSheet}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              <div className="m-hddv-ct-luoi">
                <div className="m-hddv-ct-nhan">Người bán</div>
                <div className="m-hddv-ct-val">{dangXem.ban}</div>

                <div className="m-hddv-ct-nhan">Mã số thuế</div>
                <div className="m-hddv-ct-val">{dangXem.mst}</div>

                <div className="m-hddv-ct-nhan">Ngày hoá đơn</div>
                <div className="m-hddv-ct-val">{dangXem.ngay}</div>

                <div className="m-hddv-ct-nhan">Trạng thái</div>
                <div className="m-hddv-ct-val">
                  <span className={`m-hddv-tt ${TT_HD[dangXem.tt]?.[0] ?? 'dim'}`}>
                    {TT_HD[dangXem.tt]?.[1] ?? dangXem.tt}
                  </span>
                </div>

                <div className="m-hddv-ct-nhan">Tiền hàng</div>
                <div className="m-hddv-ct-val">{money(dangXem.tien)} đ</div>

                <div className="m-hddv-ct-nhan">Thuế GTGT</div>
                <div className="m-hddv-ct-val">{money(dangXem.thue)} đ</div>

                <div className="m-hddv-ct-nhan">Tổng cộng</div>
                <div className="m-hddv-ct-val" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  {money(dangXem.tien + dangXem.thue)} đ
                </div>
              </div>
            </div>

            <div className="pn-chan">
              {dangXem.tt === 'ok' ? (
                <>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => boQuaMot(dangXem)}
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    className="btn pri"
                    onClick={() => hachToanMot(dangXem)}
                  >
                    Hạch toán
                  </button>
                </>
              ) : (
                <button type="button" className="btn" onClick={dongSheet}>
                  Đóng
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
