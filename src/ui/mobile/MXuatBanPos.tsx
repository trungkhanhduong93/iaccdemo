import { useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, gtgtTyLe, useSession } from '../../app/session'
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
  const tyLe = gtgtTyLe(s)   // GTGT theo % doanh thu: Giảm thuế GTGT thay VAT (T163, T450)
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
  const [moTong, setMoTong] = useState(true)

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
        thue: tyLe ? 0 : x.vat,
        giamThue: tyLe ? giamThueHkd(x.dt) : 0,
        tong: tyLe ? x.dt - giamThueHkd(x.dt) : x.dt + x.vat,
        nguon: 'FABi',
        tt: i < 3 ? 'nhap' : 'ghi',
        ngayTao: `${dmy(x.date)} 23:30`,
        nguoiTao: 'Hệ thống',
      }))
  }, [tyLe])

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
    setMoTong(true)
  }

  // Dòng món của đơn đang xem
  const dsMon = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = donDangXem.x as XPos
    const dong0 = dongCuaPhieu(x)
    if (!tyLe) return dong0
    const giam = chiaTheo(giamThueHkd(x.dt), dong0.map(d => d.dtTruocThue), 1)
    return dong0.map((d, i) => ({ ...d, giamThue: giam[i] }))
  }, [donDangXem, tyLe])

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
    const x = tyLe ? ttHkd(donDangXem.x) : donDangXem.x
    const ds = [
      { ht: 'Tiền mặt', tien: Number(x.tm || 0) },
      { ht: 'Chuyển khoản, QR', tien: Number(x.ck || 0) },
      { ht: 'Thẻ ngân hàng', tien: Number(x.the || 0) },
      { ht: 'GrabFood, ShopeeFood', tien: Number(x.app || 0) },
    ]
    const coTien = ds.filter(p => p.tien > 0)
    return coTien.length ? coTien : [{ ht: ptttTen || 'Tiền mặt', tien: Number(donDangXem.tong || 0) }]
  }, [donDangXem, ptttTen, tyLe])

  const htButToan = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = tyLe ? ttHkd(donDangXem.x) : donDangXem.x
    return [
      { dg: 'Thu tiền mặt', no: '1111', co: tyLe ? '5111' : '5111, 33311', tien: Number(x.tm || 0) },
      { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: tyLe ? '5111' : '5111, 33311', tien: Number(x.ck || 0) + Number(x.the || 0) },
      { dg: 'Phải thu app giao đồ ăn', no: '131', co: tyLe ? '5111' : '5111, 33311', tien: Number(x.app || 0) },
      { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: Number(x.gv || 0) },
    ].filter(b => b.tien > 0)
  }, [donDangXem, tyLe])

  const soRows = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = tyLe ? ttHkd(donDangXem.x) : donDangXem.x
    return [
      { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: Number(x.dt || 0) },
      { so: 'Sổ theo dõi thuế GTGT', tien: Number(x.vat || 0) },
      { so: 'Sổ tiền mặt', tien: Number(x.tm || 0) },
      { so: 'Sổ tiền gửi ngân hàng', tien: Number(x.ck || 0) + Number(x.the || 0) },
    ].filter(s => s.tien > 0)
  }, [donDangXem, tyLe])

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
                  {ghi && (
                    <span className={`m-pos-tt ${laChuaGhi ? 'chua-ghi' : 'da-ghi'}`}>
                      {ttNhan}
                    </span>
                  )}
                </div>

                <div className="m-pos-the-than">
                  <span className="m-pos-kenh">{r.kenh}</span>
                  <span className="m-pos-cn">{r.cn}</span>
                </div>

                <div className="m-pos-the-chan">
                  <span className="m-pos-ngay">{r.ngay}</span>
                  <span className="m-pos-tien">{money(r.tong)} đ</span>
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

      {/* Chi tiết đơn hàng (T425: theo khuôn thẻ phân bổ, thanh đầu sát mép trên full-width) */}
      {donDangXem && (
        <div className="m-pb-man m-pos-ct-man">
          <header className="m-pb-thanh-dau m-pos-ct-dau">
            <button
              type="button"
              className="m-pos-ct-x"
              onClick={() => setDonDangXem(null)}
              aria-label="Đóng"
            >
              <Icon n="x" />
            </button>
            <div className="m-pos-ct-td">
              <b>
                Đơn #{donDangXem.so}
                {ghi && (
                  <span className={`m-pos-tt ${donDangXem.tt === 'nhap' ? 'chua-ghi' : 'da-ghi'}`}>
                    {donDangXem.tt === 'nhap' ? 'Chưa ghi sổ' : 'Đã ghi sổ'}
                  </span>
                )}
              </b>
            </div>
            <span className="m-pos-ct-x-placeholder" />
          </header>

          <div className="m-pb-noi-dung m-pos-ct-than">
              {/* Thẻ thông tin đơn */}
              <div className="m-pos-ct-the">
                <div className="m-pos-ct-nhom-t">Thông tin đơn</div>
                <div className="m-pos-ct-ttin">
                  <div>
                    <small>Kho xuất</small>
                    <b>{tenKhoDon}</b>
                  </div>
                  <div>
                    <small>Khách hàng</small>
                    <b>{donDangXem.doiTuong || 'Khách lẻ POS'}</b>
                  </div>
                  <div>
                    <small>Thanh toán</small>
                    <b>{ptttTen}</b>
                  </div>
                  <div>
                    <small>Thời gian xuất</small>
                    <b>{donDangXem.ngay}</b>
                  </div>
                  {donDangXem.dienGiai && (
                    <div className="full">
                      <small>Ghi chú</small>
                      <b>{donDangXem.dienGiai}</b>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="m-pos-ct-tab-the">
                <button
                  type="button"
                  className={tabCt === 'hang' ? 'on' : ''}
                  onClick={() => setTabCt('hang')}
                >
                  Mặt hàng ({dsMon.length})
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

              {/* Tab Mặt hàng */}
              {tabCt === 'hang' && (
                <div className="m-pos-ct-the m-pos-ct-mon-the">
                  {dsMon.map((m, idx) => {
                    const phuRight = (() => {
                      const parts: string[] = []
                      if (m.giam > 0) parts.push(`giảm -${money(m.giam)}`)
                      if (tyLe && (m.giamThue ?? 0) > 0) parts.push(`giảm thuế -${money(m.giamThue)}`)
                      else if (!tyLe && (m.thue ?? 0) > 0) parts.push(`VAT ${money(m.thue)}`)
                      return parts.join(' · ')
                    })()
                    return (
                      <div key={idx} className="m-pos-mon-dong-b">
                        <b>{m.ten}</b>
                        <span className="m-pos-mon-tien-b num">{money(m.tien)}</span>
                        <span className="m-pos-mon-ct-b num">{m.ma} · {m.sl} {m.dvt} × {money(m.gia)}</span>
                        <span className="m-pos-mon-ct2-b num">{phuRight}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tab Thanh toán */}
              {tabCt === 'tt' && (
                <div className="m-pos-ct-the">
                  <div className="m-pos-ct-nhom-t">Hình thức thanh toán</div>
                  <div className="m-pos-ct-ttin">
                    {dsPttt.map((p, idx) => (
                      <div key={idx} className="full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{p.ht}</span>
                        <b className="num" style={{ fontSize: '13px' }}>{money(p.tien)} đ</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Hạch toán */}
              {tabCt === 'ht' && (
                <div className="m-pos-ct-the">
                  {kieu === 'noco' && (
                    <>
                      <div className="m-pos-ct-nhom-t">Bút toán hạch toán</div>
                      <div style={{ padding: '4px 14px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      </div>
                    </>
                  )}
                  {kieu === 'so' && (
                    <>
                      <div className="m-pos-ct-nhom-t">Ghi vào sổ</div>
                      <div className="m-pos-ct-ttin">
                        {soRows.map((sRow, idx) => (
                          <div key={idx} className="full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{sRow.so}</span>
                            <b className="num" style={{ fontSize: '13px' }}>{money(sRow.tien)} đ</b>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Khối tổng: nằm NGOÀI vùng cuộn, ở chân màn, phía trên nút */}
            <details
              className="m-pos-ct-bung"
              open={moTong}
              onToggle={(e) => setMoTong(e.currentTarget.open)}
            >
              <summary>
                <div className="m-pos-ct-bung-t">
                  <small>Tổng tiền thanh toán · {moTong ? 'bấm để thu gọn' : 'bấm để bung'}</small>
                  <b className="num">{money(donDangXem.tong)} đ</b>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </summary>
              <div className="m-pos-ct-tong">
                <div className="d">
                  <span>Tổng thành tiền</span>
                  <span className="num">{money(Number(donDangXem.tien || 0) + tongGiamGia)}</span>
                </div>
                <div className="d">
                  <span>Tổng giảm giá, chiết khấu</span>
                  {tongGiamGia > 0 ? (
                    <span className="num am">({money(tongGiamGia)})</span>
                  ) : (
                    <span className="num">0</span>
                  )}
                </div>
                {tyLe ? (
                  <div className="d">
                    <span>Giảm thuế GTGT</span>
                    {Number(donDangXem.giamThue || 0) > 0 ? (
                      <span className="num am">({money(donDangXem.giamThue)})</span>
                    ) : (
                      <span className="num">0</span>
                    )}
                  </div>
                ) : (
                  <div className="d">
                    <span>Tổng VAT</span>
                    <span className="num">{money(donDangXem.thue || 0)}</span>
                  </div>
                )}
              </div>
            </details>

          {/* Chân: chỉ một nút "Đóng" rộng hết. KHÔNG có nút Xem hạch toán */}
          <div className="m-pos-ct-chan">
            <button
              type="button"
              className="btn pri m-pos-ct-nut-dong"
              onClick={() => setDonDangXem(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
