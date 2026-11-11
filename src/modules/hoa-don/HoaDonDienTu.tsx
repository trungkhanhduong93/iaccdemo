// Menu Hoá đơn điện tử (QD106, T786): danh sách hoá đơn đã lập từ chứng từ bán hàng, cặp hoá đơn điều chỉnh thay thế, thông báo sai sót.
// Hoá đơn lấy từ chứng từ bán hàng lập tay đã phát hành (T785), hoá đơn thay thế, điều chỉnh kể cả dự thảo (T787)
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { gtgtTyLe, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Dropdown, Select } from '../../ui/Dropdown'
import { Table } from '../../ui/Table'
import { dmy, fold, money } from '../../ui/format'
import { DON_VI, HOM_NAY } from '../../data/mock'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, cotChon, useCauHinhLoc, useCotDs, useDongEsc, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
import { apKhoPhieu, useBanPhieu } from '../../ui/generic/daXoa'
import { hangTay, mauTay } from '../ban-hang/ChungTuBanHang'
import {
  HopXemHd, KHACH_TRONG, TEN_LOAI_CT, Vo, hdCua, hdGocCua, laHdMoiCua, laMayTinhTien, loaiCtCua, lyDoKhongLap, hdMoiNhap, phatHanhNhap, ttHdGoc, xoaCtHd,
  ttXemHd, type CtLq, type HdDaXuat, type TtKhach,
} from '../ban-hang/hddt'
import { HopChiaSeHd } from '../ban-hang/HopChiaSeHd'
import { pdfHd, tenFileHd, xmlHd } from '../ban-hang/hddtFile'
import { luuFile } from '../../ui/luuFile'
import { taoZip } from '../../ui/zip'

/** Màn chứng từ bán hàng lập tay: gói Plus ở tab Bán hàng của Xuất bán POS, gói Pro ở 3.1.7 */
const MAN_PL = 'ban-hang/3-1-1', MAN_PR = 'ban-hang/3-1-7'

// ── Kho trong phiên: hoá đơn đã gửi CQT, thông báo sai sót ──
/** Trạng thái thuế của TBSS: chưa gửi, CQT chấp nhận, CQT từ chối (T796) */
type TtTbss = 'Chưa gửi' | 'CQT chấp nhận' | 'CQT từ chối'
/** Thông báo sai sót mẫu 04/SS-HĐĐT; địa chỉ, email người mua lấy theo hoá đơn sai sót, email nhận mẫu TBSS khi gửi CQT (T796) */
interface Tbss {
  id: string; mau: string; kyHieu: string; so: string; ngay: string; loai: string; noiDung: string; tt: TtTbss; ngayTao: string
  maCqt: string; nguoiMua: string; diaChi: string; email: string
  /** TBSS mẫu: id chứng từ bán hàng mẫu có hoá đơn sai sót; mẫu số, ký hiệu, số, người mua lấy theo hoá đơn đó (T797) */
  ctMau?: string
}
const daGui = new Set<string>()
// TBSS mẫu trỏ hoá đơn có trong tab Hoá đơn điện tử: tay-9 số 121 (hoá đơn gốc), tay-10 số 119 (bị thay thế bởi HDTT2610-0001) (T797)
const TB_TRONG = { mau: '', kyHieu: '', so: '', ngay: '', loai: '', maCqt: '', nguoiMua: '', diaChi: '', email: '' }
let dsTbss: Tbss[] = [
  { ...TB_TRONG, id: 'tb-1', ctMau: 'tay-9', noiDung: 'Sai địa chỉ người mua', tt: 'Chưa gửi', ngayTao: '03/10/2026' },
  { ...TB_TRONG, id: 'tb-2', ctMau: 'tay-10', noiDung: 'Sai tên đơn vị người mua, đã lập hoá đơn thay thế', tt: 'CQT chấp nhận', ngayTao: '07/10/2026' },
]
/** TBSS mẫu lấy thông tin hoá đơn theo dòng tab Hoá đơn điện tử; TBSS lập trong phiên giữ nguyên */
function tbssDu(tb: Tbss, dsHd: Row[]): Tbss {
  const r = tb.ctMau ? dsHd.find(x => x.id === `${MAN_PL}|${tb.ctMau}`) : undefined
  if (!r) return tb
  return { ...tb, mau: String(r.mau), kyHieu: String(r.kyHieu), so: String(r.soHd), ngay: String(r.ngay), loai: String(r.loai), maCqt: String(r.maCqt ?? ''),
    nguoiMua: String(r.tenDv || r.nguoiMua || ''), diaChi: tb.diaChi || String(r.diaChi ?? ''), email: tb.email || String(r.email ?? '') }   // email sửa ở popup xem TBSS giữ lại
}
/** Dòng tab Hoá đơn điện tử: hoá đơn từ chứng từ bán hàng lập tay gói Plus, Pro, mới nhất trên đầu */
function dsDongHd(tyLe: boolean): Row[] {
  return [
    ...apKhoPhieu(MAN_PL, mauTay()).map(r => hangTay(r, tyLe)).map(r => dongHd(r, MAN_PL)),
    ...apKhoPhieu(MAN_PR, []).map(r => dongHd(r, MAN_PR)),
  ].filter((r): r is Row => r !== null)
    .sort((a, b) => docNgay(String(b.ngay)).getTime() - docNgay(String(a.ngay)).getTime() || String(b.soHd).localeCompare(String(a.soHd)))
}
let ban = 0
const nghe = new Set<() => void>()
const bao = () => { ban++; nghe.forEach(f => f()) }
const useKho = () => useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => ban)
const homNay = () => dmy(HOM_NAY)
/** Số hoá đơn dự thảo chưa phát hành (T796) */
const SO_NHAP = '00000000'

