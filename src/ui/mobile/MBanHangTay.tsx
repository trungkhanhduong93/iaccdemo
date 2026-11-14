// Tab Bán hàng trên điện thoại (T833): chứng từ bán hàng lập tay như web, giao diện như Xuất bán POS.
// Gói Plus lưu ở màn 3.1.1 như web (MAN_BAN), gói Pro ở màn 3.1.7. Chi tiết có Trả lại, Xuất HĐĐT như Tiện ích trên web (T763, T815).
import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, moDuoc, timMan } from '../../app/registry'
import { cuaHangHienTai, dsCuaHang, gtgtTyLe, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { dmy, fold, money, soLuong } from '../format'
import { dongCua, ttNghiepVu, type Dong } from '../generic/gen'
import { dsTraBanCon, MAN_TRA_BAN, soDaTra } from '../generic/daXoa'
import type { TraTu } from '../generic/ChungTuForm'
import { dtDong } from '../../modules/ban-hang/BangHangBan'
import { giamThueHang } from '../../modules/ban-hang/giam-thue'
import { HopXemHd, HopXuatHddt, TEN_LOAI_CT, dsHdMoiCon, hdCua, hdGocCua, type CtLq, type HdDaXuat, type LoaiCt, laHdMoiCua, loaiCtCua, ttHdGoc } from '../../modules/ban-hang/hddt'
import { MChon } from './MChon'
import { MChonKhoangNgay } from './MChonKhoangNgay'
import { MDsChungTuChuan, MDsDongPhieu, HangTabsBanHang } from './MDsChungTuChuan'
import { quayLaiMobile } from './quayLai'
import { MChungTu } from './MChungTu'
import { useDongChungTu } from '../generic/VoucherScreen'

type KhoaLoc = 'cn' | 'kh' | 'lo' | 'hd'
const LOC_TRONG: Record<KhoaLoc, string> = { cn: '', kh: '', lo: '', hd: '' }
/** Loại chứng từ ghi trên dòng danh sách điện thoại: chứng từ bán ghi "Xuất bán" cho khỏi trùng tên mục Bán hàng (T838) */
const TEN_LOAI_DS: Record<LoaiCt, string> = { ...TEN_LOAI_CT, XBAN: 'Xuất bán' }
const LOAI_DS: LoaiCt[] = ['XBAN', 'HUYBAN', 'HDTHAYTHE', 'HDDIEUCHINH']
const TEN_HTTT: Record<string, string> = { congno: 'Công nợ', tienmat: 'Tiền mặt', chuyenkhoan: 'Chuyển khoản' }

/** Tab Bán hàng của gói Plus ghi nhớ một lần: lập chứng từ xong bấm Đóng về đúng tab này, không về Xuất bán POS */
let veTabTay = false
export const datVeTabTay = (v: boolean) => { veTabTay = v }
export const layVeTabTay = () => { const v = veTabTay; veTabTay = false; return v }

/** Trạng thái hoá đơn của chứng từ như cột Trạng thái phát hành trên web */
function ttHoaDon(r: Row): string {
  if (loaiCtCua(r) === 'HUYBAN') return 'Không xuất HĐ'
  const hd = hdCua(r)
  if (hd) return `Đã xuất HĐ ${hd.so}`
  return laHdMoiCua(r) ? 'Hoá đơn dự thảo' : 'Chưa xuất HĐĐT'
}

export interface MBanHangTayProps extends ScreenProps {
  rows: Row[]
  /** Đường dẫn màn lưu chứng từ, vd /app/ban-hang/3-1-1 */
  duong: string
  /** Tab của gói Plus nằm trong màn 3.1.1: thêm ?tay=1 khi quay về danh sách */
  tabTay?: boolean
  /** Mở thẳng chi tiết chứng từ theo đường dẫn (sau khi lưu bấm Xem chứng từ) */
  idMo?: string
}

export const MBanHangTay: FC<MBanHangTayProps> = ({ sc, mod, rows, duong, tabTay, idMo }) => {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const tyLe = gtgtTyLe(s)
  const cnChon = cuaHangHienTai(s)
  const man = `${mod.key}/${sc.slug}`
  const veDs = tabTay ? `${duong}?tay=1` : duong

  useEffect(() => { if (tabTay) datVeTabTay(false) }, [tabTay])

  const [thoiGian, setThoiGian] = useState<KhoangNgay>(() => thangNay())
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<Record<KhoaLoc, string>>(LOC_TRONG)
  const [moLoc, setMoLoc] = useState(false)
  const [moChon, setMoChon] = useState<KhoaLoc | null>(null)
  const [idXem, setIdXem] = useState<string | null>(idMo ?? null)
  const [moHd, setMoHd] = useState(false)
  // Hoá đơn đang xem: của chứng từ này, hoá đơn gốc bị thay thế, điều chỉnh, hoặc bản dự thảo (T838)
  const [xemHd, setXemHd] = useState<{ r: Row; hd: HdDaXuat; nhap?: boolean } | null>(null)

  const list = useMemo(() => {
    const q = fold(tim.trim())
    return rows.filter(r => {
      const d = docNgay(String(r.ngay ?? '').split(' ')[0])
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (loc.cn && r.cn !== CUA_HANG.find(c => c.id === loc.cn)?.ten) return false
      if (loc.kh && r.doiTuong !== loc.kh) return false
      if (loc.lo && loaiCtCua(r) !== loc.lo) return false
      if (loc.hd === 'da' && !hdCua(r)) return false
      if (loc.hd === 'chua' && (hdCua(r) || loaiCtCua(r) === 'HUYBAN')) return false
      if (q && !fold(`${r.so} ${r.dienGiai ?? ''} ${r.doiTuong ?? ''} ${r._tenHangDu ?? r.tenHang ?? ''}`).includes(q)) return false
      return true
    })
  }, [rows, thoiGian, cnChon, loc, tim])

  const oLoc = useMemo(() => {
    const o: { k: KhoaLoc; nhan: string; tieuDe: string; tatCa: string; ds: { k: string; ten: string }[]; tim?: boolean }[] = [
      { k: 'kh', nhan: 'Khách hàng', tieuDe: 'Chọn khách hàng', tatCa: 'Tất cả khách hàng', tim: true,
        ds: [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].map(v => ({ k: v, ten: v })) },
      { k: 'lo', nhan: 'Loại chứng từ', tieuDe: 'Chọn loại chứng từ', tatCa: 'Tất cả', ds: LOAI_DS.map(k => ({ k, ten: TEN_LOAI_DS[k] })) },
      { k: 'hd', nhan: 'Hoá đơn điện tử', tieuDe: 'Trạng thái hoá đơn', tatCa: 'Tất cả', ds: [{ k: 'da', ten: 'Đã xuất HĐĐT' }, { k: 'chua', ten: 'Chưa xuất HĐĐT' }] },
    ]
    if (!cnChon) o.unshift({ k: 'cn', nhan: 'Cửa hàng', tieuDe: 'Chọn cửa hàng', tatCa: 'Tất cả cửa hàng', ds: CUA_HANG.map(c => ({ k: c.id, ten: c.ten })) })
    return o
  }, [rows, cnChon])
  const oDangMo = oLoc.find(o => o.k === moChon)
  const tenChip = (o: (typeof oLoc)[number]) => (!loc[o.k] ? 'Tất cả' : o.ds.find(d => d.k === loc[o.k])?.ten ?? 'Tất cả')
  const dangLoc = Boolean(tim.trim()) || Object.values(loc).some(Boolean)

  const pad = (n: number) => String(n).padStart(2, '0')
  const chuoiKhoangNgay = `${pad(thoiGian.tu.getDate())}/${pad(thoiGian.tu.getMonth() + 1)} – ${pad(thoiGian.den.getDate())}/${pad(thoiGian.den.getMonth() + 1)}/${thoiGian.den.getFullYear()}`
  const chipsLoc: ReactNode[] = [
    <span key="kn" className="m-chip-xem">{chuoiKhoangNgay}</span>,
    // Danh sách không ghi cửa hàng (T838): chỉ hiện khi đang lọc theo một cửa hàng
    ...(loc.cn ? [<span key="cn" className="m-chip-xem">{CUA_HANG.find(c => c.id === loc.cn)?.ten}</span>] : []),
    ...(loc.kh ? [<span key="kh" className="m-chip-xem">Khách: {loc.kh}</span>] : []),
    ...(loc.lo ? [<span key="lo" className="m-chip-xem">{TEN_LOAI_DS[loc.lo as LoaiCt]}</span>] : []),
    ...(loc.hd ? [<span key="hd" className="m-chip-xem">{loc.hd === 'da' ? 'Đã xuất HĐĐT' : 'Chưa xuất HĐĐT'}</span>] : []),
  ]

  // Chứng từ đang xem lấy lại từ danh sách mỗi lần vẽ: phát hành hoá đơn, trả hàng xong là thấy ngay
  const ct = idXem ? rows.find(r => String(r.id) === idXem) : undefined
  const dongXem = () => { setIdXem(null); setMoHd(false); setXemHd(null); if (idMo) nav(veDs, { replace: true }) }

  const dsDong: Dong[] = useMemo(() => (!ct ? [] : ((ct._dong as Dong[] | undefined) ?? dongCua(sc.voucher ?? { prefix: 'BH', doiTuong: 'kh', dienGiai: [], tien: [0, 0] }, `${sc.code ?? sc.slug}-${ct.id}`))), [ct, sc])
  const khoan = useMemo(() => {
    const cong = (f: (d: Dong) => number) => dsDong.reduce((a, d) => a + (f(d) || 0), 0)
    return {
      sl: cong(d => d.sl), tienHang: cong(d => d.tien), giam: cong(d => d.giam ?? 0), ck: cong(d => d.ck ?? 0), phiDv: cong(d => d.phiDv ?? 0),
      dt: cong(d => dtDong(d)), thue: cong(d => d.thue), giamThue: tyLe ? cong(d => giamThueHang(dtDong(d), d.ma)) : 0,
    }
  }, [dsDong, tyLe])

  // Như web: Xuất HĐĐT với chứng từ bán chưa có hoá đơn; Trả lại với chứng từ bán, hoá đơn thay thế chưa bị thay thế (T763, T815)
  const manTra = timMan('ban-hang', '3-1-4').sc
  const hd = ct ? hdCua(ct) : undefined
  const loaiCt = ct ? loaiCtCua(ct) : 'XBAN'
  const coXuatHd = Boolean(ct) && !hd && loaiCt === 'XBAN' && ct?.nguon !== 'FABi'
  const coTraLai = Boolean(ct) && (loaiCt === 'XBAN' || loaiCt === 'HDTHAYTHE') && ct?.nguon !== 'FABi'
    && ttHdGoc(man, ct!) !== 'Bị thay thế' && Boolean(manTra) && moDuoc(manTra!, s.goi)
  const nv = ct ? ttNghiepVu(ct) : undefined
  // Chứng từ mẫu chưa ghi hình thức thanh toán: đã thu tiền thì Tiền mặt, chưa thì Công nợ, như form web
  const httt = String(ct?._httt ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno')) as 'congno' | 'tienmat' | 'chuyenkhoan'
  const traLai = ct ? dsTraBanCon(ct) : []
  const hdGoc = ct ? hdGocCua(ct) : undefined
  // Tham chiếu như web (QD107, T787, T815): chứng từ gốc, huỷ bán, hoá đơn thay thế, điều chỉnh lập từ chứng từ này, hàng bán trả lại (T840)
  const coCt = (id: string) => rows.some(x => String(x.id) === id)
  const dsThamChieu: { so: string; ten: string; mo: () => void }[] = !ct ? [] : [
    ...(hdGoc && coCt(hdGoc.id) ? [{ so: hdGoc.so, ten: 'Chứng từ gốc', mo: () => setIdXem(hdGoc.id) }] : []),
    ...([ct._huyBan, ct._hdTt] as (CtLq | undefined)[]).filter((c): c is CtLq => Boolean(c) && coCt(c!.id))
      .map(c => ({ so: c.so, ten: TEN_LOAI_CT[c.loai], mo: () => setIdXem(c.id) })),
    ...dsHdMoiCon(man, ct).filter(c => coCt(c.id)).map(c => ({ so: c.so, ten: TEN_LOAI_CT[c.loai], mo: () => setIdXem(c.id) })),
    ...traLai.map(c => ({ so: c.so, ten: 'Hàng bán trả lại', mo: () => nav(`/app/${MAN_TRA_BAN}/${c.id}`) })),
  ].filter((c, i, ds) => ds.findIndex(x => x.so === c.so) === i)
  // Hoá đơn thay thế, điều chỉnh chưa phát hành: bản dự thảo dựng từ ký hiệu, ngày, tiền đã lưu, số 00000000 (như web T798)
  const hdNhap: HdDaXuat | undefined = ct && !hd && laHdMoiCua(ct) ? (() => {
    const kh = String(ct._kyHieuHd ?? ''), tien = (ct._tienHd as Partial<HdDaXuat> | undefined) ?? {}
    return { mau: kh[0] ?? '', kyHieu: kh.slice(1), so: '00000000', ngay: String(ct._ngayHd ?? ''), ma: '', truoc: tien.truoc, thue: tien.thue, tong: tien.tong }
  })() : undefined
  // Tình trạng thu tiền như phiếu mua: Tiền mặt, Chuyển khoản là thu đủ; Công nợ cộng các phiếu thu đã lập
  const tongCt = Number(ct?.tong ?? 0)
  const daThu = ct ? soDaTra(ct) : 0
  const ttThu = daThu >= tongCt && tongCt > 0 ? { kieu: 'da', ten: 'Đã thanh toán' }
    : daThu > 0 ? { kieu: 'mot', ten: 'Thanh toán một phần' } : { kieu: 'chua', ten: 'Chưa thanh toán' }

  const moTraLai = () => {
    if (!ct) return
    const tu: TraTu = {
      id: String(ct.id), so: String(ct.so), man, di: `${duong}/${ct.id}`, cn: String(ct.cn ?? ''),
      doiTuong: String(ct.doiTuong ?? ''), mst: String(ct._mst ?? nv?.mst ?? ''), diaChi: String(ct._diaChi ?? nv?.dc ?? ''), kho: String(ct._kho ?? ''),
      // GTGT theo % doanh thu: chứng từ bán không cộng VAT, phiếu trả lại cũng không (tổng không vượt tổng đã bán)
      // Form trả lại không có ô giảm giá, phí dịch vụ: đơn giá điền sẵn là doanh thu tính thuế chia số lượng (đã trừ giảm giá, chiết khấu, cộng phí dịch vụ),
      // đổi số lượng thì tiền theo tỷ lệ, trả đủ số lượng không vượt số đã bán (T834)
      dong: dsDong.filter(d => Number(d.sl) > 0).map(d => {
        const sl = Number(d.sl)
        const gia = Math.round(dtDong(d) / sl)
        const tien = gia * sl
        const ts = tyLe ? 0 : Number(d.ts) || 0
        return { ...d, slMax: sl, gia, tien, giam: 0, ck: 0, ptCk: 0, phiDv: 0, ts, thue: Math.round((tien * ts) / 100) }
      }), dsTra: traLai,
      ban: true, httt, pttt: String(ct._pttt ?? 'Tiền mặt'),
    }
    // Đang xem Tất cả cửa hàng: lấy luôn cửa hàng của chứng từ bán, không hỏi chọn cửa hàng (như trả hàng mua T819)
    const cn = CUA_HANG.find(c => c.ten === ct.cn)
    if ((!s.cuaHang || s.cuaHang === 'all') && cn && dsCuaHang(s).some(c => c.id === cn.id)) set({ cuaHang: cn.id })
    nav(`/app/${MAN_TRA_BAN}/moi`, { state: { traTu: tu } })
  }

  return (
    <>
      <MDsChungTuChuan
        tieuDe="Bán hàng"
        hangTabs={<HangTabsBanHang sc={sc} />}
        onQuayLai={() => quayLaiMobile(nav, '/app/nghiep-vu')}
        tuKhoa={tim}
        onTuKhoaChange={setTim}
        timPlaceholder="Số, khách hàng, tên hàng..."
        onMoLoc={() => setMoLoc(true)}
        coLoc={dangLoc}
        chipsLoc={chipsLoc}
        chuoiKhoangNgay={chuoiKhoangNgay}
        hienTien
        rows={list}
        renderDong={(r, i) => (
          <MDsDongPhieu
            key={r.id ?? i}
            so={String(r.so)}
            dongPhu={r.doiTuong || 'Khách lẻ'}
            // Dòng phụ chỉ ghi loại chứng từ, bỏ tên cửa hàng và trạng thái hoá đơn (T838): đã phát hành có nhãn VAT trên số chứng từ,
            // hoá đơn thay thế, điều chỉnh chưa phát hành có nhãn Dự thảo cùng chỗ
            dongPhu2={TEN_LOAI_DS[loaiCtCua(r)]}
            tien={Number(r.tong ?? 0)}
            hienTien
            vat={Boolean(hdCua(r))}
            duThao={!hdCua(r) && laHdMoiCua(r)}
            onClick={() => setIdXem(String(r.id))}
          />
        )}
        onThem={() => { if (tabTay) datVeTabTay(true); nav(`${duong}/moi`) }}
        nhanThem="Lập chứng từ bán hàng"
        thongBaoTrong="Chưa có chứng từ bán hàng lập tay"
      />

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
              {oLoc.map(o => (
                <div key={o.k} className="m-loc-dong" onClick={() => setMoChon(o.k)}>
                  <div className="m-loc-dong-trai">
                    <span className="m-loc-dong-nhan">{o.nhan}</span>
                    <span className="m-loc-dong-tri">{tenChip(o)}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                </div>
              ))}
            </div>
            <div className="m-loc-day">
              <button type="button" className="m-loc-btn-reset" onClick={() => { setTim(''); setLoc(LOC_TRONG); setThoiGian(thangNay()) }}>
                Đặt lại
              </button>
              <button type="button" className="m-loc-btn-apply" onClick={() => setMoLoc(false)}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Chi tiết theo khuôn xem phiếu nhập mua (T834, như T655): thẻ đầu tổng tiền, thông tin chung, hoá đơn, hàng hoá, chân ghim hai nút */}
      {ct && (
        <div className="m-pb-man m-xp-mua m-t834-ct">
          <header className="m-pb-thanh-dau">
            <button type="button" className="m-pb-btn-back" onClick={dongXem} aria-label="Quay lại">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="m-pb-tieu-de">{TEN_LOAI_CT[loaiCt]} {ct.so}</h2>
            <span className="m-pb-thanh-dau-phai" />
          </header>

          <div className="m-pb-noi-dung">
            <div className="m-t600-the-dau m-t655-dau">
              <div className="m-tc-xem-dong-cn">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{ct.cn}</span>
                <span className="m-tc-badge-nguon m-tc-xem-nguon">{ct.nguon === 'excel' ? 'Excel' : 'Thủ công'}</span>
              </div>
              {/* Tổng tiền bên trái; nhãn HĐĐT kèm mã tra cứu (chữ nhỏ) bên phải cùng hàng */}
              <div className="m-t834-hang-tong">
                <div>
                  <div className="m-t600-tong-tien-nhan">Tổng tiền</div>
                  <div className="m-t600-tong-tien-so xanh">{money(tongCt)} đ</div>
                </div>
                <div className="m-t834-hd">
                  <span className={`m-t600-chip-tt ${hd ? 'da' : laHdMoiCua(ct) && loaiCtCua(ct) !== 'HUYBAN' ? 'nhap' : 'chua'}`}>{hd ? 'Đã xuất HĐĐT' : ttHoaDon(ct)}</span>
                  {hd && <small className="m-t834-tra-cuu">Mã tra cứu <b className="code">{hd.traCuu ?? hd.ma}</b></small>}
                </div>
              </div>

              {/* Tình trạng thanh toán như phiếu nhập mua (T655): hình thức, đã thu / tổng, thanh tiến độ */}
              <div className="m-t600-khung-tt">
                <div className="m-t600-tt-tien-do-khu">
                  <div className="m-t600-tt-tien-do-hang">
                    <span>Thanh toán · {TEN_HTTT[httt] ?? TEN_HTTT.congno}{httt !== 'congno' && ct._pttt ? ` (${ct._pttt})` : ''}</span>
                    <span className={`m-t600-chip-tt ${ttThu.kieu}`}>{ttThu.ten}</span>
                  </div>
                  <div className="m-t600-tt-tien-do-hang">
                    <span>Đã thu</span>
                    <b>{money(daThu)} / {money(tongCt)}</b>
                  </div>
                  <div className="m-t600-thanh-tien-do">
                    <div className="m-t600-tien-do-fill" style={{ width: `${tongCt > 0 ? Math.min(100, Math.round((daThu / tongCt) * 100)) : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Không có tab Lịch sử: lịch sử sửa của bản mẫu là dữ liệu phiếu mua, không hợp chứng từ bán */}
            <>
                <div className="m-pb-nhom">THÔNG TIN CHUNG</div>
                <div className="m-pb-the m-pb-the-gon m-t655-gon">
                  <Dg nhan="Khách hàng" dam>{ct.doiTuong || 'Khách lẻ'}</Dg>
                  {/* Gọn như phiếu mua: bỏ Mã số thuế, Địa chỉ (có ở Xuất HĐĐT), Thanh toán (đã ở thẻ đầu) */}
                  <Dg nhan="Ngày chứng từ">{String(ct.ngay ?? '').split(' ')[0]}</Dg>
                  <Dg nhan="Kho xuất">{ct._kho}</Dg>
                  <Dg nhan="Kênh bán hàng">{ct.kenh}</Dg>
                  <Dg nhan="Ghi chú">{ct.dienGiai}</Dg>
                  {dsThamChieu.length > 0 && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <span className="g link m-t834-tc">
                        {dsThamChieu.map(c => (
                          <button key={c.so} type="button" title={c.ten} onClick={c.mo}>
                            <span>{c.so}</span><Icon n="chevr" className="ic sm" />
                          </button>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Huỷ bán không có hoá đơn: không hiện hoá đơn gốc, xem chứng từ bán, hoá đơn thay thế qua Tham chiếu (T840) */}
                {(hd || hdNhap || (hdGoc && loaiCt !== 'HUYBAN')) && (
                  <>
                    <div className="m-pb-nhom">THÔNG TIN HOÁ ĐƠN</div>
                    {/* Thứ tự: Số hoá đơn (hoá đơn mới của chứng từ này), Ngày hoá đơn, Ký hiệu, Loại điều chỉnh, Hoá đơn gốc (chỉ số, bấm xem).
                        Không ghi Mã tra cứu: đã có ở thẻ tổng tiền (T838) */}
                    <div className="m-pb-the m-pb-the-gon m-t655-gon">
                      {hd && <Dg nhan="Số hoá đơn"><button type="button" className="m-t835-so-hd" onClick={() => setXemHd({ r: ct, hd })}>{hd.so}<Icon n="chevr" className="ic sm" /></button></Dg>}
                      {/* Hoá đơn thay thế, điều chỉnh chưa phát hành: xem bản dự thảo như web T798 */}
                      {hdNhap && <Dg nhan="Số hoá đơn"><button type="button" className="m-t835-so-hd m-t838-nhap" onClick={() => setXemHd({ r: ct, hd: hdNhap, nhap: true })}>Dự thảo<Icon n="chevr" className="ic sm" /></button></Dg>}
                      {(hd ?? hdNhap) && <Dg nhan="Ngày hoá đơn">{(hd ?? hdNhap)!.ngay}</Dg>}
                      {(hd ?? hdNhap) && <Dg nhan="Ký hiệu">{`${(hd ?? hdNhap)!.mau}${(hd ?? hdNhap)!.kyHieu}`}</Dg>}
                      {loaiCt === 'HDDIEUCHINH' && <Dg nhan="Loại điều chỉnh">{ct._dcLoai === 'tang' ? 'Điều chỉnh tăng' : 'Điều chỉnh giảm'}</Dg>}
                      {hdGoc && loaiCt !== 'HUYBAN' && (
                        <Dg nhan="Hoá đơn gốc">
                          <button type="button" className="m-t835-so-hd" onClick={() => setXemHd({ r: rows.find(x => String(x.id) === hdGoc.id) ?? ct, hd: hdGoc.hd })}>{hdGoc.hd.so}<Icon n="chevr" className="ic sm" /></button>
                        </Dg>
                      )}
                    </div>
                  </>
                )}

                <div className="m-pb-nhom m-t834-nhom-hang">
                  <span>HÀNG HOÁ, DỊCH VỤ</span>
                  <small>{dsDong.length} dòng</small>
                </div>
                <div className="m-t449-hang-ds">
                  {dsDong.map((d, idx) => {
                    const dt = dtDong(d)
                    const giamThue = tyLe ? giamThueHang(dt, d.ma) : 0
                    return (
                      <div key={`${d.ma}-${idx}`} className="m-t449-hang-the">
                        <div className="m-t449-hang-dau">
                          <div className="m-t449-hang-ten">
                            {idx + 1}. {d.ten || 'Mặt hàng'}
                            {d.ma ? <> <span className="m-t449-hang-ma">{d.ma}</span></> : null}
                          </div>
                        </div>
                        <div className="m-t449-hang-than">
                          <Hd nhan="Số lượng:" dam>{soLuong(d.sl)} {d.dvt}</Hd>
                          <Hd nhan="Đơn giá:">{money(d.gia || 0)} đ</Hd>
                          {(d.giam ?? 0) > 0 && <Hd nhan="Giảm giá:">{money(d.giam ?? 0)} đ</Hd>}
                          {(d.ck ?? 0) > 0 && <Hd nhan="Chiết khấu:">{money(d.ck ?? 0)} đ</Hd>}
                          {(d.phiDv ?? 0) > 0 && <Hd nhan="Phí dịch vụ:">{money(d.phiDv ?? 0)} đ</Hd>}
                          {tyLe
                            ? giamThue > 0 && <Hd nhan="Giảm thuế GTGT:">{money(giamThue)} đ</Hd>
                            : Number(d.thue) > 0 && <Hd nhan={`VAT (${d.ts}%):`}>{money(d.thue)} đ</Hd>}
                          <Hd nhan="Tổng tiền:" dam>{money(dt + (tyLe ? -giamThue : d.thue))} đ</Hd>
                        </div>
                      </div>
                    )
                  })}

                  <div className="m-t600-the-tong">
                    <div className="m-t600-tong-tieu"><span>Tổng cộng ({dsDong.length} dòng, SL {soLuong(khoan.sl)})</span></div>
                    <div className="m-t600-tong-dong"><span>Tiền hàng</span><span className="num">{money(khoan.tienHang)}</span></div>
                    {khoan.giam > 0 && <div className="m-t600-tong-dong"><span>Giảm giá</span><span className="num">{money(khoan.giam)}</span></div>}
                    {khoan.ck > 0 && <div className="m-t600-tong-dong"><span>Chiết khấu</span><span className="num">{money(khoan.ck)}</span></div>}
                    {khoan.phiDv > 0 && <div className="m-t600-tong-dong"><span>Phí dịch vụ</span><span className="num">{money(khoan.phiDv)}</span></div>}
                    <div className="m-t600-tong-dong"><span>Doanh thu tính thuế</span><span className="num">{money(khoan.dt)}</span></div>
                    {tyLe
                      ? <div className="m-t600-tong-dong"><span>Giảm thuế GTGT</span><span className="num">{money(khoan.giamThue)}</span></div>
                      : <div className="m-t600-tong-dong"><span>Thuế GTGT</span><span className="num">{money(khoan.thue)}</span></div>}
                    <div className="m-t600-tong-dong tong-chinh"><span>Tổng tiền</span><span className="bold num">{money(Number(ct.tong ?? 0))} đ</span></div>
                  </div>
                </div>
            </>
          </div>

          {/* Chân ghim như phiếu nhập mua: Trả lại nút phụ, Xuất HĐĐT nút chính; không còn tiện ích thì không có chân */}
          {(coTraLai || coXuatHd) && (
            <div className="m-pb-day">
              <div className="m-pb-day-nut">
                {coTraLai && (
                  <button type="button" className={coXuatHd ? 'm-pb-btn-phu m-t834-nut' : 'm-pb-btn-sua m-t834-nut'} onClick={moTraLai}>
                    <Icon n="back" className="ic sm" /><span>Trả lại</span>
                  </button>
                )}
                {coXuatHd && (
                  <button type="button" className="m-pb-btn-sua m-t834-nut" onClick={() => setMoHd(true)}>
                    <Icon n="receipt" className="ic sm" /><span>Xuất HĐĐT</span>
                  </button>
                )}
              </div>
            </div>
          )}
          {xemHd && <HopXemHd s={s} r={xemHd.r} hd={xemHd.hd} nhap={xemHd.nhap} toast={toast} dienThoai onDong={() => setXemHd(null)} />}
          {moHd && <HopXuatHddt s={s} man={man} ds={[ct]} onDong={() => setMoHd(false)} toast={toast} />}
        </div>
      )}
    </>
  )
}

/** Tab Bán hàng 3.1.7 gói Pro (T833): danh sách, chi tiết như gói Plus; lập, sửa chứng từ vẫn theo form chung */
export const MBanHangPro: FC<ScreenProps> = props => {
  const { id } = useParams()
  const [sp] = useSearchParams()
  if (id === 'moi' || sp.get('sua') === '1') return <MChungTu {...props} />
  return <BanTayPro {...props} idMo={id} />
}
const BanTayPro: FC<ScreenProps & { idMo?: string }> = ({ sc, mod, idMo }) => {
  const { rows } = useDongChungTu(sc, mod)
  return <MBanHangTay sc={sc} mod={mod} rows={rows} duong={duongDan(mod, sc)} idMo={idMo} />
}

/** Một dòng nhãn trái, giá trị phải như thẻ Thông tin chung phiếu nhập mua (T655); trống thì ẩn */
function Dg({ nhan, children, dam }: { nhan: string; children?: ReactNode; dam?: boolean }) {
  if (children === undefined || children === null || children === '') return null
  return (
    <div className="m-pb-dong">
      <span className="n">{nhan}</span>
      <span className={`g${dam ? ' bold' : ''}`}>{children}</span>
    </div>
  )
}

/** Một dòng trong thẻ mặt hàng như phiếu nhập mua (T449) */
function Hd({ nhan, children, dam }: { nhan: string; children: ReactNode; dam?: boolean }) {
  return (
    <div className="m-t449-hang-dong">
      <span className="lbl">{nhan}</span>
      <span className={`val num${dam ? ' bold' : ''}`}>{children}</span>
    </div>
  )
}
