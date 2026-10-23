import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, gtgtTyLe, useSession } from '../../app/session'
import { kieuGhiSoDv } from '../../app/plan'
import { CUA_HANG, DAILY, HANG, cnTen } from '../../data/mock'
import { docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { dmy, fold, money } from '../format'
import { MChon } from './MChon'
import { MChonKhoangNgay } from './MChonKhoangNgay'
import {
  PTTT,
  chiaTheo,
  dongCuaPhieu,
  giamThueHkd,
  ptttCua,
  soFabi,
  theoDon,
  type XPos,
} from '../../modules/ban-hang/ChungTuBanHang'
import { useDaXoa } from '../generic/daXoa'
import { MDsChungTuChuan, MDsDongPhieu, HangTabsBanHang, layMaKh } from './MDsChungTuChuan'
import { quayLaiMobile } from './quayLai'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'

type KhoaLoc = 'cn' | 'kh' | 'kenh' | 'pttt' | 'hang' | 'tonKho'
const LOC_TRONG: Record<KhoaLoc, string> = { cn: '', kh: '', kenh: '', pttt: '', hang: '', tonKho: '' }

export const MXuatBanPos: FC<ScreenProps> = ({ sc, mod }) => {
  const { s } = useSession()
  const nav = useNavigate()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const tyLe = gtgtTyLe(s)   // GTGT theo % doanh thu: Giảm thuế GTGT thay VAT (T163, T450)
  const kieu = kieuGhiSoDv(s)
  const ghi = kieu !== 'khong'   // gói Standard, Plus hộ kinh doanh đồng bộ là xong, không ghi sổ (QD81)
  const cnChon = cuaHangHienTai(s)

  // Khoảng ngày lọc
  const [thoiGian, setThoiGian] = useState<KhoangNgay>(() => thangNay())
  // Ô lọc như danh sách Xuất bán POS trên web (T570); chuỗi rỗng là tất cả
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<Record<KhoaLoc, string>>(LOC_TRONG)
  const [moLoc, setMoLoc] = useState(false)
  const [moChon, setMoChon] = useState<KhoaLoc | null>(null)
  const [moTheoDoi, setMoTheoDoi] = useState(false)
  // Tấm chi tiết đơn
  const [donDangXem, setDonDangXem] = useState<Row | null>(null)
  const [timHang, setTimHang] = useState('')   // ô tìm hàng hoá trong chi tiết đơn (T573)

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
        mon: dongCuaPhieu(x).map(d => ({ ma: d.ma, ten: d.ten, tonKho: Boolean(d.tonKho) })),   // lọc theo hàng hoá, tồn kho, tìm theo tên món
      }))
  }, [tyLe])

  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban, laDaXoa])

  // Lọc theo khoảng ngày, ô tìm, các ô chọn; cửa hàng chọn trên thanh trên thì bỏ ô Cửa hàng
  const list = useMemo(() => {
    const q = fold(tim.trim())
    return rows.filter(r => {
      const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.x?.cn !== cnChon.id) return false
      if (loc.cn && r.x?.cn !== loc.cn) return false
      if (loc.kh && r.doiTuong !== loc.kh) return false
      if (loc.kenh && r.kenh !== loc.kenh) return false
      if (loc.pttt && !ptttCua(r.x).includes(loc.pttt)) return false
      if (loc.hang && !r.mon.some(m => m.ma === loc.hang)) return false
      if (loc.tonKho && !r.mon.some(m => m.tonKho === (loc.tonKho === 'co'))) return false
      if (q && !fold(`${r.so} ${r.dienGiai} ${r.mon.map(m => m.ten).join(' ')}`).includes(q)) return false
      return true
    })
  }, [rows, thoiGian, cnChon, loc, tim])

  // Lựa chọn từng ô; khách hàng, kênh lấy từ chính các chứng từ như web (T116)
  const tuDs = (ds: string[]) => [...new Set(ds.filter(Boolean))].map(v => ({ k: v, ten: v }))
  const oLoc = useMemo(() => {
    const o: { k: KhoaLoc; nhan: string; tieuDe: string; tatCa: string; ds: { k: string; ten: string }[]; tim?: boolean }[] = [
      { k: 'kh', nhan: 'Khách hàng', tieuDe: 'Chọn khách hàng', tatCa: 'Tất cả khách hàng', ds: tuDs(rows.map(r => String(r.doiTuong ?? ''))) },
      { k: 'kenh', nhan: 'Kênh', tieuDe: 'Chọn kênh bán hàng', tatCa: 'Tất cả kênh', ds: tuDs(rows.map(r => String(r.kenh ?? ''))) },
      { k: 'pttt', nhan: 'Thanh toán', tieuDe: 'Chọn phương thức thanh toán', tatCa: 'Tất cả phương thức', ds: PTTT.map(([, t]) => ({ k: t, ten: t })) },
      { k: 'hang', nhan: 'Hàng hoá', tieuDe: 'Chọn hàng hoá', tatCa: 'Tất cả hàng hoá', ds: HANG.map(h => ({ k: h.ma, ten: `${h.ma} - ${h.ten}` })), tim: true },
      { k: 'tonKho', nhan: 'Tồn kho', tieuDe: 'Theo dõi tồn kho', tatCa: 'Tất cả', ds: [{ k: 'co', ten: 'Có theo dõi tồn kho' }, { k: 'khong', ten: 'Không theo dõi tồn kho' }] },
    ]
    if (!cnChon) o.unshift({ k: 'cn', nhan: 'Kho/CN', tieuDe: 'Chọn cửa hàng', tatCa: 'Tất cả cửa hàng', ds: CUA_HANG.map(c => ({ k: c.id, ten: c.ten })) })
    return o
  }, [rows, cnChon])
  const oDangMo = oLoc.find(o => o.k === moChon)
  // Chip ghi ngắn: hàng hoá chỉ hiện mã
  const tenChip = (o: (typeof oLoc)[number]) => !loc[o.k] ? 'Tất cả' : o.k === 'hang' ? loc.hang : o.ds.find(d => d.k === loc[o.k])?.ten ?? 'Tất cả'
  const dangLoc = Boolean(tim.trim()) || Object.values(loc).some(Boolean)

  const pad = (n: number) => String(n).padStart(2, '0')
  const chuoiKhoangNgay = `${pad(thoiGian.tu.getDate())}/${pad(thoiGian.tu.getMonth() + 1)} – ${pad(thoiGian.den.getDate())}/${pad(thoiGian.den.getMonth() + 1)}/${thoiGian.den.getFullYear()}`
  const nhanCn = cnChon ? cnChon.ten : (loc.cn ? CUA_HANG.find(c => c.id === loc.cn)?.ten ?? 'Kho/CN: Tất cả' : 'Kho/CN: Tất cả')

  const chipsLoc = useMemo(() => {
    const arr: ReactNode[] = []
    arr.push(<span key="kn" className="m-chip-xem">{chuoiKhoangNgay}</span>)
    arr.push(<span key="cn" className="m-chip-xem">{cnChon ? nhanCn : `Kho/CN: ${loc.cn ? CUA_HANG.find(c => c.id === loc.cn)?.ten ?? 'Tất cả' : 'Tất cả'}`}</span>)
    if (loc.kh) arr.push(<span key="kh" className="m-chip-xem">Khách: {loc.kh}</span>)
    if (loc.kenh) arr.push(<span key="kenh" className="m-chip-xem">Kênh: {loc.kenh}</span>)
    if (loc.pttt) arr.push(<span key="pttt" className="m-chip-xem">Thanh toán: {loc.pttt}</span>)
    if (loc.hang) arr.push(<span key="hang" className="m-chip-xem">Hàng: {loc.hang}</span>)
    if (loc.tonKho) arr.push(<span key="tonKho" className="m-chip-xem">{loc.tonKho === 'co' ? 'Có tồn kho' : 'Không tồn kho'}</span>)
    return arr
  }, [chuoiKhoangNgay, cnChon, nhanCn, loc])

  // Mở đơn xem chi tiết
  const xemDon = (r: Row) => {
    setDonDangXem(r)
    setTimHang('')
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

  // Thông tin bổ trợ cho đơn đang xem
  const tenKhoDon = useMemo(() => {
    if (!donDangXem) return ''
    return CUA_HANG.find(c => c.ten === donDangXem.cn)?.kho[0] ?? 'Kho mặc định'
  }, [donDangXem])

  const ptttTen = useMemo(() => {
    if (!donDangXem?.x) return ''
    const x = donDangXem.x
    const ds = PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)
    return ds.length ? ds.join(', ') : 'Tiền mặt'
  }, [donDangXem])

  // Các khoản của biên lai (T573): cộng theo dòng món như dải tổng web; thuế theo phương pháp GTGT
  const khoan = useMemo(() => {
    const cong = (k: 'sl' | 'thanh' | 'giam' | 'ck' | 'phiDv' | 'phiVc' | 'dtTruocThue' | 'thue') => dsMon.reduce((a, m) => a + (Number(m[k]) || 0), 0)
    return {
      sl: cong('sl'), tienHang: cong('thanh'), giam: cong('giam') + cong('ck'), phiDv: cong('phiDv'), phiVc: cong('phiVc'),
      dtTruocThue: cong('dtTruocThue'), thue: cong('thue'), giamThue: Number(donDangXem?.giamThue || 0),
    }
  }, [dsMon, donDangXem])

  const qHang = fold(timHang.trim())
  const dsMonLoc = qHang ? dsMon.filter(m => fold(`${m.ten} ${m.ma}`).includes(qHang)) : dsMon

  // T628: Tách mỗi phiếu thành các dòng hàng, mỗi thẻ là một dòng hàng
  const listDong = useMemo(() => {
    return list.flatMap(r => {
      const dsDong = r.x ? dongCuaPhieu(r.x as XPos) : []
      const dongLoc1 = loc.hang ? dsDong.filter(d => d.ma === loc.hang) : dsDong
      const dongLoc = loc.tonKho ? dongLoc1.filter(d => Boolean(d.tonKho) === (loc.tonKho === 'co')) : dongLoc1
      const ngayStr = dmy(r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay))
      const maKh = layMaKh(r.doiTuong)
      return dongLoc.map((d, dIdx) => ({
        id: `${r.id}_${dIdx}`,
        phieu: r,
        so: r.so,
        ngay: r.ngay,
        tenHang: d.ten,
        maHang: d.ma,
        dvt: d.dvt,
        sl: d.sl,
        tien: d.tien ?? d.thanh ?? (d.sl * d.gia),
        tong: d.tien ?? d.thanh ?? (d.sl * d.gia),
        maKh,
        dienGiai: r.dienGiai,
        cn: r.cn,
        doiTuong: maKh,
        dongPhu: `${maKh} · ${r.so} · ${ngayStr}`,
      }))
    })
  }, [list, loc.hang, loc.tonKho])

  return (
    <>
      <MDsChungTuChuan
        tieuDe="Bán hàng"
        hangTabs={<HangTabsBanHang sc={sc} onMoTheoDoi={() => setMoTheoDoi(true)} />}
        onQuayLai={() => quayLaiMobile(nav, '/app/nghiep-vu')}
        tuKhoa={tim}
        onTuKhoaChange={setTim}
        timPlaceholder="Số, diễn giải, tên hàng..."
        onMoLoc={() => setMoLoc(true)}
        coLoc={dangLoc}
        chipsLoc={chipsLoc}
        chuoiKhoangNgay={chuoiKhoangNgay}
        hienTien={true}
        rows={listDong}
        nhomTheoNgay={false}
        renderDong={(r, i) => {
          return (
            <MDsDongPhieu
              key={r.id ?? i}
              so={r.so}
              tieuDe={r.tenHang}
              soLuong={r.sl}
              dvt={r.dvt}
              dongPhu={r.dongPhu}
              tien={Number(r.tien ?? 0)}
              hienTien={true}
              onClick={() => xemDon(r.phieu ?? r)}
            />
          )
        }}
        thongBaoTrong="Không có đơn xuất bán POS"
      />

      {/* Sheet bộ lọc nâng cao */}
      {moLoc && (
        <div className="m-loc-overlay" onClick={() => setMoLoc(false)}>
          <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
            <div className="m-tam-keo" />
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Bộ lọc</h2>
              <button type="button" className="m-loc-btn-dong" onClick={() => setMoLoc(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-loc-than">
              {/* Dòng Thời gian (T571) */}
              <MChonKhoangNgay
                value={thoiGian}
                onChange={setThoiGian}
                nut={moLich => (
                  <div className="m-loc-dong" onClick={moLich}>
                    <div className="m-loc-dong-trai">
                      <span className="m-loc-dong-nhan">Thời gian</span>
                      <span className="m-loc-dong-tri">{dmy(thoiGian.tu)} - {dmy(thoiGian.den)}</span>
                    </div>
                    <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                  </div>
                )}
              />

              {/* Các ô lọc từ T570 */}
              {oLoc.map(o => (
                <div
                  key={o.k}
                  className="m-loc-dong"
                  onClick={() => setMoChon(o.k)}
                >
                  <div className="m-loc-dong-trai">
                    <span className="m-loc-dong-nhan">{o.nhan}</span>
                    <span className="m-loc-dong-tri">{tenChip(o)}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                </div>
              ))}
            </div>

            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-reset"
                onClick={() => {
                  setTim('')
                  setLoc(LOC_TRONG)
                  setThoiGian(thangNay())
                }}
              >
                Đặt lại
              </button>
              <button
                type="button"
                className="m-loc-btn-apply"
                onClick={() => setMoLoc(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet chọn của ô lọc đang mở */}
      {oDangMo && (
        <MChon
          mo
          onDong={() => setMoChon(null)}
          tieuDe={oDangMo.tieuDe}
          ds={[{ k: '', ten: oDangMo.tatCa }, ...oDangMo.ds]}
          chon={loc[oDangMo.k]}
          onChon={v => setLoc(l => ({ ...l, [oDangMo.k]: v }))}
          tim={oDangMo.tim}
        />
      )}

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
              <b>Xuất bán POS</b>
              <small className="code">{donDangXem.so}</small>
            </div>
            <span className="m-pos-ct-x-placeholder" />
          </header>

          {/* Mẫu B (T573): không tab; thông tin đơn, danh sách hàng hoá, các khoản kiểu biên lai */}
          <div className="m-pb-noi-dung m-pos-ct-than">
            <div className="m-pos-ct-the">
              <div className="m-pos-ct-nhom-t m-pos-b-nhom">
                <span>Thông tin đơn</span>
                <span className="m-pos-b-chip">
                  {ghi
                    ? <span className={`m-pos-tt ${donDangXem.tt === 'nhap' ? 'chua-ghi' : 'da-ghi'}`}>{donDangXem.tt === 'nhap' ? 'Chưa ghi sổ' : 'Đã ghi sổ'}</span>
                    : <span className="m-pos-tt da-ghi">Đã đồng bộ</span>}
                  <span className="m-pos-b-nguon">FABi</span>
                </span>
              </div>
              <div className="m-pos-ct-ttin">
                <div><small>Kho xuất</small><b>{tenKhoDon}</b></div>
                <div><small>Khách hàng</small><b>{donDangXem.doiTuong || 'Khách lẻ POS'}</b></div>
                <div><small>PTTT</small><b>{ptttTen}</b></div>
                <div><small>Thời gian xuất</small><b>{donDangXem.ngay}</b></div>
                <div><small>Cửa hàng</small><b>{donDangXem.cn}</b></div>
                <div><small>Kênh bán hàng</small><b>{donDangXem.kenh}</b></div>
                {donDangXem.dienGiai && (
                  <div className="full"><small>Ghi chú</small><b>{donDangXem.dienGiai}</b></div>
                )}
              </div>
            </div>

            <div className="m-pos-b-tieu-de">DANH SÁCH HÀNG HOÁ ({dsMon.length})</div>
            <label className="m-pos-b-tim">
              <Icon n="search" className="ic sm" />
              <input type="text" value={timHang} onChange={e => setTimHang(e.target.value)} placeholder="Nhập tên, mã hàng hoá" aria-label="Tìm hàng hoá" />
            </label>
            <div className="m-pos-ct-the m-pos-ct-mon-the">
              {dsMonLoc.length === 0 && <div className="m-pos-b-trong">Không có hàng hoá khớp</div>}
              {dsMonLoc.map((m, idx) => {
                // VAT % chỉ hiện khi khấu trừ; theo % doanh thu không hiện thuế, giảm thuế trên dòng (T573)
                const ct = [`${m.ma} · ${m.sl} ${m.dvt} × ${money(m.gia)}`, !tyLe && m.ts ? `VAT ${m.ts}%` : '', m.tonKho ? 'tồn kho' : ''].filter(Boolean).join(' · ')
                return (
                  <div key={idx} className="m-pos-mon-dong-b">
                    <b>{m.ten}</b>
                    <span className="m-pos-mon-tien-b num">{money(m.tien)}</span>
                    <span className="m-pos-mon-ct-b num">{ct}</span>
                    {m.giam > 0 && <span className="m-pos-mon-ct2-b num">giảm -{money(m.giam)}</span>}
                  </div>
                )
              })}
            </div>

            <div className="m-pos-ct-the m-pos-b-bien-lai">
              <div className="d"><span>Tiền hàng ({dsMon.length} món, SL {khoan.sl})</span><span className="num">{money(khoan.tienHang)}</span></div>
              <div className="d"><span>Giảm giá, chiết khấu</span><span className={`num${khoan.giam > 0 ? ' am' : ''}`}>{khoan.giam > 0 ? `(${money(khoan.giam)})` : 0}</span></div>
              <div className="d"><span>Phí dịch vụ</span><span className="num">{money(khoan.phiDv)}</span></div>
              <div className="d"><span>Phí vận chuyển</span><span className="num">{money(khoan.phiVc)}</span></div>
              <div className="d"><span>Doanh thu trước thuế</span><span className="num">{money(khoan.dtTruocThue)}</span></div>
              {tyLe
                ? <div className="d"><span>Giảm thuế GTGT</span><span className={`num${khoan.giamThue > 0 ? ' am' : ''}`}>{khoan.giamThue > 0 ? `(${money(khoan.giamThue)})` : 0}</span></div>
                : <div className="d"><span>Tiền thuế GTGT</span><span className="num">{money(khoan.thue)}</span></div>}
              <div className="d"><span>Phiếu giảm giá</span><span className="num">0</span></div>
              <div className="d tong"><span>Tổng tiền</span><span className="num">{money(donDangXem.tong)} đ</span></div>
            </div>
          </div>

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

      {/* Báo cáo theo dõi */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey="ban-hang"
      />
    </>
  )
}