/** Một dòng danh sách hoá đơn từ chứng từ đã phát hành */
function dongHd(r: Row, man: string): Row | null {
  const hd = hdCua(r)
  const loaiCt = loaiCtCua(r)
  const nhap = !hd && laHdMoiCua(r)   // hoá đơn thay thế, điều chỉnh còn dự thảo (T787)
  if ((!hd && !nhap) || loaiCt === 'HUYBAN') return null   // huỷ bán không xuất hoá đơn (QD107)
  const k: TtKhach = { ...KHACH_TRONG, ...(r._khachHd as Partial<TtKhach> | undefined) }
  const cty = k.loai === 'cty'
  const id = `${man}|${r.id}`
  const mauKh = hd ? hd.mau + hd.kyHieu : String(r._kyHieuHd ?? '')
  const mtt = laMayTinhTien(mauKh)
  const gui = daGui.has(id)
  const tien = hd ?? (r._tienHd as Partial<HdDaXuat> | undefined) ?? {}
  const goc = hdGocCua(r)
  const ttGoc = man === MAN_PL ? ttHdGoc(man, r) : null
  return {
    // Bị thay thế, bị điều chỉnh là loại hoá đơn; trạng thái HĐĐT chỉ Dự thảo hoặc Đã phát hành (T795)
    id, loai: ttGoc ? `Hoá đơn ${ttGoc.toLowerCase()}` : loaiCt === 'XBAN' ? 'Hoá đơn gốc' : TEN_LOAI_CT[loaiCt], ttHd: nhap ? 'Dự thảo' : 'Đã phát hành',
    mau: mauKh[0] ?? '', kyHieu: mauKh.slice(1), mauKh, soHd: hd?.so ?? '', ngay: hd?.ngay ?? String(r._ngayHd ?? ''), so: r.so,
    tenDv: cty ? k.tenDv : '', mst: cty ? k.mst : '', diaChi: k.diaChi, email: k.email, nguoiMua: k.tenNm || hd?.nguoiMua || '', maQhns: cty ? k.maQhns : '',
    ttThue: nhap ? '' : !mtt ? 'Hợp lệ' : gui ? 'Đã gửi TCTN' : 'Chưa gửi TCTN',
    truoc: tien.truoc ?? 0, thue: tien.thue ?? 0, tong: tien.tong ?? 0, maCqt: !hd || (mtt && !gui) ? '' : hd.ma, traCuu: hd?.traCuu ?? '',
    goc: goc ? `${goc.hd.mau}${goc.hd.kyHieu} số ${goc.hd.so}` : '',
    _r: r, _man: man, _hd: hd,
    // Lý do không lập được thay thế, điều chỉnh: hoá đơn đã bị thay thế, đang có thay thế dự thảo (T787)
    _lyTt: man === MAN_PL ? lyDoKhongLap(man, r, 'tt') : 'Chỉ lập ở chứng từ bán hàng gói Plus', _lyDc: man === MAN_PL ? lyDoKhongLap(man, r, 'dc') : 'Chỉ lập ở chứng từ bán hàng gói Plus',
    // Có thay thế, điều chỉnh dự thảo: dấu cảnh báo ở cột Loại hoá đơn (T795)
    _nhapMoi: !nhap && man === MAN_PL ? hdMoiNhap(man, r) ?? null : null,
  }
}

type Viec = 'ph' | 'dc' | 'tt' | 'tbss' | 'gui' | 'xml' | 'pdf' | 'mail' | 'share' | 'xoa'
const VIEC: [Viec, string, string][] = [
  ['ph', 'Phát hành', 'receipt'], ['dc', 'Điều chỉnh', 'edit'], ['tt', 'Thay thế', 'swap'], ['tbss', 'Tạo TBSS', 'alert'], ['gui', 'Gửi CQT', 'upload'],
  ['xml', 'Tải XML', 'download'], ['pdf', 'Tải PDF', 'download'], ['mail', 'Gửi email', 'mail'], ['share', 'Chia sẻ PDF', 'link'], ['xoa', 'Xoá', 'trash'],
]
/** Lý do chức năng không dùng được với hoá đơn, dùng được thì null */
function lyDo(v: Viec, r: Row): string | null {
  const nhap = r.ttHd === 'Dự thảo'
  switch (v) {
    case 'ph': case 'xoa': return nhap ? null : 'Chỉ dùng với hoá đơn dự thảo'
    case 'dc': case 'tt': case 'tbss':
      if (nhap || r.ttThue !== 'Hợp lệ') return 'Chỉ dùng với hoá đơn đã phát hành, trạng thái thuế Hợp lệ'
      return v === 'tt' ? (r._lyTt as string | null) : v === 'dc' ? (r._lyDc as string | null) : r.loai === 'Hoá đơn bị thay thế' ? 'Hoá đơn đã bị thay thế, chỉ xem' : null
    case 'gui':
      if (!laMayTinhTien(String(r.kyHieu))) return 'Chỉ hoá đơn máy tính tiền (ký hiệu có chữ M ở vị trí thứ 4) mới gửi CQT'
      if (nhap) return 'Phát hành hoá đơn trước khi gửi CQT'
      return r.ttThue === 'Đã gửi TCTN' ? 'Hoá đơn đã gửi CQT' : null
    default: return nhap ? 'Hoá đơn dự thảo chưa phát hành' : null
  }
}

const COT_CO_DINH = new Set(['chk', 'loai', 'action'])
const COT_CHON = new Set(['loai', 'ttHd', 'mauKh', 'ttThue'])
const COT_SO = new Set(['truoc', 'thue', 'tong'])
const kieuCot = (k: string): KieuLoc => (k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : COT_SO.has(k) ? 'so' : 'chu')
const chuCot = (k: string, r: Row) => { const v = r[k]; return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '') }

interface GtLoc { thoiGian: KhoangNgay; tim: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangMacDinh(), tim: '' })

