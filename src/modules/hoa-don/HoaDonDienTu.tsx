// Menu Hoá đơn điện tử (QD106, T786): danh sách hoá đơn đã lập từ chứng từ bán hàng, cặp hoá đơn điều chỉnh thay thế, thông báo sai sót.
// Hoá đơn lấy từ chứng từ bán hàng lập tay đã phát hành (T785), hoá đơn thay thế, điều chỉnh kể cả dự thảo (T787)
import { useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { gtgtTyLe, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Dropdown, Select } from '../../ui/Dropdown'
import { Table } from '../../ui/Table'
import { dmy, fold, money } from '../../ui/format'
import { HOM_NAY } from '../../data/mock'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, cotChon, useCauHinhLoc, useCotDs, useDongEsc, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
import { apKhoPhieu, useBanPhieu } from '../../ui/generic/daXoa'
import { hangTay, mauTay } from '../ban-hang/ChungTuBanHang'
import {
  HopXemHd, KHACH_TRONG, TEN_LOAI_CT, Vo, hdCua, hdGocCua, laHdMoiCua, laMayTinhTien, loaiCtCua, lyDoKhongLap, phatHanhNhap, thayTheNhap, ttHdGoc, xoaCtHd,
  type HdDaXuat, type TtKhach,
} from '../ban-hang/hddt'

/** Màn chứng từ bán hàng lập tay: gói Plus ở tab Bán hàng của Xuất bán POS, gói Pro ở 3.1.7 */
const MAN_PL = 'ban-hang/3-1-1', MAN_PR = 'ban-hang/3-1-7'

// ── Kho trong phiên: hoá đơn đã gửi CQT, thông báo sai sót ──
interface Tbss { id: string; mau: string; kyHieu: string; so: string; ngay: string; loai: string; noiDung: string; tt: 'Lưu nháp' | 'Đã gửi CQT' | 'CQT đã tiếp nhận'; ngayTao: string }
const daGui = new Set<string>()
let dsTbss: Tbss[] = [
  { id: 'tb-1', mau: '1', kyHieu: 'C26TAA', so: '00000118', ngay: '25/09/2026', loai: 'Hoá đơn gốc', noiDung: 'Sai địa chỉ người mua', tt: 'Lưu nháp', ngayTao: '06/10/2026' },
  { id: 'tb-2', mau: '1', kyHieu: 'C26MAC', so: '00000038', ngay: '30/09/2026', loai: 'Hoá đơn bị thay thế', noiDung: 'Sai mã số thuế người mua, đã lập hoá đơn thay thế', tt: 'CQT đã tiếp nhận', ngayTao: '04/10/2026' },
]
let ban = 0
const nghe = new Set<() => void>()
const bao = () => { ban++; nghe.forEach(f => f()) }
const useKho = () => useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => ban)
const homNay = () => dmy(HOM_NAY)

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
    id, loai: loaiCt === 'XBAN' ? 'Hoá đơn gốc' : TEN_LOAI_CT[loaiCt], ttHd: nhap ? 'Dự thảo' : ttGoc ?? 'Đã phát hành',
    mau: mauKh[0] ?? '', kyHieu: mauKh.slice(1), mauKh, soHd: hd?.so ?? '', ngay: hd?.ngay ?? String(r._ngayHd ?? ''), so: r.so,
    tenDv: cty ? k.tenDv : '', mst: cty ? k.mst : '', diaChi: k.diaChi, nguoiMua: k.tenNm || hd?.nguoiMua || '', maQhns: cty ? k.maQhns : '',
    ttThue: nhap ? '' : !mtt ? 'Hợp lệ' : gui ? 'Đã gửi TCTN' : 'Chưa gửi TCTN',
    truoc: tien.truoc ?? 0, thue: tien.thue ?? 0, tong: tien.tong ?? 0, maCqt: !hd || (mtt && !gui) ? '' : hd.ma, traCuu: hd?.traCuu ?? '',
    goc: goc ? `${goc.hd.mau}${goc.hd.kyHieu} số ${goc.hd.so}` : '',
    _r: r, _man: man, _hd: hd,
    // Lý do không lập được thay thế, điều chỉnh: hoá đơn đã bị thay thế, đang có thay thế dự thảo (T787)
    _lyTt: man === MAN_PL ? lyDoKhongLap(man, r, 'tt') : 'Chỉ lập ở chứng từ bán hàng gói Plus', _lyDc: man === MAN_PL ? lyDoKhongLap(man, r, 'dc') : 'Chỉ lập ở chứng từ bán hàng gói Plus',
    _nhapTt: !nhap && man === MAN_PL ? thayTheNhap(man, r)?.so ?? '' : '',
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
      return v === 'tt' ? (r._lyTt as string | null) : v === 'dc' ? (r._lyDc as string | null) : r.ttHd === 'Bị thay thế' ? 'Hoá đơn đã bị thay thế, chỉ xem' : null
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
  const rows = [
    ...apKhoPhieu(MAN_PL, mauTay()).map(r => hangTay(r, tyLe)).map(r => dongHd(r, MAN_PL)),
    ...apKhoPhieu(MAN_PR, []).map(r => dongHd(r, MAN_PR)),
  ].filter((r): r is Row => r !== null)
    .sort((a, b) => docNgay(String(b.ngay)).getTime() - docNgay(String(a.ngay)).getTime() || String(b.soHd).localeCompare(String(a.soHd)))

  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [chip, setChip] = useState('all')
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [xem, setXem] = useState<Row | null>(null)
  const [tbss, setTbss] = useState<Row | null>(null)

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
  // Bị thay thế, Bị điều chỉnh vẫn là hoá đơn đã phát hành (T787)
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
    const BAO: Record<string, string> = { ph: 'Đã phát hành hoá đơn', xml: 'Đã tải XML hoá đơn', pdf: 'Đã tải PDF hoá đơn', mail: 'Đã gửi email hoá đơn cho người mua,', share: 'Đã chép đường dẫn PDF hoá đơn', xoa: 'Đã xoá hoá đơn dự thảo' }
    toast(`${BAO[v]} ${tenSo(r)}`)
  }
  const chonDs = list.filter(r => chon.has(String(r.id)))
  const lamNhieu = (v: 'gui' | 'xml' | 'pdf') => {
    const duoc = chonDs.filter(r => !lyDo(v, r))
    const bo = chonDs.length - duoc.length
    if (v === 'gui') { duoc.forEach(r => daGui.add(String(r.id))); bao() }
    const ten = { gui: 'Đã gửi CQT', xml: 'Đã tải XML', pdf: 'Đã tải PDF' }[v]
    toast(duoc.length ? `${ten} ${duoc.length} hoá đơn${bo ? `, bỏ qua ${bo} hoá đơn không đủ điều kiện` : ''}` : 'Không hoá đơn nào đã chọn đủ điều kiện')
    if (v === 'gui') setChon(new Set())
  }

  const chu = (k: string, t: string, w: number, cls?: string): Col => ({ k, t, w, ...(cls ? { cls } : {}) })
  const cols: Col[] = [
    cotChon(list, chon, setChon),
    { k: 'loai', t: 'Loại hoá đơn', w: 150, dinh: 'trai' },
    { k: 'ttHd', t: 'Trạng thái HĐĐT', w: 140, r: r => <span className={`ph-tt${r.ttHd === 'Đã phát hành' ? ' da' : ''}`}
      title={r._nhapTt ? `Đang có hoá đơn thay thế dự thảo ${r._nhapTt}` : undefined}>{r.ttHd}{r._nhapTt ? ', có thay thế dự thảo' : ''}</span> },
    // Mẫu số ghép với ký hiệu như màn xuất (vd 1C26TAA): ký tự đầu là mẫu số, 6 ký tự sau là ký hiệu
    chu('mauKh', 'Mẫu số - Ký hiệu', 140, 'code'),
    { k: 'soHd', t: 'Số HĐ', w: 110, r: r => r.soHd ? <button type="button" className="ds-link-so" title="Xem hoá đơn" onClick={e => { e.stopPropagation(); setXem(r) }}>{r.soHd}</button> : null },
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
      {tbss && <HopTbss r={tbss} onDong={() => setTbss(null)} onLuu={noiDung => {
        dsTbss = [{ id: `tb-${Date.now()}`, mau: String(tbss.mau), kyHieu: String(tbss.kyHieu), so: String(tbss.soHd), ngay: String(tbss.ngay), loai: String(tbss.loai), noiDung, tt: 'Lưu nháp', ngayTao: homNay() }, ...dsTbss]
        bao(); setTbss(null); toast('Đã lưu nháp thông báo sai sót, xem ở tab Thông báo sai sót')
      }} />}
    </div>
  )
}

