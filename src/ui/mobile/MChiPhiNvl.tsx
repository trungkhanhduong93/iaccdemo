// Chi phí NVL trong tháng gói Free trên điện thoại (T394): mở từ thẻ Giá vốn nguyên vật liệu ở trang chủ.
// Xem mọi cửa hàng: danh sách từng cửa hàng với cách tính riêng, bấm dòng xem cửa hàng đó.
// Xem một cửa hàng: chi tiết theo cách tính; cách nhập mua có liên kết mở danh sách phiếu mua hàng.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { money, moneyD, pct } from '../format'
import {
  CACH_NVL,
  giaThanhIvt,
  giaThanhTayCua,
  moTaCach,
  monBanKy,
  nvlKy,
  phieuMuaKy,
  tieuHaoKy,
} from '../../modules/home/chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function MChiPhiNvl(_: ScreenProps) {
  const { s } = useSession()
  const [tham, setTham] = useSearchParams()
  const thang = THANG.includes(Number(tham.get('thang'))) ? Number(tham.get('thang')) : 10
  const cnThanh = cuaHangHienTai(s)
  const cn = cnThanh ?? CUA_HANG.find(c => c.id === tham.get('cn'))

  const doi = (p: Record<string, string | undefined>) => {
    const n = new URLSearchParams(tham)
    Object.entries(p).forEach(([k, v]) => (v === undefined ? n.delete(k) : n.set(k, v)))
    setTham(n, { replace: true })
  }

  const tong = nvlKy(s, cn ? [cn.id] : [], thang)
  const dt = tong.ds.reduce((a, x) => a + x.dt, 0)
  const x = cn ? tong.ds[0] : undefined
  const mon = cn ? monBanKy(cn.id, thang) : []

  const [tab, setTab] = useState<'mon' | 'th'>('mon')
  const [locLoai, setLocLoai] = useState('')

  return (
    <div className="m-free-cpt">
      {/* Thẻ tổng ở đầu */}
      <div className="m-free-cpt-tong-the">
        <div className="m-free-cpt-tong-nhan">
          Tổng chi phí NVL tháng {thang}/2026{cn ? ` · ${cn.ten}` : ''}
          <small className="m-free-cpt-tong-phu">
            {moTaCach(tong.ds)} · {pct(dt ? tong.tien / dt : 0)} doanh thu
          </small>
        </div>
        <div className="m-free-cpt-tong-so">{moneyD(tong.tien)}</div>
        {cn && x?.cach === 'ivt' && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            = Giá thành món <b>{moneyD(x.gtMon ?? 0)}</b> + Tiêu hao <b>{moneyD(x.tieuHao ?? 0)}</b>
          </div>
        )}
      </div>

      {/* Khi chưa chọn cửa hàng: danh sách cửa hàng */}
      {!cn && (
        <div className="m-free-cpt-ds">
          {tong.ds.map(d => (
            <div
              key={d.cn}
              className="m-free-cpt-dong"
              onClick={() => doi({ cn: d.cn })}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="m-free-cpt-ic">
                <Icon n="khohang" className="ic sm" />
              </div>
              <div className="m-free-cpt-info">
                <div className="m-free-cpt-ten">{d.ten}</div>
                <div className="m-free-cpt-phu">{CACH_NVL[d.cach].ten}</div>
              </div>
              <div className="m-free-cpt-so">
                <div className="m-free-cpt-tien">{moneyD(d.tien)}</div>
                <div className="m-free-cpt-phantram">{pct(d.dt ? d.tien / d.dt : 0)} DT</div>
              </div>
              <Icon n="chevr" className="ic sm m-free-cpt-mui" />
            </div>
          ))}
        </div>
      )}

      {/* Khi đã chọn một cửa hàng */}
      {cn && x && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Cách tính: <b>{CACH_NVL[x.cach].ten}</b>
            </span>
            {!cnThanh && (
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => doi({ cn: undefined })}
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                Mọi cửa hàng
              </button>
            )}
          </div>

          {/* Cách tính theo phiếu nhập mua */}
          {x.cach === 'nhap' && (() => {
            const dsPhieu = phieuMuaKy(cn.id, thang)
            return (
              <>
                <div className="m-free-cpt-ds">
                  {dsPhieu.map(r => (
                    <div key={r.so} className="m-free-cpt-dong">
                      <div className="m-free-cpt-ic">
                        <Icon n="truck" className="ic sm" />
                      </div>
                      <div className="m-free-cpt-info">
                        <div className="m-free-cpt-ten">{r.so}</div>
                        <div className="m-free-cpt-phu">{r.ngay} · {r.doiTuong}</div>
                      </div>
                      <div className="m-free-cpt-so">
                        <div className="m-free-cpt-tien">{moneyD(Number(r.tong))}</div>
                        <div className="m-free-cpt-phantram">{moneyD(Number(r.tien))} tiền hàng</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="m-free-day-nut">
                  <Link to="/app/mua-hang/4-1-1" className="m-free-nut-chinh">
                    <Icon n="truck" className="ic sm" />
                    <span>Xem danh sách phiếu mua hàng</span>
                  </Link>
                </div>
              </>
            )
          })()}

          {/* Cách tính theo iPOS Inventory */}
          {x.cach === 'ivt' && (() => {
            const gt = giaThanhIvt(cn.id, thang)
            const th = tieuHaoKy(cn.id, thang)
            const dsTh = locLoai ? th.ds.filter(r => r.tenLoai === locLoai) : th.ds
            return (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <button
                    type="button"
                    className={`btn sm ${tab === 'mon' ? 'pri' : 'ghost'}`}
                    onClick={() => setTab('mon')}
                  >
                    Giá thành món ({mon.length})
                  </button>
                  <button
                    type="button"
                    className={`btn sm ${tab === 'th' ? 'pri' : 'ghost'}`}
                    onClick={() => setTab('th')}
                  >
                    NVL tiêu hao ({th.ds.length})
                  </button>
                </div>

                {tab === 'mon' && (
                  <div className="m-free-cpt-ds">
                    {mon.map(m => {
                      const donGia = gt.get(m.ma) ?? 0
                      return (
                        <div key={m.ma} className="m-free-cpt-dong">
                          <div className="m-free-cpt-info">
                            <div className="m-free-cpt-ten">{m.ten}</div>
                            <div className="m-free-cpt-phu">
                              {m.sl} {m.dvt} × {money(donGia)}
                            </div>
                          </div>
                          <div className="m-free-cpt-so">
                            <div className="m-free-cpt-tien">{moneyD(m.sl * donGia)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {tab === 'th' && (
                  <>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                      {['', 'Xuất huỷ', 'Xuất điều chỉnh', 'Nhập điều chỉnh'].map(loai => (
                        <button
                          key={loai}
                          type="button"
                          className={`btn sm ${locLoai === loai ? 'pri' : 'ghost'}`}
                          onClick={() => setLocLoai(loai)}
                          style={{ fontSize: 12, padding: '2px 8px', whiteSpace: 'nowrap' }}
                        >
                          {loai || 'Tất cả'}
                        </button>
                      ))}
                    </div>
                    <div className="m-free-cpt-ds">
                      {dsTh.map(r => (
                        <div key={r.so} className="m-free-cpt-dong">
                          <div className="m-free-cpt-info">
                            <div className="m-free-cpt-ten">{r.so}</div>
                            <div className="m-free-cpt-phu">
                              {r.ngay} · {r.tenLoai}{r.dienGiai ? ` · ${r.dienGiai}` : ''}
                            </div>
                          </div>
                          <div className="m-free-cpt-so">
                            <div className="m-free-cpt-tien">{moneyD(r.gt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )
          })()}

          {/* Cách tính nhập tay */}
          {x.cach === 'tay' && (
            <div className="m-free-cpt-ds">
              {mon.map(m => {
                const g = giaThanhTayCua(s, cn.id, thang, m.ma)
                return (
                  <div key={m.ma} className="m-free-cpt-dong">
                    <div className="m-free-cpt-info">
                      <div className="m-free-cpt-ten">{m.ten}</div>
                      <div className="m-free-cpt-phu">
                        {m.sl} {m.dvt}{g !== undefined ? ` · ${money(g)} / ${m.dvt}` : ' · Chưa có giá'}
                      </div>
                    </div>
                    <div className="m-free-cpt-so">
                      <div className="m-free-cpt-tien">{moneyD(g !== undefined ? m.sl * g : 0)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