/** Tab Hoá đơn điện tử: lọc như danh sách chứng từ, thao tác từng hoá đơn ở menu ⋯, chọn nhiều chỉ Gửi CQT, Tải XML, Tải PDF */
export function DsHoaDon({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  useBanPhieu(); useKho()
  const tyLe = gtgtTyLe(s)
  const rows = dsDongHd(tyLe)

  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [chip, setChip] = useState('all')
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [xem, setXem] = useState<Row | null>(null)
  const [tbss, setTbss] = useState<Row | null>(null)
  const [chiaSe, setChiaSe] = useState<Row | null>(null)

  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số HĐ, tên đơn vị, MST, người mua" aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') loc0.loc() }} /> },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim'])

  const truocChip = rows.filter(r => {
    if (!trongKhoang(docNgay(String(r.ngay)), ap.thoiGian)) return false
    if (ap.tim.trim() && !fold(`${r.soHd} ${r.tenDv} ${r.mst} ${r.nguoiMua}`).includes(fold(ap.tim.trim()))) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(String(r.ngay)) : undefined)) return false
    }
    return true
  })
  const theoChip = (r: Row, k: string) => (k === 'Dự thảo' ? r.ttHd === 'Dự thảo' : r.ttHd !== 'Dự thảo')
  const list = chip === 'all' ? truocChip : truocChip.filter(r => theoChip(r, chip))
  const chips: Chip[] = [
    { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: truocChip.length },
    { k: 'Đã phát hành', ten: 'Đã phát hành', mau: 'var(--green)', so: truocChip.filter(r => theoChip(r, 'Đã phát hành')).length },
    { k: 'Dự thảo', ten: 'Dự thảo', mau: 'var(--orange)', so: truocChip.filter(r => r.ttHd === 'Dự thảo').length },
  ]

  const tenSo = (r: Row) => `số ${r.soHd || '(chưa cấp)'}`
  const lam = (v: Viec, r: Row) => {
    // Thay thế, điều chỉnh: mở form chép sẵn chứng từ gốc ở màn xuất bán (T787)
    if (v === 'dc' || v === 'tt') { nav(`/app/${MAN_PL}/moi?lap=${v}&goc=${encodeURIComponent(String((r._r as Row).id))}`); return }
    // Phát hành, xoá hoá đơn thay thế, điều chỉnh dự thảo; xoá thay thế thì xoá luôn huỷ bán (T787)
    if (v === 'ph') { const hd = phatHanhNhap(s, String(r._man), r._r as Row); toast(`Đã phát hành hoá đơn ${hd.mau}${hd.kyHieu} số ${hd.so}`); return }
    if (v === 'xoa') { xoaCtHd(String(r._man), r._r as Row, s.ten); toast(`Đã xoá ${String(r.loai).toLowerCase()} dự thảo ${r.so}`); return }
    if (v === 'tbss') { setTbss(r); return }
    if (v === 'gui') { daGui.add(String(r.id)); bao(); toast(`Đã gửi hoá đơn ${tenSo(r)} lên cơ quan thuế`); return }
    // Tải XML, PDF: chọn nơi lưu như ở popup xem hoá đơn; Chia sẻ: mở popup chọn ứng dụng (T793)
    if (v === 'xml' || v === 'pdf') { const f = fileHd(r, v); void luuFile(f.blob, f.ten).then(m => m && toast(m)); return }
    if (v === 'share') { setChiaSe(r); return }
    const BAO: Record<string, string> = { ph: 'Đã phát hành hoá đơn', mail: 'Đã gửi email hoá đơn cho người mua,', xoa: 'Đã xoá hoá đơn dự thảo' }
    toast(`${BAO[v]} ${tenSo(r)}`)
  }
  /** File XML, PDF của một hoá đơn đã phát hành */
  const fileHd = (r: Row, duoi: 'xml' | 'pdf') => {
    const hd = r._hd as HdDaXuat
    const t = ttXemHd(s, r._r as Row, hd)
    return { ten: tenFileHd(hd, duoi), blob: duoi === 'pdf' ? pdfHd(hd, t) : xmlHd(hd, t) }
  }
  const chonDs = list.filter(r => chon.has(String(r.id)))
  const lamNhieu = async (v: 'gui' | 'xml' | 'pdf') => {
    const duoc = chonDs.filter(r => !lyDo(v, r))
    const bo = chonDs.length - duoc.length
    if (!duoc.length) { toast('Không hoá đơn nào đã chọn đủ điều kiện'); return }
    const boQua = bo ? `, bỏ qua ${bo} hoá đơn không đủ điều kiện` : ''
    if (v === 'gui') {
      duoc.forEach(r => daGui.add(String(r.id))); bao()
      toast(`Đã gửi CQT ${duoc.length} hoá đơn${boQua}`); setChon(new Set()); return
    }
    // Tải nhiều: gói mỗi hoá đơn một file XML hoặc PDF vào một file zip, chọn nơi lưu (T793)
    const zip = await taoZip(duoc.map(r => fileHd(r, v)))
    const m = await luuFile(zip, `HoaDon_${v.toUpperCase()}_${duoc.length}hd_${dmy(HOM_NAY).replace(/\//g, '')}.zip`)
    if (m) toast(`${m} (${duoc.length} hoá đơn${boQua})`)
  }

  const chu = (k: string, t: string, w: number, cls?: string): Col => ({ k, t, w, ...(cls ? { cls } : {}) })
  const cols: Col[] = [
    cotChon(list, chon, setChon),
    { k: 'loai', t: 'Loại hoá đơn', w: 170, dinh: 'trai', r: r => { const c = r._nhapMoi as CtLq | null
      // TBSS lưu nháp chưa gửi CQT: cảnh báo cùng kiểu tại hoá đơn có sai sót (T796)
      const tbNhap = dsTbss.some(x => x.tt === 'Chưa gửi' && (x.ctMau ? r.id === `${MAN_PL}|${x.ctMau}`
        : x.mau === String(r.mau) && x.kyHieu === String(r.kyHieu) && x.so === String(r.soHd)))
      const bao = [c && `Có hoá đơn dự thảo ${c.loai === 'HDTHAYTHE' ? 'thay thế' : 'điều chỉnh'} ${c.so} chờ phát hành`,
        tbNhap && 'Có thông báo sai sót lưu nháp, chưa gửi CQT'].filter(Boolean).join('. ')
      return <>{r.loai}{bao && <span className="hd-canh-bao" title={bao} aria-label={bao}><Icon n="alert" className="ic sm" /></span>}</> } },
    { k: 'ttHd', t: 'Trạng thái HĐĐT', w: 140, r: r => <span className={`ph-tt${r.ttHd === 'Đã phát hành' ? ' da' : ''}`}>{r.ttHd}</span> },
    // Mẫu số ghép với ký hiệu như màn xuất (vd 1C26TAA): ký tự đầu là mẫu số, 6 ký tự sau là ký hiệu
    chu('mauKh', 'Mẫu số - Ký hiệu', 140, 'code'),
    // Dự thảo chưa có số: ghi 00000000, không mở xem (T796)
    { k: 'soHd', t: 'Số HĐ', w: 110, r: r => r.soHd ? <button type="button" className="ds-link-so" title="Xem hoá đơn" onClick={e => { e.stopPropagation(); setXem(r) }}>{r.soHd}</button>
      : r.ttHd === 'Dự thảo' ? <span className="code dim">{SO_NHAP}</span> : null },
    { k: 'ngay', t: 'Ngày HĐ', w: 110 },
    { k: 'so', t: 'Số chứng từ', w: 140, r: r => <button type="button" className="ds-link-so" title="Mở chứng từ bán hàng"
      onClick={e => { e.stopPropagation(); nav(`/app/${r._man}/${(r._r as Row).id}`) }}>{r.so}</button> },
    chu('tenDv', 'Tên đơn vị', 220), chu('mst', 'MST', 120, 'code'), chu('diaChi', 'Địa chỉ', 220), chu('nguoiMua', 'Người mua', 170), chu('maQhns', 'Mã QHNS', 100),
    { k: 'ttThue', t: 'Trạng thái thuế', w: 140, r: r => <span className={`hddt-thue ${r.ttThue === 'Hợp lệ' || r.ttThue === 'Đã gửi TCTN' ? 'tot' : r.ttThue === 'TCTN từ chối' ? 'loi' : 'cho'}`}>{r.ttThue}</span> },
    { k: 'truoc', t: tyLe ? 'Tiền hàng' : 'Trước thuế', num: true, w: 120 },
    { k: 'thue', t: tyLe ? 'Giảm trừ thuế' : 'Tiền thuế', num: true, w: 110 },
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120 },
    chu('maCqt', 'Mã CQT', 130, 'code'), chu('traCuu', 'Mã tra cứu', 130, 'code'), chu('goc', 'Hoá đơn gốc', 200),
    { k: 'action', t: 'Thao tác', w: 76, c: true, dinh: 'phai', r: r => (
      <span className="hddt-menu" onClick={e => e.stopPropagation()}>
        <Dropdown btnClass="icon-btn sm" align="end" width={200} title={`Thao tác với hoá đơn ${tenSo(r)}`} label={<Icon n="more" className="ic sm" />}>
          {dong => VIEC.map(([v, ten, ic]) => {
            const ly = lyDo(v, r)
            return (
              <button key={v} type="button" data-mi className={`mi${v === 'xoa' ? ' danger' : ''}`} disabled={Boolean(ly)} title={ly ?? undefined}
                onClick={() => { dong(); lam(v, r) }}>
                <span className="mi-ic"><Icon n={ic} kieu="net" className="ic sm" /></span><span className="mi-t"><b>{ten}</b></span>
              </button>
            )
          })}
        </Dropdown>
      </span>
    ) },
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)
  const tong = (k: string) => list.reduce((a, r) => a + Number(r[k] || 0), 0)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="voucher-split">
        <section className="card voucher-top">
          <div className="ds-toolbar-figma">
            <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
              onLoc={loc0.loc} onXoaHet={loc0.xoaNhap} chiNutPheu />
          </div>
          <div className="ds-hang-trang-thai">
            <ChipTrangThai ds={chips} chon={chip} onChon={k => { setChip(k); setChon(new Set()) }} />
            <div className="ds-toolbar-phai ds-cong-cu-h2">
              {chon.size > 0 && <>
                <span className="hddt-da-chon">Đã chọn {chon.size}</span>
                <button type="button" className="btn sm" title="Chỉ gửi hoá đơn máy tính tiền chưa gửi" onClick={() => lamNhieu('gui')}><Icon n="upload" className="ic sm" />Gửi CQT</button>
                <button type="button" className="btn sm" onClick={() => lamNhieu('xml')}><Icon n="download" className="ic sm" />Tải XML</button>
                <button type="button" className="btn sm" onClick={() => lamNhieu('pdf')}><Icon n="download" className="ic sm" />Tải PDF</button>
              </>}
              <button type="button" className="icon-btn" title="Tải lại" aria-label="Tải lại" onClick={() => { loc0.xoaHet(); setLocCot({}); setChip('all') }}><Icon n="refresh" className="ic sm" /></button>
              <NutXuatExcel onXuat={() => toast(`Đã xuất ${list.length} hoá đơn ra Excel`)} />
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang} onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
            </div>
          </div>
          {list.length || Object.keys(locCot).length ? (
            <Table cols={cot.colsHien} rows={list} motDong keDoc doRong={cot.doRong}
              loc={{ gt: locCot, dat: (k, g) => setLocCot(x => ({ ...x, [k]: g })), bo: new Set(['chk', 'action']), kieu: c => kieuCot(c.k),
                layLuaChon: k => dsGiaTri(rows, r => chuCot(k, r)) }}
              onDbl={r => (r._hd ? setXem(r) : nav(`/app/${r._man}/${(r._r as Row).id}`))}   // dự thảo chưa có hoá đơn: mở chứng từ (T787)
              sum={{ loai: `Cộng ${list.length} hoá đơn`, truoc: tong('truoc'), thue: tong('thue'), tong: tong('tong') }} />
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Chưa có hoá đơn điện tử trong thời gian này</b>
              <span>Hoá đơn sinh ra khi phát hành từ chứng từ bán hàng lập tay.</span>
            </div>
          )}
        </section>
      </div>
      {xem && <HopXemHd s={s} r={xem._r as Row} hd={xem._hd as HdDaXuat} toast={toast} onDong={() => setXem(null)} />}
      {chiaSe && <HopChiaSeHd hd={chiaSe._hd as HdDaXuat} t={ttXemHd(s, chiaSe._r as Row, chiaSe._hd as HdDaXuat)} toast={toast} onDong={() => setChiaSe(null)} />}
      {tbss && <HopTbss r={tbss} onDong={() => setTbss(null)} onLuu={({ noiDung, diaChi, email }, gui) => {
        dsTbss = [{
          id: `tb-${Date.now()}`, mau: String(tbss.mau), kyHieu: String(tbss.kyHieu), so: String(tbss.soHd), ngay: String(tbss.ngay), loai: String(tbss.loai), noiDung,
          tt: gui ? 'CQT chấp nhận' : 'Chưa gửi', ngayTao: homNay(), maCqt: String(tbss.maCqt ?? ''), nguoiMua: String(tbss.tenDv || tbss.nguoiMua || ''), diaChi, email,
        }, ...dsTbss]
        bao(); setTbss(null)
        toast(gui ? `Đã gửi thông báo sai sót lên cơ quan thuế${email ? `, gửi mẫu TBSS tới ${email}` : ''}` : 'Đã lưu nháp thông báo sai sót, xem ở tab Thông báo sai sót')
      }} />}
    </div>
  )
}