/** Popup lập thông báo sai sót (mẫu 04/SS-HĐĐT) cho một hoá đơn */
function HopTbss({ r, onDong, onLuu }: { r: Row; onDong: () => void; onLuu: (noiDung: string) => void }) {
  useDongEsc(onDong)
  const [nd, setNd] = useState('')
  const [thu, setThu] = useState(false)
  return (
    <Vo hep tieuDe="Thông báo hoá đơn có sai sót" onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" onClick={() => { if (!nd.trim()) { setThu(true); return } onLuu(nd.trim()) }}>Lưu nháp</button>
    </>}>
      <div className="hddt-xem">
        <span>Hoá đơn</span><b className="code">{String(r.mau)}{String(r.kyHieu)} · {String(r.soHd)} · {String(r.ngay)}</b>
        <span>Người mua</span><b>{String(r.tenDv || r.nguoiMua)}</b>
      </div>
      <label className={`hddt-o${thu && !nd.trim() ? ' loi' : ''}`}><span>Nội dung sai sót<em>*</em></span>
        <div><textarea className="inp" rows={3} value={nd} onChange={e => setNd(e.target.value)} placeholder="Vd: sai địa chỉ người mua" /></div></label>
    </Vo>
  )
}

// ── Tab Điều chỉnh thay thế: mỗi dòng một cặp hoá đơn gốc và hoá đơn mới: cặp lập thật (T787) rồi dữ liệu mẫu ──
/** Cặp hoá đơn; cặp lập thật (T787) có thêm chứng từ gốc, chứng từ mới để mở */
interface CapHd {
  id: string; loai: 'Điều chỉnh' | 'Thay thế'; goc: [string, string, string, string, number]; moi: [string, string, string, string, number]; tt: string; nguoiMua: string
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
      tt: !hd ? 'Dự thảo' : !laMayTinhTien(mauKh) ? 'Hợp lệ' : daGui.has(id) ? 'Đã gửi TCTN' : 'Chưa gửi TCTN',
      ctGoc: [g.id, g.so], ctMoi: [String(r.id), String(r.so)], rGoc, rMoi: r,
    }
  })
}
const CAP_MAU: CapHd[] = [
  { id: 'c1', loai: 'Điều chỉnh', goc: ['1', 'C26TAA', '00000121', '28/09/2026', 2_916_000], moi: ['1', 'C26TAA', '00000129', '03/10/2026', -216_000], tt: 'Hợp lệ', nguoiMua: 'Công ty CP Du lịch Biển Xanh' },
  { id: 'c2', loai: 'Thay thế', goc: ['1', 'C26MAC', '00000038', '30/09/2026', 972_000], moi: ['1', 'C26MAC', '00000044', '04/10/2026', 972_000], tt: 'TCTN từ chối', nguoiMua: 'Văn phòng đại diện Hạ Long Tech' },
]
const guiCap = new Set<string>()

