// Chi phí NVL trong tháng gói Free trên điện thoại (T394): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ.
// Xem mọi cửa hàng: danh sách từng cửa hàng với cách tính riêng, bấm dòng xem cửa hàng đó.
// Xem một cửa hàng: chi tiết theo cách tính; cách nhập mua có liên kết mở danh sách phiếu mua hàng.
// T611: bấm cửa hàng đổi luôn cửa hàng trên thanh đầu; đổi cách tính ngay trong màn như web; cách nhập tay nhập giá thành từng món.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { HopXacNhan } from '../LocNangCao'
import { money, moneyD, pct } from '../format'
import {
  CACH_NVL,
  DS_CACH_NVL,
  cachNvlHienTai,
  daKhoaThang,
  datCachNvl,
  datGiaThanhTay,
  giaThanhIvt,
  giaThanhTayCua,
  kyDauChuaKhoa,
  moTaCach,
  monBanKy,
  nvlKy,
  phieuMuaKy,
  tenKy,
  tieuHaoKy,
  type CachNvl,
} from '../../modules/home/chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function MChiPhiNvl(_: ScreenProps) {
  const { s, set, toast } = useSession()
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
  const [moChonCach, setMoChonCach] = useState(false)
  const [doiCach, setDoiCach] = useState<CachNvl | null>(null)
  const khoa = daKhoaThang(thang)

  return (
    <div className="m-standard-cpt">
      {/* Thẻ tổng ở đầu */}
      <div className="m-standard-cpt-tong-the">
        <div className="m-standard-cpt-tong-nhan">
          Tổng chi phí NVL tháng {thang}/2026{cn ? ` · ${cn.ten}` : ''}
          <small className="m-standard-cpt-tong-phu">
            {moTaCach(tong.ds)} · {pct(dt ? tong.tien / dt : 0)} doanh thu
          </small>
        </div>
        <div className="m-standard-cpt-tong-so">{moneyD(tong.tien)}</div>
        {cn && x?.cach === 'ivt' && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            = Giá thành món <b>{moneyD(x.gtMon ?? 0)}</b> + Tiêu hao <b>{moneyD(x.tieuHao ?? 0)}</b>
          </div>
        )}
      </div>

      {/* Khi chưa chọn cửa hàng: danh sách cửa hàng */}
      {!cn && (
        <div className="m-standard-cpt-ds">
          {tong.ds.map(d => (
            <div
              key={d.cn}
              className="m-standard-cpt-dong"
              onClick={() => set({ cuaHang: d.cn })}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="m-standard-cpt-ic">
                <Icon n="khohang" className="ic sm" />
              </div>
              <div className="m-standard-cpt-info">
                <div className="m-standard-cpt-ten">{d.ten}</div>
                <div className="m-standard-cpt-phu">{CACH_NVL[d.cach].ten}</div>
              </div>
              <div className="m-standard-cpt-so">
                <div className="m-standard-cpt-tien">{moneyD(d.tien)}</div>
                <div className="m-standard-cpt-phantram">{pct(d.dt ? d.tien / d.dt : 0)} DT</div>
              </div>
              <Icon n="chevr" className="ic sm m-standard-cpt-mui" />
            </div>
          ))}
        </div>
      )}

      {/* Khi đã chọn một cửa hàng */}
      {cn && x && (
        <>
          {/* Dòng cách tính như web: tên, mô tả, nút Đổi cách tính (T611) */}
          <div className="m-nvl-cach">
            <span className="m-nvl-cach-chu">
              Cách tính: <b>{CACH_NVL[x.cach].ten}</b> · {CACH_NVL[x.cach].mota}
            </span>
            {!khoa && (
              <button type="button" className="btn sm ghost m-nvl-cach-nut" onClick={() => setMoChonCach(true)}>
                Đổi cách tính
              </button>
            )}
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
          {khoa && (
            <div className="m-nvl-ghi">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</div>
          )}

          {/* Cách tính theo phiếu nhập mua */}
          {x.cach === 'nhap' && (() => {
            const dsPhieu = phieuMuaKy(cn.id, thang)
            return (
              <>
                <div className="m-standard-cpt-ds">
                  {dsPhieu.map(r => (
                    <div key={r.so} className="m-standard-cpt-dong">
                      <div className="m-standard-cpt-ic">
                        <Icon n="truck" className="ic sm" />
                      </div>
                      <div className="m-standard-cpt-info">
                        <div className="m-standard-cpt-ten">{r.so}</div>
                        <div className="m-standard-cpt-phu">{r.ngay} · {r.doiTuong}</div>
                      </div>
                      <div className="m-standard-cpt-so">
                        <div className="m-standard-cpt-tien">{moneyD(Number(r.tong))}</div>
                        <div className="m-standard-cpt-phantram">{moneyD(Number(r.tien))} tiền hàng</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="m-standard-day-nut">
                  <Link to="/app/mua-hang/4-1-1" className="m-standard-nut-chinh">
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
                  <div className="m-standard-cpt-ds">
                    {mon.map(m => {
                      const donGia = gt.get(m.ma) ?? 0
                      return (
                        <div key={m.ma} className="m-standard-cpt-dong">
                          <div className="m-standard-cpt-info">
                            <div className="m-standard-cpt-ten">{m.ten}</div>
                            <div className="m-standard-cpt-phu">
                              {m.sl} {m.dvt} × {money(donGia)}
                            </div>
                          </div>
                          <div className="m-standard-cpt-so">
                            <div className="m-standard-cpt-tien">{moneyD(m.sl * donGia)}</div>
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
                    <div className="m-standard-cpt-ds">
                      {dsTh.map(r => (
                        <div key={r.so} className="m-standard-cpt-dong">
                          <div className="m-standard-cpt-info">
                            <div className="m-standard-cpt-ten">{r.so}</div>
                            <div className="m-standard-cpt-phu">
                              {r.ngay} · {r.tenLoai}{r.dienGiai ? ` · ${r.dienGiai}` : ''}
                            </div>
                          </div>
                          <div className="m-standard-cpt-so">
                            <div className="m-standard-cpt-tien">{moneyD(r.gt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )
          })()}

          {/* Cách tính nhập tay: nhập giá thành từng món, ô vàng là món chưa có giá (T611) */}
          {x.cach === 'tay' && (
            <>
              {x.thieuGia > 0 && !khoa && (
                <div className="m-nvl-ghi canh-bao">Còn {x.thieuGia} món chưa có giá thành, đang tính bằng 0. Nhập giá thành vào ô tô vàng.</div>
              )}
              <div className="m-standard-cpt-ds">
                {mon.map(m => {
                  const g = giaThanhTayCua(s, cn.id, thang, m.ma)
                  return (
                    <div key={m.ma} className="m-standard-cpt-dong m-nvl-tay">
                      <div className="m-standard-cpt-info">
                        <div className="m-standard-cpt-ten">{m.ten}</div>
                        <div className="m-standard-cpt-phu">
                          {m.sl} {m.dvt} · {moneyD(g !== undefined ? m.sl * g : 0)}
                        </div>
                      </div>
                      {khoa ? (
                        <div className="m-standard-cpt-so">
                          <div className="m-standard-cpt-tien">{money(g ?? 0)}</div>
                        </div>
                      ) : (
                        <label className="m-nvl-gia-o">
                          <input
                            className={`inp nvl-gia${g === undefined ? ' thieu' : ''}`}
                            inputMode="numeric"
                            placeholder="Giá thành"
                            aria-label={`Giá thành ${m.ten}`}
                            value={g === undefined ? '' : money(g)}
                            onChange={e => {
                              const so = e.target.value.replace(/\D/g, '')
                              set(datGiaThanhTay(s, cn.id, thang, m.ma, so ? Number(so) : undefined))
                            }}
                          />
                          <small>đ / {m.dvt}</small>
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {cn && (
        <MChon
          mo={moChonCach}
          tieuDe="Đổi cách tính chi phí NVL"
          ds={DS_CACH_NVL.map(c => ({ k: c.v, ten: c.t, moTa: CACH_NVL[c.v].mota }))}
          chon={cachNvlHienTai(s, cn.id)}
          onChon={k => {
            setMoChonCach(false)
            if (k !== cachNvlHienTai(s, cn.id)) setDoiCach(k as CachNvl)
          }}
          onDong={() => setMoChonCach(false)}
        />
      )}

      {cn && doiCach && (
        <HopXacNhan
          tieuDe="Đổi cách tính chi phí NVL"
          nut="Đồng ý"
          nutDo={false}
          onDong={() => setDoiCach(null)}
          onDongY={() => {
            set(datCachNvl(s, cn.id, doiCach))
            setDoiCach(null)
            toast(`Đã đổi cách tính chi phí NVL của ${cn.ten}`)
          }}
        >
          {cn.ten} tính chi phí NVL {CACH_NVL[doiCach].theo}: {CACH_NVL[doiCach].mota[0].toLowerCase() + CACH_NVL[doiCach].mota.slice(1)}.
          Tính lại từ tháng {tenKy(kyDauChuaKhoa())}, tháng đầu chưa khoá sổ. Các tháng đã khoá sổ giữ nguyên số.
          {doiCach === 'tay' ? ' Nhập giá thành từng món ngay trong màn này, món chưa có giá thành tính bằng 0.' : ''}
        </HopXacNhan>
      )}
    </div>
  )
}