/** Popup lập thông báo sai sót (mẫu 04/SS-HĐĐT) cho một hoá đơn */
function HopTbss({ r, onDong, onLuu }: { r: Row; onDong: () => void; onLuu: (x: { noiDung: string; diaChi: string; email: string }, gui: boolean) => void }) {
  useDongEsc(onDong)
  const [nd, setNd] = useState('')
  // Địa chỉ, email mặc định lấy trên hoá đơn có sai sót, sửa được (T796)
  const [diaChi, setDiaChi] = useState(String(r.diaChi ?? ''))
  const [email, setEmail] = useState(String(r.email ?? ''))
  const [thu, setThu] = useState(false)
  const saiMail = Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const luu = (gui: boolean) => {
    if (!nd.trim() || saiMail) { setThu(true); return }
    onLuu({ noiDung: nd.trim(), diaChi: diaChi.trim(), email: email.trim() }, gui)
  }
  return (
    <Vo hep tieuDe="Thông báo hoá đơn có sai sót" onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn" onClick={() => luu(false)}>Lưu nháp</button>
      <button type="button" className="btn pri" onClick={() => luu(true)}>Lưu và gửi CQT</button>
    </>}>
      {/* Mọi thông tin chung một khung, nhãn một cột (T796) */}
      <div className="hddt-bang hddt-tbss">
        <div className="hddt-o"><span>Hoá đơn</span><div><b className="hddt-gt code">{String(r.mau)}{String(r.kyHieu)} · {String(r.soHd)} · {String(r.ngay)}</b></div></div>
        <div className="hddt-o"><span>Người mua</span><div><b className="hddt-gt">{String(r.tenDv || r.nguoiMua)}</b></div></div>
        <label className="hddt-o"><span>Địa chỉ</span>
          <div><input className="hddt-inp" value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder="Địa chỉ người mua" /></div></label>
        <label className={`hddt-o${thu && saiMail ? ' loi' : ''}`} title={thu && saiMail ? 'Email chưa đúng dạng' : undefined}><span>Email nhận TBSS</span>
          <div><input className="hddt-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Gửi CQT xong thì gửi mẫu TBSS tới email này" /></div></label>
        <label className={`hddt-o${thu && !nd.trim() ? ' loi' : ''}`}><span>Nội dung sai sót<em>*</em></span>
          <div><textarea className="hddt-inp" rows={4} value={nd} onChange={e => setNd(e.target.value)} placeholder="Vd: sai địa chỉ người mua" /></div></label>
      </div>
    </Vo>
  )
}