export function DieuChinhThayThe({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  useKho(); useBanPhieu()
  const [loai, setLoai] = useState('')
  const [xem, setXem] = useState<{ r: Row; hd: HdDaXuat } | null>(null)
  const ds = [...capThat(gtgtTyLe(s)), ...CAP_MAU].filter(c => !loai || c.loai === loai)
  const ttCua = (c: CapHd) => (guiCap.has(c.id) || daGui.has(c.id) ? 'Đã gửi TCTN' : c.tt)
  const moXem = (c: CapHd, h: CapHd['goc'], ma: number, moi: boolean) => {
    const hdThat = c.rMoi && (moi ? hdCua(c.rMoi) : hdGocCua(c.rMoi)?.hd)
    if (hdThat) { setXem({ r: (moi ? c.rMoi : c.rGoc) ?? c.rMoi!, hd: hdThat }); return }
    const tong = h[4], thue = Math.round(tong / 13.5)
    setXem({ r: { id: c.id, doiTuong: c.nguoiMua }, hd: { mau: h[0], kyHieu: h[1], so: h[2], ngay: h[3], ma: `M26-${(0x3b0000 + ma).toString(16).toUpperCase()}`, nguoiMua: c.nguoiMua, truoc: tong - thue, thue, tong } })
  }
  // Cặp lập thật: bấm số chứng từ mở chứng từ gốc, chứng từ mới; hoá đơn dự thảo chưa có số thì không xem hoá đơn (T787)
  const oXem = (c: CapHd, moi: boolean, ma: number) => {
    const h = moi ? c.moi : c.goc, ct = moi ? c.ctMoi : c.ctGoc
    return (
      <td className="c hddt-cap-nut">
        {h[2] && <button type="button" className="ds-link-so" onClick={() => moXem(c, h, ma, moi)}>Xem</button>}
        {ct && <button type="button" className="ds-link-so" title="Mở chứng từ" onClick={() => nav(`/app/${MAN_PL}/${ct[0]}`)}>{ct[1]}</button>}
      </td>
    )
  }
  const oHd = (c: CapHd, h: CapHd['goc'], ma: number) => <>
    <td className="code">{h[0]}{h[1]}</td><td className="code">{h[2]}</td><td>{h[3]}</td><td className="num">{money(h[4])}</td>
    {oXem(c, false, ma)}
  </>
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card voucher-top hddt-tab">
        <div className="ds-hang-trang-thai">
          <label className="hddt-loc">Loại
            <Select className="ds-o-sel" value={loai} aria-label="Loại" onChange={e => setLoai(e.target.value)}>
              <option value="">Tất cả</option><option value="Điều chỉnh">Điều chỉnh</option><option value="Thay thế">Thay thế</option>
            </Select>
          </label>
        </div>
        <div className="hddt-bang">
          <table className="tbl ke-doc mot-dong">
            <thead>
              <tr><th rowSpan={2}>Loại</th><th colSpan={5}>Hoá đơn bị điều chỉnh, thay thế</th><th colSpan={6}>Hoá đơn điều chỉnh, thay thế</th><th rowSpan={2} className="c">Thao tác</th></tr>
              <tr>{['Mẫu số - Ký hiệu', 'Số HĐ', 'Ngày HĐ', 'Tổng tiền', ''].map((t, i) => <th key={`g${i}`}>{t}</th>)}
                {['Mẫu số - Ký hiệu', 'Số HĐ', 'Ngày HĐ', 'Tổng tiền', 'Trạng thái thuế', ''].map((t, i) => <th key={`m${i}`}>{t}</th>)}</tr>
            </thead>
            <tbody>
              {ds.map((c, i) => {
                const tt = ttCua(c)
                const ly = tt === 'Dự thảo' ? 'Phát hành hoá đơn trước khi gửi CQT' : !laMayTinhTien(c.moi[1]) ? 'Chỉ hoá đơn máy tính tiền (ký hiệu có chữ M ở vị trí thứ 4) mới gửi CQT' : tt === 'Đã gửi TCTN' ? 'Hoá đơn đã gửi CQT' : null
                return (
                  <tr key={c.id}>
                    <td>{c.loai}</td>
                    {oHd(c, c.goc, i * 2)}
                    <td className="code">{c.moi[0]}{c.moi[1]}</td><td className="code">{c.moi[2]}</td><td>{c.moi[3]}</td><td className="num">{money(c.moi[4])}</td>
                    <td><span className={`hddt-thue ${tt === 'TCTN từ chối' ? 'loi' : tt === 'Dự thảo' || tt === 'Chưa gửi TCTN' ? 'cho' : 'tot'}`}>{tt}</span></td>
                    {oXem(c, true, i * 2 + 1)}
                    <td className="c"><button type="button" className="btn sm" disabled={Boolean(ly)} title={ly ?? undefined}
                      onClick={() => { guiCap.add(c.id); bao(); toast(`Đã gửi hoá đơn số ${c.moi[2]} lên cơ quan thuế`) }}>Gửi CQT</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="hddt-ghi"><Icon n="info" className="ic sm" />Lập điều chỉnh, thay thế từ tab Hoá đơn điện tử (chọn hoá đơn hợp lệ, bấm Điều chỉnh hoặc Thay thế). Tab này để theo dõi cặp hoá đơn gốc và hoá đơn mới.</p>
      </section>
      {xem && <HopXemHd s={s} r={xem.r} hd={xem.hd} toast={toast} onDong={() => setXem(null)} />}
    </div>
  )
}

// ── Tab Thông báo sai sót ──
export function ThongBaoSaiSot({ sc }: ScreenProps) {
  const { toast } = useSession()
  useKho()
  const [tt, setTt] = useState('')
  const [chon, setChon] = useState<Set<string>>(new Set())
  const ds = dsTbss.filter(x => !tt || x.tt === tt)
  const rows: Row[] = ds.map(x => ({ ...x, mauKh: x.mau + x.kyHieu }))
  const chonDs = ds.filter(x => chon.has(x.id))
  const nhap = chonDs.length > 0 && chonDs.every(x => x.tt === 'Lưu nháp')
  const lyDoNut = !chonDs.length ? 'Chọn thông báo sai sót' : nhap ? undefined : 'Chỉ dùng với thông báo đang lưu nháp, chưa gửi'
  const cols: Col[] = [
    cotChon(rows, chon, setChon),
    { k: 'mauKh', t: 'Mẫu số - Ký hiệu', w: 140, cls: 'code' }, { k: 'so', t: 'Số HĐ', w: 110, cls: 'code' }, { k: 'ngay', t: 'Ngày HĐ', w: 110 },
    { k: 'loai', t: 'Loại hoá đơn', w: 170 }, { k: 'noiDung', t: 'Nội dung thông báo sai sót', w: 320 },
    { k: 'tt', t: 'Trạng thái gửi CQT', w: 160, r: r => <span className={`hddt-thue ${r.tt === 'Lưu nháp' ? 'cho' : 'tot'}`}>{r.tt}</span> },
    { k: 'ngayTao', t: 'Ngày tạo', w: 110 },
    { k: 'xem', t: '', w: 90, c: true, dinh: 'phai', r: r => <button type="button" className="ds-link-so" onClick={e => { e.stopPropagation(); toast(`Xem thông báo sai sót hoá đơn số ${r.so}`) }}>Xem TBSS</button> },
  ]
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card voucher-top hddt-tab">
        <div className="ds-hang-trang-thai">
          <label className="hddt-loc">Trạng thái gửi CQT
            <Select className="ds-o-sel" value={tt} aria-label="Trạng thái gửi CQT" onChange={e => { setTt(e.target.value); setChon(new Set()) }}>
              <option value="">Tất cả</option><option value="Lưu nháp">Lưu nháp</option><option value="Đã gửi CQT">Đã gửi CQT</option><option value="CQT đã tiếp nhận">CQT đã tiếp nhận</option>
            </Select>
          </label>
          <div className="ds-toolbar-phai ds-cong-cu-h2">
            <button type="button" className="btn sm" disabled={!nhap} title={lyDoNut}
              onClick={() => { dsTbss = dsTbss.map(x => (chon.has(x.id) ? { ...x, tt: 'Đã gửi CQT' } : x)); bao(); toast(`Đã gửi ${chon.size} thông báo sai sót lên cơ quan thuế`); setChon(new Set()) }}>
              <Icon n="upload" className="ic sm" />Gửi CQT</button>
            <button type="button" className="btn sm" disabled={!nhap} title={lyDoNut}
              onClick={() => { dsTbss = dsTbss.filter(x => !chon.has(x.id)); bao(); toast(`Đã xoá ${chon.size} thông báo sai sót`); setChon(new Set()) }}>
              <Icon n="trash" className="ic sm" />Xoá</button>
          </div>
        </div>
        <Table cols={cols} rows={rows} motDong keDoc />
        <p className="hddt-ghi"><Icon n="info" className="ic sm" />Gửi CQT và Xoá chỉ bật với thông báo sai sót đang lưu nháp, chưa gửi.</p>
      </section>
    </div>
  )
}
