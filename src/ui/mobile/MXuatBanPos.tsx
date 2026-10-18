import { useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, donViHienTai, loaiHinhDv, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CUA_HANG, DAILY, cnTen } from '../../data/mock'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { dmy, money } from '../format'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import {
  PTTT,
  chiaTheo,
  dongCuaPhieu,
  giamThueHkd,
  soFabi,
  ttHkd,
  theoDon,
  type XPos,
} from '../../modules/ban-hang/ChungTuBanHang'
import { useDaXoa } from '../generic/daXoa'

export const MXuatBanPos: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const hkd = loaiHinhDv(s, donViHienTai(s)) === 'hkd'
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieu !== 'khong' && s.goi !== 'F'
  const cnChon = cuaHangHienTai(s)

  // Khoảng ngày lọc
  const [thoiGian, setThoiGian] = useState<KhoangNgay>(() => thangNay())
  // Cửa hàng lọc
  const [cn, setCn] = useState<string>('')
  const [moChonCn, setMoChonCn] = useState(false)
  // Kênh bán lọc
  const [kenh, setKenh] = useState<string>('')
  const [moChonKenh, setMoChonKenh] = useState(false)
  // Tấm chi tiết đơn
  const [donDangXem, setDonDangXem] = useState<Row | null>(null)
  const [tabCt, setTabCt] = useState<'hang' | 'tt' | 'ht'>('hang')

  // Danh sách chứng từ theo cách đồng bộ FABi
  const tatCa = useMemo(() => {
    return DAILY.filter(x => x.date.getMonth() >= 8)
      .slice()
      .reverse()
      .flatMap(x => theoDon(x).reverse())   // FABi kéo chi tiết theo hoá đơn (T247)
      .map((x, i) => ({
        id: String(i),
        so: soFabi(`fabi-${x.seed}`),
        ngay: `${dmy(x.date)} ${x.gio}`,
        thang: x.date.getMonth() + 1,
        cn: cnTen(x.cn),
        x,
        kenh: x.kenh,
        dienGiai:
          x.loai === 'don'
            ? `Hoá đơn FABi ${x.kenh.toLowerCase()} ${x.gio} ngày ${dmy(x.date).slice(0, 5)}`
            : `Doanh thu ${x.kenh.toLowerCase()} ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`,
        doiTuong: 'Khách lẻ POS',
        tien: x.dt,
        thue: hkd ? 0 : x.vat,
        giamThue: hkd ? giamThueHkd(x.dt) : 0,
        tong: hkd ? x.dt - giamThueHkd(x.dt) : x.dt + x.vat,
        nguon: 'FABi',
        tt: i < 3 ? 'nhap' : 'ghi',
        ngayTao: `${dmy(x.date)} 23:30`,
        nguoiTao: 'Hệ thống',
      }))
  }, [hkd])

  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban, laDaXoa])

  // Lọc theo khoảng ngày, cửa hàng, kênh bán
  const list = useMemo(() => {
    return rows.filter(r => {
      const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.x?.cn !== cnChon.id) return false
      if (cn && r.x?.cn !== cn) return false
      if (kenh && r.kenh !== kenh) return false
      return true
    })
  }, [rows, thoiGian, cnChon, cn, kenh])

  // Lựa chọn cửa hàng
  const dsChonCn = useMemo(() => {
    return [
      { k: '', ten: 'Tất cả cửa hàng' },
      ...CUA_HANG.map(c => ({ k: c.id, ten: c.ten })),
    ]
  }, [])

  // Lựa chọn kênh
  const dsChonKenh = useMemo(() => {
    const setK = [...new Set(rows.map(r => String(r.kenh ?? '')).filter(Boolean))]
    return [
      { k: '', ten: 'Tất cả kênh' },
      ...setK.map(k => ({ k, ten: k })),
    ]
  }, [rows])

  const tenCnHienThi = cn ? CUA_HANG.find(c => c.id === cn)?.ten ?? 'Tất cả' : 'Tất cả'
  const tenKenhHienThi = kenh || 'Tất cả'

  // Tổng cộng
  const tongSoDon = list.length
  const tongTien = list.reduce((a, r) => a + Number(r.tong || 0), 0)

  // Mở đơn xem chi tiết
  const xemDon = (r: Row) => {
    setDonDangXem(r)
    setTabCt('hang')
  }

  // Dòng món của đơn đang xem
  const dsMon = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = donDangXem.x as XPos
    const dong0 = dongCuaPhieu(x)
    if (!hkd) return dong0
    const giam = chiaTheo(giamThueHkd(x.dt), dong0.map(d => d.dtTruocThue), 1)
    return dong0.map((d, i) => ({ ...d, giamThue: giam[i] }))
  }, [donDangXem, hkd])

  const tongGiamGia = useMemo(() => dsMon.reduce((a, m) => a + (m.giam || 0), 0), [dsMon])

  // Thông tin bổ trợ cho đơn đang xem
  const tenKhoDon = useMemo(() => {
    if (!donDangXem) return ''
    return CUA_HANG.find(c => c.ten === donDangXem.cn)?.kho[0] ?? 'Kho mặc định'
  }, [donDangXem])

  const ngayDate = useMemo(() => {
    if (!donDangXem?.x) return new Date()
    return donDangXem.x.date instanceof Date ? donDangXem.x.date : docNgay(donDangXem.ngay)
  }, [donDangXem])

  const ptttTen = useMemo(() => {
    if (!donDangXem?.x) return ''
    const x = donDangXem.x
    const ds = PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)
    return ds.length ? ds.join(', ') : 'Tiền mặt'
  }, [donDangXem])

  const dsPttt = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = hkd ? ttHkd(donDangXem.x) : donDangXem.x
    const ds = [
      { ht: 'Tiền mặt', tien: Number(x.tm || 0) },
      { ht: 'Chuyển khoản, QR', tien: Number(x.ck || 0) },
      { ht: 'Thẻ ngân hàng', tien: Number(x.the || 0) },
      { ht: 'GrabFood, ShopeeFood', tien: Number(x.app || 0) },
    ]
    const coTien = ds.filter(p => p.tien > 0)
    return coTien.length ? coTien : [{ ht: ptttTen || 'Tiền mặt', tien: Number(donDangXem.tong || 0) }]
  }, [donDangXem, ptttTen, hkd])

  const htButToan = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = hkd ? ttHkd(donDangXem.x) : donDangXem.x
    return [
      { dg: 'Thu tiền mặt', no: '1111', co: hkd ? '5111' : '5111, 33311', tien: Number(x.tm || 0) },
      { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: hkd ? '5111' : '5111, 33311', tien: Number(x.ck || 0) + Number(x.the || 0) },
      { dg: 'Phải thu app giao đồ ăn', no: '131', co: hkd ? '5111' : '5111, 33311', tien: Number(x.app || 0) },
      { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: Number(x.gv || 0) },
    ].filter(b => b.tien > 0)
  }, [donDangXem, hkd])

  const soRows = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = hkd ? ttHkd(donDangXem.x) : donDangXem.x
    return [
      { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: Number(x.dt || 0) },
      { so: 'Sổ theo dõi thuế GTGT', tien: Number(x.vat || 0) },
      { so: 'Sổ tiền mặt', tien: Number(x.tm || 0) },
      { so: 'Sổ tiền gửi ngân hàng', tien: Number(x.ck || 0) + Number(x.the || 0) },
    ].filter(s => s.tien > 0)
  }, [donDangXem, hkd])

  return (
    <div className="m-pos-khung">
      {/* Thanh đầu: Các chip lọc và nút đồng bộ */}
      <div className="m-pos-dau">
        <div className="m-pos-chip-hang">
          <ChonKhoangNgay value={thoiGian} onChange={setThoiGian} />

          {!cnChon && (
            <button
              type="button"
              className={`m-pos-chip${cn ? ' on' : ''}`}
              onClick={() => setMoChonCn(true)}
            >
              <span>Kho/CN: {tenCnHienThi}</span>
              <Icon n="chevd" className="ic sm" />
            </button>
          )}

          <button
            type="button"
            className={`m-pos-chip${kenh ? ' on' : ''}`}
            onClick={() => setMoChonKenh(true)}
          >
            <span>Kênh: {tenKenhHienThi}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
        </div>

      </div>

      {/* Danh sách đơn dạng thẻ */}
      {list.length === 0 ? (
        <MTrong kieu="tim" tieuDe="Không có đơn xuất bán POS" moTa="Thử đổi khoảng thời gian hoặc kênh bán khác" />
      ) : (
        <div className="m-pos-ds">
          {list.map(r => {
            const laChuaGhi = r.tt === 'nhap' && ghi
            const ttNhan = laChuaGhi ? 'Chưa ghi sổ' : 'Đã ghi sổ'

            return (
              <div
                key={r.id}
                className="m-pos-the"
                onClick={() => xemDon(r)}
                role="button"
                tabIndex={0}
              >
                <div className="m-pos-the-dau">
                  <span className="m-pos-so">#{r.so}</span>
                  <span className="m-pos-gio">{r.x?.gio ?? ''}</span>
                </div>

                <div className="m-pos-the-than">
                  <span className="m-pos-kenh">{r.kenh}</span>
                  <span className="m-pos-cn">{r.cn}</span>
                </div>

                <div className="m-pos-the-chan">
                  <span className="m-pos-tien">{money(r.tong)} đ</span>
                  {ghi && (
                    <span className={`m-pos-tt ${laChuaGhi ? 'chua-ghi' : 'da-ghi'}`}>
                      {ttNhan}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dải tổng cuối danh sách */}
      <div className="m-pos-tong-dai">
        <span>Tổng: <b>{tongSoDon}</b> đơn</span>
        <span>Doanh thu: <b>{money(tongTien)} đ</b></span>
      </div>

      {/* Sheet chọn cửa hàng */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn cửa hàng"
        ds={dsChonCn}
        chon={cn}
        onChon={setCn}
      />

      {/* Sheet chọn kênh */}
      <MChon
        mo={moChonKenh}
        onDong={() => setMoChonKenh(false)}
        tieuDe="Chọn kênh bán hàng"
        ds={dsChonKenh}
        chon={kenh}
        onChon={setKenh}
      />

      {/* Tấm nổi từ đáy: Chi tiết đơn hàng */}
      {donDangXem && (
        <div className="m-form-dm m-pos-ct-hop">
          <div className="overlay" onClick={() => setDonDangXem(null)} />
          <aside className="pn-hop m-pos-ct-hop-than">
            <div className="pn-dau m-pos-ct-dau">
              <div className="m-pos-ct-dau-trai">
                <div className="m-pos-ct-tieu-de-hang">
                  <h3>Đơn #{donDangXem.so}</h3>
                  {ghi && (
                    <span className={`m-pos-tt ${donDangXem.tt === 'nhap' ? 'chua-ghi' : 'da-ghi'}`}>
                      {donDangXem.tt === 'nhap' ? 'Chưa ghi sổ' : 'Đã ghi sổ'}
                    </span>
                  )}
                </div>
                <div className="m-pos-ct-phu">
                  {donDangXem.ngay} · {donDangXem.kenh} ({donDangXem.cn})
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setDonDangXem(null)}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than m-pos-ct-than">
              {/* Thẻ thông tin đơn */}
              <div className="m-pos-ct-the">
                <div className="m-pos-ct-the-tieu-de">Thông tin đơn</div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Kho xuất</span>
                  <span className="m-pos-ct-tri dam">{tenKhoDon}</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Khách hàng</span>
                  <span className="m-pos-ct-tri">Khách lẻ POS</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Phương thức thanh toán</span>
                  <span className="m-pos-ct-tri dam">{ptttTen}</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Ngày chứng từ</span>
                  <span className="m-pos-ct-tri">{dmy(ngayDate)}</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Thời gian xuất</span>
                  <span className="m-pos-ct-tri">{donDangXem.ngay}</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Kênh bán hàng</span>
                  <span className="m-pos-ct-tri">{donDangXem.kenh}</span>
                </div>
                <div className="m-pos-ct-dong-tt">
                  <span className="m-pos-ct-nhan">Cửa hàng</span>
                  <span className="m-pos-ct-tri">{donDangXem.cn}</span>
                </div>
                {donDangXem.dienGiai && (
                  <div className="m-pos-ct-dong-tt">
                    <span className="m-pos-ct-nhan">Ghi chú</span>
                    <span className="m-pos-ct-tri">{donDangXem.dienGiai}</span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="tabs m-pos-ct-tabs">
                <button
                  type="button"
                  className={tabCt === 'hang' ? 'on' : ''}
                  onClick={() => setTabCt('hang')}
                >
                  Dòng hàng ({dsMon.length})
                </button>
                <button
                  type="button"
                  className={tabCt === 'tt' ? 'on' : ''}
                  onClick={() => setTabCt('tt')}
                >
                  Thanh toán
                </button>
                {kieu !== 'khong' && (
                  <button
                    type="button"
                    className={tabCt === 'ht' ? 'on' : ''}
                    onClick={() => setTabCt('ht')}
                  >
                    {kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'}
                  </button>
                )}
              </div>

              {/* Tab Dòng hàng */}
              {tabCt === 'hang' && (
                <div className="m-pos-ct-khoi-hang">
                  <div className="m-pos-ct-mon-ds">
                    {dsMon.map((m, idx) => (
                      <div key={idx} className="m-pos-mon-the">
                        <div className="m-pos-mon-hang1">
                          <span className="m-pos-mon-ten">{m.ten}</span>
                          <span className="m-pos-mon-tien-chinh">{money(m.tien)} đ</span>
                        </div>
                        <div className="m-pos-mon-hang2">
                          <span className="m-pos-mon-ma-dvt">{m.ma} · {m.dvt}</span>
                          <span className="m-pos-mon-sl-gia">{m.sl} × {money(m.gia)} đ</span>
                        </div>
                        {(m.giam > 0 || (hkd && (m.giamThue ?? 0) > 0) || (!hkd && (m.thue ?? 0) > 0)) && (
                          <div className="m-pos-mon-hang3">
                            {m.giam > 0 && (
                              <div className="m-pos-mon-phu-dong">
                                <span>Giảm giá ({m.pt}%)</span>
                                <span>-{money(m.giam)} đ</span>
                              </div>
                            )}
                            {hkd && (m.giamThue ?? 0) > 0 && (
                              <div className="m-pos-mon-phu-dong">
                                <span>Giảm thuế GTGT</span>
                                <span>-{money(m.giamThue)} đ</span>
                              </div>
                            )}
                            {!hkd && (m.thue ?? 0) > 0 && (
                              <div className="m-pos-mon-phu-dong">
                                <span>Thuế GTGT ({m.ts}%)</span>
                                <span>{money(m.thue)} đ</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Thẻ các dòng tổng (T392) */}
                  <div className="m-pos-ct-the m-pos-ct-tong-the">
                    <div className="m-pos-ct-dong-tt">
                      <span className="m-pos-ct-nhan">Tổng thành tiền</span>
                      <span className="m-pos-ct-tri">{money(Number(donDangXem.tien || 0) + tongGiamGia)} đ</span>
                    </div>
                    <div className="m-pos-ct-dong-tt">
                      <span className="m-pos-ct-nhan">Tổng giảm giá chiết khấu</span>
                      <span className="m-pos-ct-tri">{tongGiamGia > 0 ? `-${money(tongGiamGia)} đ` : '0 đ'}</span>
                    </div>
                    {hkd ? (
                      <div className="m-pos-ct-dong-tt">
                        <span className="m-pos-ct-nhan">Giảm thuế GTGT</span>
                        <span className="m-pos-ct-tri text-green">-{money(donDangXem.giamThue)} đ</span>
                      </div>
                    ) : (
                      <div className="m-pos-ct-dong-tt">
                        <span className="m-pos-ct-nhan">Tổng VAT</span>
                        <span className="m-pos-ct-tri">{money(donDangXem.thue || 0)} đ</span>
                      </div>
                    )}
                    <div className="m-pos-ct-dong-tt m-pos-ct-dong-tong">
                      <span className="m-pos-ct-nhan dam">Tổng tiền thanh toán</span>
                      <span className="m-pos-ct-tri dam m-pos-tien-to">{money(donDangXem.tong)} đ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Thanh toán */}
              {tabCt === 'tt' && (
                <div className="m-pos-ct-the">
                  <div className="m-pos-ct-the-tieu-de">Hình thức thanh toán</div>
                  {dsPttt.map((p, idx) => (
                    <div key={idx} className="m-pos-ct-dong-tt">
                      <span className="m-pos-ct-nhan">{p.ht}</span>
                      <span className="m-pos-ct-tri dam">{money(p.tien)} đ</span>
                    </div>
                  ))}
                  <div className="m-pos-ct-dong-tt m-pos-ct-dong-tong">
                    <span className="m-pos-ct-nhan dam">Tổng thanh toán</span>
                    <span className="m-pos-ct-tri dam m-pos-tien-to">{money(donDangXem.tong)} đ</span>
                  </div>
                </div>
              )}

              {/* Tab Hạch toán */}
              {tabCt === 'ht' && (
                <div className="m-pos-ct-the">
                  {kieu === 'noco' && (
                    <>
                      <div className="m-pos-ct-the-tieu-de">Bút toán hạch toán</div>
                      {htButToan.map((b, idx) => (
                        <div key={idx} className="m-pos-ht-muc">
                          <div className="m-pos-ht-dong-dau">
                            <span className="m-pos-ht-dg">{b.dg}</span>
                            <span className="m-pos-ht-tien dam">{money(b.tien)} đ</span>
                          </div>
                          <div className="m-pos-ht-tk">
                            <span>Nợ <code className="code">{b.no}</code></span>
                            <span>Có <code className="code">{b.co}</code></span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {kieu === 'so' && (
                    <>
                      <div className="m-pos-ct-the-tieu-de">Ghi vào sổ</div>
                      {soRows.map((sRow, idx) => (
                        <div key={idx} className="m-pos-ct-dong-tt">
                          <span className="m-pos-ct-nhan">{sRow.so}</span>
                          <span className="m-pos-ct-tri dam">{money(sRow.tien)} đ</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pn-chan">
              <button
                type="button"
                className="btn"
                style={{ width: '100%' }}
                onClick={() => setDonDangXem(null)}
              >
                Đóng
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  )
}