// ── Tab Điều chỉnh thay thế: mỗi dòng một cặp hoá đơn gốc và hoá đơn mới: cặp lập thật (T787) rồi dữ liệu mẫu ──
/** Cặp hoá đơn; cặp lập thật (T787) có thêm chứng từ gốc, chứng từ mới để mở */
interface CapHd {
  id: string; loai: 'Điều chỉnh' | 'Thay thế'; goc: [string, string, string, string, number]; moi: [string, string, string, string, number]; nguoiMua: string
  /** Trạng thái HĐĐT, trạng thái thuế của hoá đơn mới như tab Hoá đơn điện tử; dự thảo chưa có trạng thái thuế (T798) */
  ttHd: 'Dự thảo' | 'Đã phát hành'; tt: string
  ctGoc?: [string, string]; ctMoi?: [string, string]; rGoc?: Row; rMoi?: Row
}
/** Cặp hoá đơn từ hoá đơn thay thế, điều chỉnh đã lập ở màn xuất bán (T787) */
function capThat(tyLe: boolean): CapHd[] {
  const ds = apKhoPhieu(MAN_PL, mauTay()).map(r => hangTay(r, tyLe))
  return ds.filter(r => laHdMoiCua(r) && hdGocCua(r)).map(r => {
    const g = hdGocCua(r)!, hd = hdCua(r), rGoc = ds.find(x => String(x.id) === g.id)
    const mauKh = hd ? hd.mau + hd.kyHieu : String(r._kyHieuHd ?? '')
    const id = `${MAN_PL}|${r.id}`
    return {
      id, loai: loaiCtCua(r) === 'HDTHAYTHE' ? 'Thay thế' : 'Điều chỉnh', nguoiMua: String(r.doiTuong ?? ''),
      goc: [g.hd.mau, g.hd.kyHieu, g.hd.so, g.hd.ngay, g.hd.tong ?? Number(rGoc?.tong) ?? 0],
      moi: [mauKh[0] ?? '', mauKh.slice(1), hd?.so ?? '', hd?.ngay ?? String(r._ngayHd ?? ''), Number(r.tong) || 0],
      ttHd: hd ? 'Đã phát hành' : 'Dự thảo', tt: !hd ? '' : !laMayTinhTien(mauKh) ? 'Hợp lệ' : daGui.has(id) ? 'Đã gửi TCTN' : 'Chưa gửi TCTN',
      ctGoc: [g.id, g.so], ctMoi: [String(r.id), String(r.so)], rGoc, rMoi: r,
    }
  })
}
/** Hoá đơn dự thảo để xem mẫu: ký hiệu, ngày, tiền đã lưu trên chứng từ, số 00000000 (T798) */
function hdNhap(r: Row): HdDaXuat {
  const kh = String(r._kyHieuHd ?? ''), tien = (r._tienHd as Partial<HdDaXuat> | undefined) ?? {}
  return { mau: kh[0] ?? '', kyHieu: kh.slice(1), so: SO_NHAP, ngay: String(r._ngayHd ?? ''), ma: '', truoc: tien.truoc, thue: tien.thue, tong: tien.tong }
}
/** Thao tác ở tab Điều chỉnh thay thế: dự thảo có Phát hành, Gửi CQT, Phát hành và Gửi CQT; đã phát hành chỉ Gửi CQT (T798) */
type ViecCap = 'ph' | 'gui' | 'phGui'
const VIEC_CAP: [ViecCap, string, string][] = [['ph', 'Phát hành', 'receipt'], ['gui', 'Gửi CQT', 'upload'], ['phGui', 'Phát hành và Gửi CQT', 'upload']]
// Bỏ 2 cặp mẫu không có chứng từ thật: mọi dòng đều có số chứng từ, bấm mở được (dinhlanphuongipacc 11/11/2026, T787)
const guiCap = new Set<string>()

/** Thanh lọc tab Điều chỉnh thay thế, Thông báo sai sót: thời gian, tìm kiếm như tab Hoá đơn điện tử, thêm ô chọn riêng của tab (T797) */
interface GtLocTab { thoiGian: KhoangNgay; tim: string; chon: string }
const locTabMacDinh = (): GtLocTab => ({ thoiGian: thangMacDinh(), tim: '', chon: '' })
function useLocTab(path: string, chon: { ten: string; ds: string[] }, goiY: string) {
  const loc0 = useLocNhap(locTabMacDinh)
  const { nhap, dat } = loc0
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder={goiY} aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') loc0.loc() }} /> },
    { k: 'chon', ten: chon.ten, coGiaTri: Boolean(nhap.chon), o: <Select className="ds-o-sel" value={nhap.chon} aria-label={chon.ten} onChange={e => dat('chon', e.target.value)}>
      <option value="">Tất cả</option>{chon.ds.map(v => <option key={v} value={v}>{v}</option>)}</Select> },
  ]
  const [cauHinh, datCauHinh] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'chon'])
  const thanh = <div className="ds-toolbar-figma">
    <BoLoc ds={oLoc} cauHinh={cauHinh} datCauHinh={datCauHinh} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap} onLoc={loc0.loc} onXoaHet={loc0.xoaNhap} chiNutPheu />
  </div>
  /** Dòng khớp lọc: ngày theo thời gian, chữ tìm trong các trường, giá trị ô chọn */
  const khop = (ngay: string, chu: string, gt: string) => trongKhoang(docNgay(ngay), loc0.ap.thoiGian)
    && (!loc0.ap.tim.trim() || fold(chu).includes(fold(loc0.ap.tim.trim()))) && (!loc0.ap.chon || gt === loc0.ap.chon)
  return { thanh, khop, xoaHet: loc0.xoaHet }
}

