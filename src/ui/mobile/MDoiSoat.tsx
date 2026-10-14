import { useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { cnTen, LECH, type Lech } from '../../data/mock'
import { CAP } from '../../modules/tien-ich/DoiSoat'
import { moneyD } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'

export const MDoiSoat: FC<ScreenProps> = () => {
  const { toast } = useSession()
  const [cap, setCap] = useState<string>('Tất cả')
  const [xong, setXong] = useState<string[]>([])
  const [dangXem, setDangXem] = useState<(Lech & { lech: number; cnT: string; ttHienTai: string }) | null>(null)

  const ds = useMemo(
    () =>
      LECH.map(l => ({
        ...l,
        ttHienTai: xong.includes(l.id) ? 'xong' : l.tt,
        lech: l.nguonV - l.soV,
        cnT: cnTen(l.cn),
      })),
    [xong],
  )

  const conLai = useMemo(() => ds.filter(l => l.ttHienTai !== 'xong').length, [ds])

  const dsLoc = useMemo(
    () =>
      ds.filter(
        l =>
          (cap === 'Tất cả' || l.cap === cap) && l.ttHienTai !== 'xong',
      ),
    [ds, cap],
  )

  const dongSheet = () => setDangXem(null)

  const chayDoiSoat = () => {
    toast('Đã đối soát lại 01/09–07/10: 3 dòng lệch')
  }

  const danhDauXuLy = (id: string) => {
    setXong(prev => [...prev, id])
    setDangXem(null)
    toast('Đã đánh dấu đã xử lý')
  }

  return (
    <div className="m-ds">
      {/* Thẻ tổng hợp khớp / lệch */}
      <div className="m-ds-tong-hop">
        <div className="m-ds-kpi">
          <span className="m-ds-kpi-nhan">FABi ↔ Sổ</span>
          <span className="m-ds-kpi-so">110/111</span>
          <span className="m-ds-kpi-sub">1 ngày chi nhánh lệch</span>
        </div>
        <div className="m-ds-kpi">
          <span className="m-ds-kpi-nhan">Sổ ↔ Hoá đơn</span>
          <span className="m-ds-kpi-so">110/111</span>
          <span className="m-ds-kpi-sub">1 ngày chi nhánh lệch</span>
        </div>
        <div className="m-ds-kpi">
          <span className="m-ds-kpi-nhan">Sổ ↔ Tiền</span>
          <span className="m-ds-kpi-so">110/111</span>
          <span className="m-ds-kpi-sub">1 ngày chi nhánh lệch</span>
        </div>
        <div className="m-ds-kpi">
          <span className="m-ds-kpi-nhan">Chờ xử lý</span>
          <span className="m-ds-kpi-so" style={{ color: conLai ? 'var(--red)' : 'var(--green)' }}>
            {conLai}
          </span>
          <span className="m-ds-kpi-sub">dòng lệch</span>
        </div>
      </div>

      {/* Tabs cặp đối soát */}
      <div className="m-ds-tabs">
        {CAP.map(c => {
          const so =
            c === 'Tất cả'
              ? conLai
              : ds.filter(l => l.cap === c && l.ttHienTai !== 'xong').length
          return (
            <button
              key={c}
              type="button"
              className={`m-ds-tab ${cap === c ? 'on' : ''}`}
              onClick={() => setCap(c)}
            >
              <span>{c}</span>
              <span className={`m-ds-tab-so ${so > 0 ? 'err' : ''}`}>{so}</span>
            </button>
          )
        })}
      </div>

      {/* Danh sách thẻ dòng lệch */}
      {dsLoc.length === 0 ? (
        <MTrong kieu="chung" tieuDe="Không còn dòng lệch nào" moTa="Mọi cặp đối soát đã khớp trong khoảng thời gian này" />
      ) : (
        <div className="m-ds-ds">
          {dsLoc.map(r => (
            <div
              key={r.id}
              className="m-ds-the"
              onClick={() => setDangXem(r)}
              role="button"
              tabIndex={0}
            >
              <div className="m-ds-the-dau">
                <span className="m-ds-cap">{r.cap}</span>
                <span className={`m-ds-tt ${r.ttHienTai === 'xong' ? 'ok' : r.ttHienTai === 'xem' ? 'warn' : 'err'}`}>
                  {r.ttHienTai === 'xong' ? 'Đã xử lý' : r.ttHienTai === 'xem' ? 'Đang xem' : 'Chưa xử lý'}
                </span>
              </div>
              <div className="m-ds-the-than">
                <div className="m-ds-so-lieu">
                  <span>Nguồn: {moneyD(r.nguonV)}</span>
                  <span>Sổ: {moneyD(r.soV)}</span>
                </div>
                <div
                  className="m-ds-lech"
                  style={{ color: r.lech === 0 ? 'var(--green)' : 'var(--red)' }}
                >
                  {r.lech > 0 ? '+' : ''}
                  {moneyD(r.lech)}
                </div>
              </div>
              <div className="m-ds-the-chan">
                <p className="m-ds-nghi">{r.nghi}</p>
                <div className="m-ds-cn-ngay">
                  <span>{r.cnT}</span>
                  <span>{r.ngay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nút chạy đối soát dính đáy */}
      <div className="m-ds-day">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%' }}
          onClick={chayDoiSoat}
        >
          <Icon n="refresh" className="ic sm" />
          <span>Đối soát lại</span>
        </button>
      </div>

      {/* Tấm nổi từ đáy: Chi tiết dòng lệch */}
      {dangXem && (
        <div className="m-ds-hop">
          <div className="overlay" onClick={dongSheet} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangXem.cap}</h3>
                <small className="muted">{dangXem.cnT} · {dangXem.ngay}</small>
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
              <div className="m-ds-ct-luoi">
                <div className="m-ds-ct-nhan">{dangXem.nguon}</div>
                <div className="m-ds-ct-val" style={{ fontWeight: 600 }}>
                  {moneyD(dangXem.nguonV)}
                </div>

                <div className="m-ds-ct-nhan">Theo sổ kế toán</div>
                <div className="m-ds-ct-val" style={{ fontWeight: 600 }}>
                  {moneyD(dangXem.soV)}
                </div>

                <div className="m-ds-ct-nhan">Chênh lệch</div>
                <div
                  className="m-ds-ct-val"
                  style={{
                    fontWeight: 700,
                    color: dangXem.lech === 0 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {dangXem.lech > 0 ? '+' : ''}
                  {moneyD(dangXem.lech)}
                </div>

                <div className="m-ds-ct-nhan">Nguyên nhân nghi ngờ</div>
                <div className="m-ds-ct-val">{dangXem.nghi}</div>

                <div className="m-ds-ct-nhan">Chứng từ liên quan</div>
                <div className="m-ds-ct-val">
                  <Link
                    to="/app/ban-hang/3-1-1"
                    className="btn sm ghost"
                    style={{ padding: '0 6px', height: 28 }}
                  >
                    <Icon n="doc" className="ic sm" />
                    <span>{dangXem.ct}</span>
                  </Link>
                </div>
              </div>

              <div className="f" style={{ marginTop: 12 }}>
                <label>Ghi chú xử lý</label>
                <textarea
                  className="inp"
                  rows={2}
                  placeholder="vd: Đã tải lại ca 2 từ FABi, khớp"
                />
              </div>
            </div>

            <div className="pn-chan">
              <button
                type="button"
                className="btn"
                onClick={() => toast('Đã tạo bút toán điều chỉnh nháp')}
              >
                Tạo bút toán điều chỉnh
              </button>
              <button
                type="button"
                className="btn pri"
                onClick={() => danhDauXuLy(dangXem.id)}
              >
                Đánh dấu đã xử lý
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
