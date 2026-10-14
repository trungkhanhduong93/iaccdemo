import { useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { chiNhanhHienTai, donViHienTai, loaiHinhDv, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH, DAILY, cnTen } from '../../data/mock'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { dmy, money } from '../format'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import {
  dongCuaPhieu,
  giamThueHkd,
  soFabi,
  theoDon,
  type XPos,
} from '../../modules/ban-hang/ChungTuBanHang'
import { useDaXoa } from '../generic/daXoa'

export const MXuatBanPos: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const hkd = loaiHinhDv(s, donViHienTai(s)) === 'hkd'
  const ghi = kieuGhiSo(s.cheDo) !== 'khong'
  const cnChon = chiNhanhHienTai(s)

  // Khoảng ngày lọc
  const [thoiGian, setThoiGian] = useState<KhoangNgay>(() => thangNay())
  // Chi nhánh lọc
  const [cn, setCn] = useState<string>('')
  const [moChonCn, setMoChonCn] = useState(false)
  // Kênh bán lọc
  const [kenh, setKenh] = useState<string>('')
  const [moChonKenh, setMoChonKenh] = useState(false)
  // Tấm chi tiết đơn
  const [donDangXem, setDonDangXem] = useState<Row | null>(null)
  const [tabCt, setTabCt] = useState<'hang' | 'tt'>('hang')

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

  // Lọc theo khoảng ngày, chi nhánh, kênh bán
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

  // Lựa chọn chi nhánh
  const dsChonCn = useMemo(() => {
    return [
      { k: '', ten: 'Tất cả chi nhánh' },
      ...CHI_NHANH.map(c => ({ k: c.id, ten: c.ten })),
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

  const tenCnHienThi = cn ? CHI_NHANH.find(c => c.id === cn)?.ten ?? 'Tất cả' : 'Tất cả'
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
    return dongCuaPhieu(donDangXem.x as XPos)
  }, [donDangXem])

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
                  <span className={`m-pos-tt ${laChuaGhi ? 'chua-ghi' : 'da-ghi'}`}>
                    {ttNhan}
                  </span>
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

      {/* Sheet chọn chi nhánh */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn chi nhánh"
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
          <aside className="pn-hop">
            <div className="pn-dau m-pos-ct-dau">
              <div>
                <h3>Đơn #{donDangXem.so}</h3>
                <small className="muted">
                  {donDangXem.ngay} · {donDangXem.kenh} ({donDangXem.cn})
                </small>
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
              <div className="tabs" style={{ margin: '0 0 12px' }}>
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
              </div>

              {tabCt === 'hang' ? (
                <div className="m-pos-ct-mon">
                  {dsMon.map((m, idx) => (
                    <div key={idx} className="m-pos-mon-dong">
                      <div className="m-pos-mon-trai">
                        <div className="m-pos-mon-ten">{m.ten}</div>
                        <small className="muted">{m.ma} · {m.dvt}</small>
                      </div>
                      <div className="m-pos-mon-phai">
                        <div className="m-pos-mon-sl-gia">
                          {m.sl} × {money(m.gia)} đ
                        </div>
                        <div className="m-pos-mon-tien">
                          <b>{money(m.tien)} đ</b>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="m-pos-mon-tong">
                    <span>Tổng tiền hàng:</span>
                    <b>{money(donDangXem.tong)} đ</b>
                  </div>
                </div>
              ) : (
                <div className="m-pos-ct-tt">
                  <div className="m-pos-tt-dong">
                    <span>Tiền mặt</span>
                    <b>{money(donDangXem.x.tm || 0)} đ</b>
                  </div>
                  <div className="m-pos-tt-dong">
                    <span>Chuyển khoản, QR</span>
                    <b>{money(donDangXem.x.ck || 0)} đ</b>
                  </div>
                  <div className="m-pos-tt-dong">
                    <span>Thẻ ngân hàng</span>
                    <b>{money(donDangXem.x.the || 0)} đ</b>
                  </div>
                  <div className="m-pos-tt-dong">
                    <span>GrabFood, ShopeeFood</span>
                    <b>{money(donDangXem.x.app || 0)} đ</b>
                  </div>
                  <div className="m-pos-tt-dong tong">
                    <span>Tổng thanh toán</span>
                    <b>{money(donDangXem.tong)} đ</b>
                  </div>
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