export function DieuChinhThayThe({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  useKho(); useBanPhieu()
  const [xem, setXem] = useState<{ r: Row; hd: HdDaXuat; nhap?: boolean } | null>(null)
  // Lọc theo ngày hoá đơn điều chỉnh, thay thế (dự thảo lấy ngày dự kiến); tìm số hoá đơn, số chứng từ, người mua (T797)
  const loc = useLocTab(duongDan(mod, sc), { ten: 'Loại', ds: ['Điều chỉnh', 'Thay thế'] }, 'Số HĐ, số chứng từ, người mua')
  const ds = capThat(gtgtTyLe(s)).filter(c => loc.khop(c.moi[3], `${c.goc[2]} ${c.moi[2]} ${c.ctGoc?.[1] ?? ''} ${c.ctMoi?.[1] ?? ''} ${c.nguoiMua}`, c.loai))
  const ttCua = (c: CapHd) => (c.ttHd === 'Dự thảo' ? '' : guiCap.has(c.id) || daGui.has(c.id) ? 'Đã gửi TCTN' : c.tt)
  const moXem = (c: CapHd, h: CapHd['goc'], ma: number, moi: boolean) => {
    // Dự thảo: xem mẫu hoá đơn dựng từ chứng từ, số 00000000 (T798)
    if (moi && c.ttHd === 'Dự thảo' && c.rMoi) { setXem({ r: c.rMoi, hd: hdNhap(c.rMoi), nhap: true }); return }
    const hdThat = c.rMoi && (moi ? hdCua(c.rMoi) : hdGocCua(c.rMoi)?.hd)
    if (hdThat) { setXem({ r: (moi ? c.rMoi : c.rGoc) ?? c.rMoi!, hd: hdThat }); return }
    const tong = h[4], thue = Math.round(tong / 13.5)
    setXem({ r: { id: c.id, doiTuong: c.nguoiMua }, hd: { mau: h[0], kyHieu: h[1], so: h[2], ngay: h[3], ma: `M26-${(0x3b0000 + ma).toString(16).toUpperCase()}`, nguoiMua: c.nguoiMua, truoc: tong - thue, thue, tong } })
  }
  // Số HĐ là link xem hoá đơn như tab Hoá đơn điện tử; dự thảo ghi 00000000, vẫn mở xem mẫu (T796, T798); số chứng từ cột riêng mở chứng từ (T787)
  const oSo = (c: CapHd, moi: boolean, ma: number) => {
    const h = moi ? c.moi : c.goc
    const nhap = moi && c.ttHd === 'Dự thảo'
    return <td className="code">{h[2] || nhap
      ? <button type="button" className="ds-link-so" title={nhap ? 'Xem mẫu hoá đơn dự thảo' : 'Xem hoá đơn'} onClick={() => moXem(c, h, ma, moi)}>{h[2] || SO_NHAP}</button>
      : <span className="dim">{SO_NHAP}</span>}</td>
  }
  /** Lý do thao tác không dùng được, theo luật tab Hoá đơn điện tử (hàm lyDo) */
  const lyViec = (v: ViecCap, c: CapHd): string | null => {
    const dong: Row = { id: c.id, ttHd: c.ttHd, kyHieu: c.moi[1], ttThue: ttCua(c) }
    if (v !== 'phGui') return lyDo(v, dong)
    return lyDo('ph', dong) ?? (laMayTinhTien(c.moi[1]) ? null : 'Chỉ hoá đơn máy tính tiền (ký hiệu có chữ M ở vị trí thứ 4) mới gửi CQT')
  }
  const lam = (v: ViecCap, c: CapHd) => {
    if (v === 'gui') { guiCap.add(c.id); bao(); toast(`Đã gửi hoá đơn số ${c.moi[2]} lên cơ quan thuế`); return }
    // Phát hành dự thảo như menu ⋯ tab Hoá đơn điện tử; Phát hành và Gửi CQT gửi luôn sau khi cấp số
    const hd = phatHanhNhap(s, MAN_PL, c.rMoi!)
    if (v === 'phGui') daGui.add(c.id)
    bao(); toast(`Đã phát hành hoá đơn ${hd.mau}${hd.kyHieu} số ${hd.so}${v === 'phGui' ? ', đã gửi lên cơ quan thuế' : ''}`)
  }
  const oCt = (c: CapHd, moi: boolean) => {
    const ct = moi ? c.ctMoi : c.ctGoc
    return <td>{ct && <button type="button" className="ds-link-so" title="Mở chứng từ" onClick={() => nav(`/app/${MAN_PL}/${ct[0]}`)}>{ct[1]}</button>}</td>
  }
  const oHd = (c: CapHd, h: CapHd['goc'], ma: number) => <>
    <td className="code">{h[0]}{h[1]}</td>{oSo(c, false, ma)}<td>{h[3]}</td><td className="num">{money(h[4])}</td>
    {oCt(c, false)}
  </>
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card voucher-top hddt-tab">
        {loc.thanh}
        <div className="hddt-bang hddt-dctt">
          <table className="tbl ke-doc mot-dong">
            <thead>
              <tr><th rowSpan={2}>Loại</th><th colSpan={5}>Hoá đơn bị điều chỉnh, thay thế</th><th colSpan={7}>Hoá đơn điều chỉnh, thay thế</th><th rowSpan={2} className="c">Thao tác</th></tr>
              <tr>{['Mẫu số - Ký hiệu', 'Số HĐ', 'Ngày HĐ', 'Tổng tiền', 'Số chứng từ'].map((t, i) => <th key={`g${i}`}>{t}</th>)}
                {['Mẫu số - Ký hiệu', 'Số HĐ', 'Ngày HĐ', 'Tổng tiền', 'Trạng thái HĐĐT', 'Trạng thái thuế', 'Số chứng từ'].map((t, i) => <th key={`m${i}`}>{t}</th>)}</tr>
            </thead>
            <tbody>
              {!ds.length && <tr><td colSpan={14} className="c dim">Chưa có hoá đơn điều chỉnh, thay thế trong thời gian này. Lập ở tab Hoá đơn điện tử, menu ⋯ của hoá đơn đã phát hành.</td></tr>}
              {ds.map((c, i) => {
                const tt = ttCua(c)
                return (
                  <tr key={c.id}>
                    <td>{c.loai}</td>
                    {oHd(c, c.goc, i * 2)}
                    <td className="code">{c.moi[0]}{c.moi[1]}</td>{oSo(c, true, i * 2 + 1)}<td>{c.moi[3]}</td><td className="num">{money(c.moi[4])}</td>
                    <td><span className={`ph-tt${c.ttHd === 'Đã phát hành' ? ' da' : ''}`}>{c.ttHd}</span></td>
                    <td>{tt && <span className={`hddt-thue ${tt === 'Hợp lệ' || tt === 'Đã gửi TCTN' ? 'tot' : tt === 'TCTN từ chối' ? 'loi' : 'cho'}`}>{tt}</span>}</td>
                    {oCt(c, true)}
                    <td className="c"><span className="hddt-menu">
                      <Dropdown btnClass="icon-btn sm" align="end" width={240} title={`Thao tác với hoá đơn số ${c.moi[2] || SO_NHAP}`} label={<Icon n="more" className="ic sm" />}>
                        {dong => VIEC_CAP.filter(([v]) => c.ttHd === 'Dự thảo' || v === 'gui').map(([v, ten, ic]) => {
                          const ly = lyViec(v, c)
                          return (
                            <button key={v} type="button" data-mi className="mi" disabled={Boolean(ly)} title={ly ?? undefined} onClick={() => { dong(); lam(v, c) }}>
                              <span className="mi-ic"><Icon n={ic} kieu="net" className="ic sm" /></span><span className="mi-t"><b>{ten}</b></span>
                            </button>
                          )
                        })}
                      </Dropdown>
                    </span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="hddt-ghi"><Icon n="info" className="ic sm" />Lập điều chỉnh, thay thế từ tab Hoá đơn điện tử (chọn hoá đơn hợp lệ, bấm Điều chỉnh hoặc Thay thế). Tab này để theo dõi cặp hoá đơn gốc và hoá đơn mới.</p>
      </section>
      {xem && <HopXemHd s={s} r={xem.r} hd={xem.hd} nhap={xem.nhap} toast={toast} onDong={() => setXem(null)} />}
    </div>
  )
}

// ── Tab Thông báo sai sót ──
export function ThongBaoSaiSot({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  useKho(); useBanPhieu()
  const [xem, setXem] = useState<Tbss | null>(null)
  const [chon, setChon] = useState<Set<string>>(new Set())
  // Lọc theo ngày lập thông báo; tìm số hoá đơn, người mua, nội dung sai sót (T797). TBSS mẫu lấy thông tin theo hoá đơn ở tab Hoá đơn điện tử
  const loc = useLocTab(duongDan(mod, sc), { ten: 'Trạng thái thuế', ds: ['Chưa gửi', 'CQT chấp nhận', 'CQT từ chối'] }, 'Số HĐ, người mua, nội dung')
  const dsHd = dsDongHd(gtgtTyLe(s))
  const ds = dsTbss.map(x => tbssDu(x, dsHd)).filter(x => loc.khop(x.ngayTao, `${x.so} ${x.nguoiMua} ${x.noiDung}`, x.tt))
  const rows: Row[] = ds.map(x => ({ ...x, mauKh: x.mau + x.kyHieu }))
  const chonDs = ds.filter(x => chon.has(x.id))
  const nhap = chonDs.length > 0 && chonDs.every(x => x.tt === 'Chưa gửi')
  const lyDoNut = !chonDs.length ? 'Chọn thông báo sai sót' : nhap ? undefined : 'Chỉ dùng với thông báo đang lưu nháp, chưa gửi'
  const cols: Col[] = [
    cotChon(rows, chon, setChon),
    { k: 'mauKh', t: 'Mẫu số - Ký hiệu', w: 140, cls: 'code' }, { k: 'so', t: 'Số HĐ', w: 110, cls: 'code' }, { k: 'ngay', t: 'Ngày HĐ', w: 110 },
    { k: 'loai', t: 'Loại hoá đơn', w: 170 }, { k: 'noiDung', t: 'Nội dung thông báo sai sót', w: 320 },
    { k: 'tt', t: 'Trạng thái thuế', w: 160, r: r => <span className={`hddt-thue ${r.tt === 'Chưa gửi' ? 'cho' : r.tt === 'CQT từ chối' ? 'loi' : 'tot'}`}>{r.tt}</span> },
    { k: 'ngayTao', t: 'Ngày tạo', w: 110 },
    { k: 'xem', t: '', w: 90, c: true, dinh: 'phai', r: r => <button type="button" className="ds-link-so" onClick={e => { e.stopPropagation(); setXem(ds.find(x => x.id === r.id) ?? null) }}>Xem TBSS</button> },
  ]
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card voucher-top hddt-tab">
        {loc.thanh}
        <div className="ds-hang-trang-thai">
          <span className="grow" />
          <div className="ds-toolbar-phai ds-cong-cu-h2">
            <button type="button" className="btn sm" disabled={!nhap} title={lyDoNut}
              onClick={() => { dsTbss = dsTbss.map(x => (chon.has(x.id) ? { ...x, tt: 'CQT chấp nhận' as TtTbss } : x)); bao(); toast(`Đã gửi ${chon.size} thông báo sai sót lên cơ quan thuế`); setChon(new Set()) }}>
              <Icon n="upload" className="ic sm" />Gửi CQT</button>
            <button type="button" className="btn sm" disabled={!nhap} title={lyDoNut}
              onClick={() => { dsTbss = dsTbss.filter(x => !chon.has(x.id)); bao(); toast(`Đã xoá ${chon.size} thông báo sai sót`); setChon(new Set()) }}>
              <Icon n="trash" className="ic sm" />Xoá</button>
          </div>
        </div>
        <Table cols={cols} rows={rows} motDong keDoc />
        <p className="hddt-ghi"><Icon n="info" className="ic sm" />Gửi CQT và Xoá chỉ bật với thông báo sai sót đang lưu nháp, chưa gửi.</p>
      </section>
      {xem && <HopXemTbss s={s} tb={xem} toast={toast} onDong={() => setXem(null)} />}
    </div>
  )
}

/** Nơi ký trên mẫu: tỉnh, thành phố ở cuối địa chỉ đơn vị (T796) */
const noiKy = (diaChi: string) => diaChi.split(',').pop()?.trim() || '........'

/** Dấu trạng thái duyệt của CQT đóng trên mẫu TBSS (T796) */
const DAU_TBSS: Record<Tbss['tt'], [string, string]> = { 'Chưa gửi': ['CHƯA GỬI CQT', 'nhap'], 'CQT chấp nhận': ['CQT CHẤP NHẬN', 'nhan'], 'CQT từ chối': ['THUẾ TỪ CHỐI', 'loi'] }

/** Popup xem mẫu 04/SS-HĐĐT: khung như xem hoá đơn điện tử, có In, Gửi email (T796).
 *  Bản mẫu do API nhà cung cấp HĐĐT trả về, chữ giữ nguyên theo mẫu của CQT; ở bản mẫu này dựng lại từ dữ liệu TBSS */
function HopXemTbss({ s, tb, toast, onDong }: { s: ReturnType<typeof useSession>['s']; tb: Tbss; toast: (m: string) => void; onDong: () => void }) {
  const [dangIn, setDangIn] = useState(false)
  const [moMail, setMoMail] = useState(false)
  useDongEsc(() => { if (!moMail) onDong() })
  // In: chỉ in tờ thông báo, dùng chung lớp in của xem hoá đơn (T789)
  useEffect(() => {
    if (!dangIn) return
    document.body.classList.add('in-hdx')
    const xong = () => setDangIn(false)
    window.addEventListener('afterprint', xong)
    const r1 = requestAnimationFrame(() => window.print())
    return () => { cancelAnimationFrame(r1); window.removeEventListener('afterprint', xong); document.body.classList.remove('in-hdx') }
  }, [dangIn])
  const dv = DON_VI.find(d => d.id === s.donVi) ?? DON_VI[0]
  const [dau, lopDau] = DAU_TBSS[tb.tt]
  const daKy = tb.tt !== 'Chưa gửi'
  return (
    <Vo lop="hdx hdx-xem-ban tbss-hop" tieuDe={<>Thông báo sai sót hoá đơn <span className="code">{tb.mau}{tb.kyHieu}</span> số <span className="code hdx-do">{tb.so}</span>
      <span className={`ph-tt${tb.tt === 'CQT chấp nhận' ? ' da' : ''}`}>{tb.tt}</span></>} onDong={onDong} chan={<>
      <button type="button" className="xp-btn-outline" onClick={() => setMoMail(true)}><Icon n="mail" className="ic sm" />Gửi email</button>
      <span className="grow" />
      <button type="button" className="xp-btn-outline" onClick={onDong}>Đóng</button>
      <button type="button" className="xp-btn-sua" onClick={() => setDangIn(true)}><Icon n="printer" className="ic sm" />In thông báo</button>
    </>}>
      <div className="hdx-nen-giay tbss-nen">
        <div className="hdx-giay tbss-giay">
          <div className="tbss-mau">Mẫu số: 04/SS-HĐĐT</div>
          <div className="tbss-qh"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><b>Độc lập - Tự do - Hạnh phúc</b><span>---------------</span></div>
          <h3 className="tbss-tieu">THÔNG BÁO HOÁ ĐƠN ĐIỆN TỬ ĐÃ LẬP SAI</h3>
          <div className="tbss-kg">Kính gửi: Cục Thuế</div>
          <div className="hdx-mua tbss-nnt">
            <div><span>Tên người nộp thuế:</span><b>{dv.ten}</b></div>
            <div><span>Mã số thuế:</span><b className="code">{dv.mst}</b></div>
          </div>
          <p className="tbss-dan">Người nộp thuế thông báo về việc hoá đơn điện tử đã lập sai như sau:</p>
          <div className="tbss-bang-o">
            <table className="hdx-bh">
              <colgroup>{[40, 140, 70, 90, 100, 100, 190, 90].map((w, i) => <col key={i} style={{ width: w }} />)}<col /></colgroup>
              <thead>
                <tr><th>STT</th><th>Mã CQT cấp</th><th>Ký hiệu mẫu hoá đơn</th><th>Ký hiệu hoá đơn</th><th>Số hoá đơn điện tử</th><th>Ngày lập hoá đơn</th>
                  <th>Loại hoá đơn điện tử</th><th>Thông báo/ Giải trình</th><th>Lý do/ Thông báo của CQT</th></tr>
                <tr className="cs">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <td key={n}>({n})</td>)}</tr>
              </thead>
              <tbody><tr>
                <td className="g">1</td><td className="code tbss-ma">{tb.maCqt}</td><td className="g">{tb.mau}</td><td className="g code">{tb.kyHieu}</td>
                <td className="g code">{tb.so}</td><td className="g">{tb.ngay}</td>
                <td>Hoá đơn điện tử theo Nghị định 123/2020/NĐ-CP, Nghị định 70/2025/NĐ-CP</td><td className="g">Thông báo</td><td>{tb.noiDung}</td>
              </tr></tbody>
            </table>
            <span className={`tbss-dau ${lopDau}`}>{dau}</span>
          </div>
          <div className="tbss-ghi">
            <div>Ghi chú:</div>
            <div>(2): Mã CQT cấp đối với hoá đơn có mã của CQT, hoá đơn không có mã của CQT để trống.</div>
            <div>(8): Trường hợp hoá đơn điện tử đã lập sai và người bán thực hiện Thông báo/ Trường hợp CQT thông báo thì người nộp thuế giải trình.</div>
          </div>
          <div className="tbss-ngay">{noiKy(dv.diaChi)}, ngày {tb.ngayTao.slice(0, 2)} tháng {tb.ngayTao.slice(3, 5)} năm {tb.ngayTao.slice(6)}</div>
          <div className="tbss-ky">
            <div><b>NGƯỜI MUA</b><i>(Chữ ký số của người mua nếu có)</i></div>
            <div>
              <b>NGƯỜI NỘP THUẾ hoặc</b><b>ĐẠI DIỆN HỢP PHÁP CỦA NGƯỜI NỘP THUẾ</b><i>(Chữ ký số, chữ ký điện tử của người nộp thuế)</i>
              {daKy
                ? <div className="hdx-dau"><Icon n="check" className="ic sm" /><span>Signature Valid<br />Ký bởi: {dv.ten.toUpperCase()}<br />Ký ngày: {tb.ngayTao}</span></div>
                : <div className="tbss-chua-ky">Chưa ký, chưa gửi CQT</div>}
            </div>
          </div>
        </div>
      </div>
      {moMail && <HopMailTbss tb={tb} toast={toast} onDong={() => setMoMail(false)} />}
    </Vo>
  )
}

/** Gửi mẫu TBSS qua email: mặc định email người mua trên hoá đơn sai sót (T796) */
function HopMailTbss({ tb, toast, onDong }: { tb: Tbss; toast: (m: string) => void; onDong: () => void }) {
  useDongEsc(onDong)
  const [email, setEmail] = useState(tb.email)
  const [thu, setThu] = useState(false)
  const sai = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  return (
    <Vo hep tieuDe="Gửi thông báo sai sót qua email" onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" onClick={() => {
        if (sai) { setThu(true); return }
        dsTbss = dsTbss.map(x => (x.id === tb.id ? { ...x, email: email.trim() } : x)); bao()
        toast(`Đã gửi mẫu TBSS hoá đơn số ${tb.so} tới ${email.trim()}`); onDong()
      }}><Icon n="mail" className="ic sm" />Gửi</button>
    </>}>
      <div className="hddt-bang hddt-tbss">
        <div className="hddt-o"><span>Hoá đơn</span><div><b className="hddt-gt code">{tb.mau}{tb.kyHieu} · {tb.so} · {tb.ngay}</b></div></div>
        <div className="hddt-o"><span>Người mua</span><div><b className="hddt-gt">{tb.nguoiMua}</b></div></div>
        <label className={`hddt-o${thu && sai ? ' loi' : ''}`}><span>Email nhận<em>*</em></span>
          <div><input className="hddt-inp" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="Vd: ketoan@congty.vn" /></div></label>
      </div>
      {thu && sai && <p className="tbss-loi">Nhập email đúng dạng, vd ketoan@congty.vn</p>}
    </Vo>
  )
}
