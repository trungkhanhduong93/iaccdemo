// Màn chứng từ chung: danh sách theo bố cục AMIS với cột đứng yên, bộ lọc kỳ nhanh, khung chi tiết bên dưới, thao tác hàng loạt.
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { Select } from '../Dropdown'
import { St, Table } from '../Table'
import { PhanTrang } from '../PhanTrang'
import { buildGroupedData } from '../virtual'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../CongCuDs'
import { fold, money } from '../format'
import { dangLoc, khopLoc, type GiaTriLoc, type KieuLoc } from '../LocCot'
import {
  BoLoc, ChipTrangThai, NutHangLoat, NutTuyChinhCot, cotChon, dsChipTT, khopChipTT, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef,
} from '../LocNangCao'
import { ctTtCon, dsDcCon, dsTtCon, soDaTra, ttTienTheoTra, useDaXoa, xoaPhieu } from './daXoa'
import { MAN_DC } from '../../modules/kho/dieu-chinh'

/** Phiếu tham chiếu của chứng từ (T127): phiếu thu, chi sinh từ phiếu mua, bán (trả ngay, thanh toán sau); phiếu điều chỉnh sinh từ kiểm kê;
 *  phiếu gốc của phiếu được sinh ra. Có đường dẫn thì bấm mở được */
function thamChieuCua(r: Row): { so: string; to?: string }[] {
  const ct = ctTtCon(r)
  return [
    ...(ct ? [{ so: ct.so, to: `/app/tien/2-1-1/${ct.id}` }] : []),
    ...dsTtCon(r).map(c => ({ so: c.so, to: `/app/tien/2-1-1/${c.id}` })),
    ...dsDcCon(r).map(c => ({ so: c.so, to: `/app/${MAN_DC}/${c.id}` })),
    ...(r._thamChieu ? [{ so: String(r._thamChieu), to: r._thamChieuDi ? String(r._thamChieuDi) : undefined }] : []),
  ]
}
import { CHI_NHANH, HANG, NVL } from '../../data/mock'
import { NGUON, TT_CT, chungTu, dongCua, gioPhieu, ttNghiepVu, type Dong } from './gen'
import { boO, nhomCua, theoLoai, TT_HD, TT_TIEN } from './nhom'
import { BangKiemKe } from './BangKiemKe'
import { BangSua } from './BangSua'
import { ChungTuForm, HachToan, LichSu, VoucherDetail, lyMacDinh } from './ChungTuForm'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'

const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['tenLoai', 'nguon', 'ttTien', 'ttHd', 'kho', 'lyDo'])

// Re-export để các màn khác (như ban-hang/ChungTuBanHang.tsx) tiếp tục sử dụng
export { ChungTuForm, VoucherDetail, HachToan, LichSu }

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
interface GtLoc { thoiGian: KhoangNgay; tim: string; doiTuong: string; nguon: string; loai: string; ttTien: string; ttHd: string; kho: string; hang: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangNay(), tim: '', doiTuong: '', nguon: '', loai: '', ttTien: '', ttHd: '', kho: '', hang: '' })

const MAC_DINH: VoucherCfg ={ prefix: 'CT', doiTuong: 'none', dienGiai: ['Chứng từ'], tien: [1_000_000, 20_000_000] }

export function VoucherScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher ?? { ...MAC_DINH, dienGiai: [tenMan(sc)] }
  const tatCa = useMemo(() => (cfg.rowsMau ? cfg.rowsMau() : cfg.loai ? gopLoai(cfg, sc.code ?? sc.slug) : chungTu(cfg, sc.code ?? sc.slug)), [sc])   // rowsMau: phiếu mẫu riêng (T126)
  const { ban, laDaXoa, phieuMoi, apSua } = useDaXoa(`${mod.key}/${sc.slug}`)
  const rows = useMemo(() => [...phieuMoi, ...tatCa].filter(r => !laDaXoa(r.id)).map(apSua), [tatCa, ban])

  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }

  return <VoucherList sc={sc} mod={mod} cfg={cfg} rows={rows} />
}

/** Màn nhiều loại phiếu: mỗi loại lấy 9 phiếu gần nhất rồi xếp chung theo ngày */
function gopLoai(cfg: VoucherCfg, seed: string): Row[] {
  const ngay = (r: Row) => String(r.ngay).split(' ')[0].split('/').reverse().join('')
  return cfg.loai!.flatMap(v => chungTu(theoLoai(cfg, v.k), `${seed}-${v.k}`).slice(0, 9)
    .map((r): Row => ({ ...r, id: `${v.k}-${r.id}`, loai: v.k, tenLoai: v.ten })))
    .sort((a, b) => ngay(b).localeCompare(ngay(a)) || String(b.so).localeCompare(String(a.so)))
    .map((r, i) => ({ ...r, tt: i < 3 ? 'nhap' : i === 5 ? 'loi' : 'ghi' }))
}

export function VoucherList({ sc, mod, cfg, rows: rowsGoc, extra, title }: ScreenProps & { cfg: VoucherCfg; rows: Row[]; extra?: React.ReactNode; title?: string }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc0 = useLocNhap(locMacDinh)
  const [chipTT, setChipTT] = useState('all')
  // Điều chỉnh kho (T126): hai tab nhỏ Xuất điều chỉnh, Nhập điều chỉnh, mỗi tab một loại phiếu
  const [tabLoai, setTabLoai] = useState(cfg.loai?.[0]?.k ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const [activeId, setActiveId] = useState<string>(rowsGoc[0]?.id ?? '')
  const [panelMo, setPanelMo] = useState(false)
  const [tabChon, setTabPanel] = useState<'ct' | 'ht' | 'khac'>('ct')

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  // Chế độ không ghi sổ (gói Free) thì khung chi tiết bỏ tab Ghi sổ, như form (T62, T82)
  const coTabHt = kieuGhiSo(s.cheDo) !== 'khong' && !cfg.kiemKe   // phiếu kiểm kê không có tab Hạch toán (T124)
  const tabPanel = tabChon === 'ht' && !coTabHt ? 'ct' : tabChon
  const cnChon = chiNhanhHienTai(s)
  const nhom = nhomCua(mod.key, cfg)
  const bo = boO(nhom, cfg)
  const path = duongDan(mod, sc)
  // Mua, bán (T92): thêm thông tin hoá đơn, hạn thanh toán, đã trả, còn nợ cho các cột mặc định ẩn.
  // T94: kho, mã hàng trên dòng để lọc; gói dưới Pro một kho ở đầu phiếu (cột Kho), gói Pro kho trên từng dòng
  const coKhoDs = bo.kho === 'dong'
  const khoDong = s.goi === 'PR'
  // Thu chi (T96): lý do thu, chi của phiếu; phiếu chưa lưu lý do thì đoán theo diễn giải như form, chuyển quỹ không có
  // Phiếu kiểm kê (T124): kho kiểm kê và số mặt hàng của phiếu
  const rows0 = useMemo(() => cfg.dieuChinh ? rowsGoc.map((r): Row => ({ ...r, kho: String(r._kho ?? '') })) : cfg.kiemKe ? rowsGoc.map((r): Row => ({
    ...r, kho: String(r._kho ?? ''), soMat: ((r._dong as Dong[] | undefined) ?? dongCua(cfg, `${sc.code ?? sc.slug}-${r.id}`)).length,
  })) : mod.key === 'tien' ? rowsGoc.map((r): Row => {
    const loaiK = cfg.loai?.find(x => x.k === r.loai)?.k ?? cfg.loai?.[0]?.k
    const cfgDong = theoLoai(cfg, loaiK)
    const oLy = boO(nhomCua(mod.key, cfgDong, loaiK), cfgDong).a.find(o => o.k === 'ly')
    return { ...r, lyDo: !oLy ? '' : r._lyDo ? String(r._lyDo) : lyMacDinh(oLy.ds ?? [], String(r.dienGiai ?? '')) }
  }) : nhom !== 'mua' && nhom !== 'ban' ? rowsGoc : rowsGoc.map((r): Row => {
    const dsDong = (r._dong as Dong[] | undefined) ?? dongCua(theoLoai(cfg, r.loai), `${sc.code ?? sc.slug}-${r.id}`)
    const dsKhoCn = CHI_NHANH.find(c => c.ten === r.cn)?.kho ?? []
    const khoDau = String(r._kho ?? dsKhoCn[0] ?? '')
    const khoMd = dsKhoCn.length === 1 ? dsKhoCn[0] : 'Kho tổng'
    const _khoDs = !coKhoDs ? [] : khoDong ? [...new Set(dsDong.map(d => d.kho || khoMd))] : [khoDau]
    const nv = ttNghiepVu(r)
    const coHd = r._nhanKemHd !== undefined ? Boolean(r._nhanKemHd) : nv.ttHd === 'da'
    const daTra = soDaTra(r)
    return {
      ...r,
      kyHieuHd: coHd ? String(r._kyHieuHd ?? nv.kyHieuHd) : '', soHd: coHd ? String(r._soHd ?? nv.soHd) : '', ngayHd: coHd ? String(r._ngayHd ?? nv.ngayHd) : '',
      hanTt: String(r._hanTt ?? nv.hanTt), daTra, conNo: Math.max(0, (Number(r.tong) || 0) - daTra),
      kho: coKhoDs && !khoDong ? khoDau : '', _khoDs, _maHang: dsDong.map(d => d.ma).filter(Boolean),
    }
  }), [rowsGoc, nhom, cfg, sc, coKhoDs, khoDong, mod.key])
  // Cột Tham chiếu (T127): chữ để lọc, tìm theo cột
  const rows = useMemo(() => rows0.map((r): Row => ({ ...r, thamChieu: thamChieuCua(r).map(x => x.so).join(', ') })), [rows0])

  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)

  // Lọc từng cột trên hàng lọc dưới tiêu đề bảng: phễu điều kiện theo kiểu cột, so theo chữ hiện trong ô
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tong' || k === 'thue' || k === 'daTra' || k === 'conNo' ? 'so' : 'chu'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'nguon') return (NGUON[r.nguon] ?? NGUON.tay)[1]
    if (k === 'tt') return ghi ? (TT_CT[r.tt]?.[1] ?? 'Chưa ghi') : 'Đã ghi sổ'
    if ((k === 'ttTien' || k === 'ttHd') && (nhom === 'mua' || nhom === 'ban')) {
      const nv = ttNghiepVu(r)
      return (k === 'ttTien' ? TT_TIEN : TT_HD)[nhom][k === 'ttTien' ? ttTienTheoTra(r) : nv.ttHd]?.[1] ?? ''
    }
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }

  // Giá trị để chọn cho các cột kiểu chọn, lấy từ chính các phiếu của màn
  const luaChon = useMemo(() => Object.fromEntries([...COT_CHON].map(k => [k, [...new Set(rows.map(r => chuCot(k, r)).filter(Boolean))]])), [rows, ghi])

  // Ô lọc ngoài và trong Bộ lọc nâng cao: giá trị nháp, bấm Lọc mới áp dụng (T41)
  const { nhap, dat } = loc0
  const muaBan = nhom === 'mua' || nhom === 'ban'
  const dsDoiTuong = useMemo(() => [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].sort(), [rows])
  const dsNguon = useMemo(() => [...new Set(rows.map(r => String(r.nguon ?? 'tay')))], [rows])
  // Lọc kho, hàng hoá cho mua, bán (T94): lựa chọn lấy từ chính các phiếu của màn
  const dsKhoLoc = useMemo(() => [...new Set(rows.flatMap(r => (r._khoDs as string[] | undefined) ?? []))].sort(), [rows])
  const dsHangLoc = useMemo(() => {
    const ten = new Map([...HANG, ...NVL].map(h => [h.ma, h.ten]))
    return [...new Set(rows.flatMap(r => (r._maHang as string[] | undefined) ?? []))].sort().map((m): [string, string] => [m, `${m} - ${ten.get(m) ?? m}`])
  }, [rows])
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const chonO = (k: keyof GtLoc, ten: string, ds: [string, string][]) => (
    <Select className="ds-o-sel" value={nhap[k] as string} aria-label={ten} onChange={e => dat(k, e.target.value)}>
      <option value="">Tất cả</option>
      {ds.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </Select>
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay align="end" value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    {
      k: 'tim', ten: 'Tìm kiếm', o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, tên, diễn giải" title="Tìm theo số chứng từ, đối tượng, diễn giải" aria-label="Tìm kiếm"
        onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(cfg.doiTuong !== 'none' && dsDoiTuong.length ? [{ k: 'doiTuong', ten: cfg.nhan ?? 'Đối tượng', o: chonO('doiTuong', cfg.nhan ?? 'Đối tượng', dsDoiTuong.map(v => [v, v])) }] : []),
    { k: 'nguon', ten: 'Nguồn', o: chonO('nguon', 'Nguồn', dsNguon.map(v => [v, (NGUON[v] ?? NGUON.tay)[1]])) },
    ...(cfg.loai && !cfg.dieuChinh ? [{ k: 'loai', ten: 'Loại phiếu', o: chonO('loai', 'Loại phiếu', cfg.loai.map(v => [v.k, v.ten])) }] : []),
    ...(muaBan ? [
      { k: 'ttTien', ten: nhom === 'mua' ? 'TT thanh toán' : 'TT thu tiền', o: chonO('ttTien', 'Trạng thái thanh toán', Object.entries(TT_TIEN[nhom as 'mua' | 'ban']).map(([v, x]) => [v, x[1]])) },
      { k: 'ttHd', ten: nhom === 'mua' ? 'Nhận hoá đơn' : 'Xuất hoá đơn', o: chonO('ttHd', 'Trạng thái hoá đơn', Object.entries(TT_HD[nhom as 'mua' | 'ban']).map(([v, x]) => [v, x[1]])) },
      ...(dsKhoLoc.length ? [{ k: 'kho', ten: 'Kho', o: chonO('kho', 'Kho', dsKhoLoc.map(v => [v, v])) }] : []),
      ...(dsHangLoc.length ? [{ k: 'hang', ten: 'Hàng hoá', o: chonO('hang', 'Hàng hoá', dsHangLoc) }] : []),
    ] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'doiTuong'])

  // Lọc theo các ô đã áp dụng, chi nhánh trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const ap = loc0.ap
  const truocLoai = rows.filter(r => {
    if (!trongKhoang(docNgay(String(r.ngay).split(' ')[0]), ap.thoiGian)) return false
    if (cnChon && r.cn !== cnChon.ten) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''}`).includes(fold(ap.tim.trim()))) return false
    if (ap.doiTuong && r.doiTuong !== ap.doiTuong) return false
    if (ap.nguon && String(r.nguon ?? 'tay') !== ap.nguon) return false
    if (ap.loai && r.loai !== ap.loai) return false
    if (muaBan && (ap.ttTien || ap.ttHd)) {
      const nv = ttNghiepVu(r)
      if (ap.ttTien && ttTienTheoTra(r) !== ap.ttTien) return false
      if (ap.ttHd && nv.ttHd !== ap.ttHd) return false
    }
    if (ap.kho && !((r._khoDs as string[] | undefined) ?? []).includes(ap.kho)) return false
    if (ap.hang && !((r._maHang as string[] | undefined) ?? []).includes(ap.hang)) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(String(r.ngay).split(' ')[0]) : undefined)) return false
    }
    return true
  })
  // Điều chỉnh kho: tab con lọc theo loại sau các bộ lọc khác, số trên tab đếm theo danh sách đang lọc (T126)
  const truocTT = cfg.dieuChinh ? truocLoai.filter(r => r.loai === tabLoai) : truocLoai
  const chips = dsChipTT(truocTT, ghi)
  const list = truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  const selectedRows = useMemo(() => list.filter(r => selectedIds.has(r.id)), [list, selectedIds])

  const tong = list.reduce((a, r) => a + r.tong, 0)
  // Cột số được cộng ở dòng tổng; mua, bán thêm Đã trả, Còn phải trả (T93)
  const cotCong = cfg.kiemKe ? ['soMat'] : nhom === 'mua' || nhom === 'ban' ? ['tong', 'thue', 'daTra', 'conNo'] : ['tong', 'thue']
  const congCot = (ds: Row[]) => Object.fromEntries(cotCong.map(k => [k, ds.reduce((a, r) => a + (Number(r[k]) || 0), 0)]))
  // Phiếu đem in: màn nhiều loại phiếu thì lấy loại và cấu hình theo loại của dòng
  const phieuCua = (r: Row): PhieuIn => ({ sc, row: r, cfg: theoLoai(cfg, r.loai), loai: cfg.loai?.find(x => x.k === r.loai) })

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  }, [list, trangHienTai, coTrang])

  // Dòng đang chọn xem chi tiết ở khung dưới
  const activeRow = list.find(r => r.id === activeId) ?? list[0]
  // Lấy dòng như form của cùng phiếu (T27): cấu hình theo loại phiếu, phiếu đã lưu dùng dòng đã lưu
  // Phiếu thu, chi: cột Lý do, Đối tượng trên dòng theo đầu phiếu, như form
  const { cfgDong, oLy, activeDong } = useMemo(() => {
    const loaiK = cfg.loai?.find(x => x.k === activeRow?.loai)?.k ?? cfg.loai?.[0]?.k
    const cfgDong = theoLoai(cfg, loaiK)
    const oLy = mod.key === 'tien' ? boO(nhomCua(mod.key, cfgDong, loaiK), cfgDong).a.find(o => o.k === 'ly') : undefined
    if (!activeRow) return { cfgDong, oLy, activeDong: [] as Dong[] }
    const daLuu = activeRow._dong as Dong[] | undefined
    if (daLuu) return { cfgDong, oLy, activeDong: daLuu }
    const ly = oLy ? (activeRow._lyDo ? String(activeRow._lyDo) : lyMacDinh(oLy.ds ?? [], String(activeRow.dienGiai ?? ''))) : ''
    const dt = mod.key === 'tien' && cfgDong.doiTuong !== 'none' ? String(activeRow.doiTuong ?? '') : ''
    const activeDong = dongCua(cfgDong, `${sc.code ?? sc.slug}-${activeRow.id}`)
      .map(d => ({ ...d, ...(oLy ? { ly } : {}), ...(dt ? { dt } : {}) }))
    return { cfgDong, oLy, activeDong }
  }, [activeRow, cfg, sc, mod.key])

  // Định nghĩa các cột (Cột Ngày, Số chứng từ đứng yên bên trái; Cột Chức năng đứng yên bên phải)
  const cols: Col[] = [
    cotChon(list, selectedIds, setSelectedIds, () => setMoHangLoat(true)),
    { k: 'stt', t: 'STT', w: 60, c: true, dinh: 'trai' },
    {
      k: 'ngay',
      t: 'Ngày',
      w: 136,
      dinh: 'trai',
      r: (r: Row) => {
        const dStr = String(r.ngay ?? '')
        const ngayPart = dStr.split(' ')[0]
        const gioPart = r.gio ?? (r.so ? gioPhieu(String(r.so)) : '08:00')
        const full = dStr.includes(':') ? dStr : `${ngayPart} ${gioPart}`
        return <span className="ds-time" title={full}>{full}</span>
      },
    },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 140,
      dinh: 'trai',
      r: (r: Row) => (
        <button
          type="button"
          className="ds-link-so"
          title={String(r.so ?? '')}
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {r.so}
        </button>
      ),
    },
    ...(cfg.loai && !cfg.dieuChinh ? [{ k: 'tenLoai', t: 'Loại', w: 130 } as Col] : []),   // điều chỉnh kho: loại đã là tab (T126)
    { k: 'dienGiai', t: cfg.kiemKe || cfg.dieuChinh ? 'Ghi chú' : 'Diễn giải' },   // phiếu kiểm kê ghi Ghi chú như đầu phiếu (T124)
    ...(mod.key === 'tien' ? [{ k: 'lyDo', t: 'Lý do thu, chi', w: 170 } as Col] : []),   // T96
    ...(cfg.doiTuong !== 'none' ? [{ k: 'doiTuong', t: cfg.nhan ?? 'Đối tượng' } as Col] : []),
    // Đang chọn một chi nhánh trên thanh trên thì cột chi nhánh thừa
    ...(cnChon ? [] : [{ k: 'cn', t: 'Chi nhánh', cls: 'dim', w: 130 } as Col]),
    // Mua hàng gói dưới Pro: kho nhập ở đầu phiếu (T94); gói Pro kho trên từng dòng nên không có cột
    ...(nhom === 'mua' && coKhoDs && !khoDong ? [{ k: 'kho', t: 'Kho', w: 150 } as Col] : []),
    // Trạng thái thanh toán & hoá đơn cho nhóm mua / bán
    ...(nhom === 'mua' || nhom === 'ban' ? [
      {
        k: 'ttTien',
        t: nhom === 'mua' ? 'TT thanh toán' : 'TT thu tiền',
        w: 135,
        r: (r: Row) => {
          // Trạng thái theo số đã trả, đã thu, kể cả phiếu thu, chi lập sau (T91)
          const [cls, nhan] = TT_TIEN[nhom as 'mua' | 'ban'][ttTienTheoTra(r)] ?? ['dim', '—']
          return <St k={cls}>{nhan}</St>
        },
      } as Col,
      {
        k: 'ttHd',
        t: nhom === 'mua' ? 'Nhận hoá đơn' : 'Xuất hoá đơn',
        w: 130,
        r: (r: Row) => {
          const nv = ttNghiepVu(r)
          const [cls, nhan] = TT_HD[nhom as 'mua' | 'ban'][nv.ttHd] ?? ['dim', '—']
          return <St k={cls}>{nhan}</St>
        },
      } as Col,
      // Cột mặc định ẩn, bật ở Tuỳ chỉnh cột (T92)
      { k: 'kyHieuHd', t: 'Ký hiệu HĐ', cls: 'code', w: 110, an: true } as Col,
      { k: 'soHd', t: 'Số hoá đơn', cls: 'code', w: 110, an: true } as Col,
      { k: 'ngayHd', t: 'Ngày hoá đơn', w: 115, an: true } as Col,
      { k: 'hanTt', t: 'Hạn thanh toán', w: 125, an: true } as Col,
      { k: 'daTra', t: nhom === 'mua' ? 'Đã trả' : 'Đã thu', num: true, w: 120, an: true } as Col,
      { k: 'conNo', t: nhom === 'mua' ? 'Còn phải trả' : 'Còn phải thu', num: true, w: 125, an: true } as Col,
    ] : []),
    // Phiếu kiểm kê không có tiền: thay Tiền thuế, Tổng tiền bằng Kho, Số mặt hàng (T124)
    ...(cfg.kiemKe ? [{ k: 'kho', t: 'Kho', w: 180 } as Col, { k: 'soMat', t: 'Số mặt hàng', num: true, w: 120 } as Col] : []),
    ...(cfg.dieuChinh ? [{ k: 'kho', t: 'Kho', w: 180 } as Col] : []),   // T126
    ...(!cfg.kiemKe && !cfg.dieuChinh && (cfg.thue !== undefined || cfg.dong === 'hang') ? [{ k: 'thue', t: 'Tiền thuế', num: true, w: 120 } as Col] : []),
    // Tham chiếu (T127): các phiếu liên quan, bấm số phiếu để mở
    {
      k: 'thamChieu', t: 'Tham chiếu', w: 150,
      r: r => {
        const ds = thamChieuCua(r)
        return ds.length ? <span className="ds-tc">{ds.map((x, i) => x.to
          ? <Link key={i} className="ds-link-so" to={x.to} onClick={e => e.stopPropagation()}>{x.so}</Link>
          : <span key={i} className="code">{x.so}</span>)}</span> : ''
      },
    },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 90,
      r: r => {
        const [c, t] = NGUON[r.nguon] ?? NGUON.tay
        return <span className={`src ${c}`}>{t}</span>
      },
    },
    // Tổng tiền là cột cuối; không còn cột Chức năng, xem phiếu bằng đúp chuột hoặc khung chi tiết (T48)
    ...(cfg.kiemKe ? [] : [{ k: 'tong', t: 'Tổng tiền', num: true, w: 120 } as Col]),
  ]

  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  // Gom nhóm danh sách chứng từ theo cột (T50 học từ LedgerStudio)
  const [nhomCols, setNhomCols] = useState<string[]>([])
  const [expandMap, setExpandMap] = useState<Map<string, boolean>>(() => new Map())

  const dsCotGomNhom = useMemo(() => {
    const bo = new Set(['chk', 'stt', 'so', 'dienGiai', 'thue', 'tong', 'action'])
    return cot.colsHien.filter(c => !bo.has(c.k))
  }, [cot.colsHien])

  const tenCotMap = useMemo(() => {
    return Object.fromEntries(cot.colsDu.map(c => [c.k, c.t || c.k]))
  }, [cot.colsDu])

  const displayRows = useMemo(() => {
    if (nhomCols.length === 0) return pagedRows
    return buildGroupedData(list, nhomCols, cotCong, tenCotMap, expandMap)
  }, [list, pagedRows, nhomCols, tenCotMap, expandMap])

  const handleToggleGroup = (id: string) => {
    const cur = expandMap.has(id) ? expandMap.get(id) : true
    expandMap.set(id, !cur)
    setExpandMap(new Map(expandMap))
  }

  // Phím Enter trên dòng đang chọn mở form chứng từ (T74)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (activeRow) {
          e.preventDefault()
          nav(`${path}/${activeRow.id}`)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeRow, path, nav])

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{title ?? tenMan(sc)}</h1>

      {extra}

      <div className={`voucher-split${panelMo ? '' : ' gon-ct'}`}>
        {/* Nửa trên: 50% danh sách các phiếu */}
        <section className="card voucher-top">
          {/* Thanh công cụ: chip trạng thái bên trái; ô lọc, phễu, Lọc, Tuỳ chỉnh cột, Excel, Hàng loạt, Thêm mới | ⌄ (T43) */}
          <div className="ds-thanh">
            {/* Điều chỉnh kho: tab con Xuất, Nhập điều chỉnh cùng hàng bộ lọc (T126) */}
            {cfg.dieuChinh && cfg.loai && (
              <div className="seg dc-tabs" role="tablist" aria-label="Loại phiếu điều chỉnh">
                {cfg.loai.map(l => (
                  <button key={l.k} type="button" role="tab" aria-selected={tabLoai === l.k} className={tabLoai === l.k ? 'on' : ''}
                    onClick={() => { setTabLoai(l.k); setTrang(1); setActiveId(String(rows.find(r => r.loai === l.k)?.id ?? '')) }}>
                    {l.ten}<span className="dc-dem">{truocLoai.filter(r => r.loai === l.k).length}</span>
                  </button>
                ))}
              </div>
            )}
            {ghi && !cfg.dieuChinh && <ChipTrangThai ds={chips} chon={chipTT} onChon={k => { setChipTT(k); setTrang(1) }} />}   {/* điều chỉnh kho không có chip trạng thái ghi sổ (T126) */}
            <div className="ds-thanh-phai">
              <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
                onLoc={apLoc} onXoaHet={loc0.xoaNhap} />
              <NutTuyChinhCot
                cols={cot.colsDu}
                an={cot.an}
                coDinh={COT_CO_DINH}
                macDinh={cot.macDinh}
                dongBang={cot.dongBang}
                onLuu={cot.luu}
                onDoRongTuDong={cot.datDoRongTuDong}
              />
              <NutExcel
                onNhap={() => toast('Nhập chứng từ từ file Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)}
              />
              <NutHangLoat
                selectedRows={selectedRows}
                ghi={ghi}
                onBoChon={() => setSelectedIds(new Set())}
                onXoa={ids => xoaPhieu(`${mod.key}/${sc.slug}`, ids.map(id => ({ id, so: String(rows.find(r => String(r.id) === id)?.so ?? '') })), s.ten)}
                open={moHangLoat}
                onOpenChange={setMoHangLoat}
                onIn={() => setPhieuIn(selectedRows.map(phieuCua))}
              />
              {!cfg.khongThem && <NutThemMoiSplit
                toMoi={cfg.loai ? `${path}/moi?loai=${cfg.loai[0].k}` : `${path}/moi`}
                loai={cfg.loai}
                taiNguon={cfg.nguon && cfg.nguon !== 'tay' && cfg.nguon !== 'excel' ? {   // nhập Excel đã có ở nút Excel (T64)
                  ten: NGUON[cfg.nguon][1],
                  onTai: () => toast(`Đã tải 14 chứng từ mới từ ${NGUON[cfg.nguon!][1]}`),
                } : undefined}
              />}
            </div>
          </div>

          {/* Thanh gom nhóm kéo thả theo LedgerStudio (T50) */}
          <div className="ds-groupzone">
            <div className="ds-groupzone-nhan">
              <Icon n="filter" className="ic sm" />
              <span>Gom nhóm:</span>
            </div>
            {nhomCols.length === 0 ? (
              <span style={{ color: 'var(--muted)' }}>— chọn cột để gom nhóm xem tổng hợp</span>
            ) : (
              nhomCols.map(k => (
                <span key={k} className="ds-gchip">
                  {tenCotMap[k] || k}
                  <button
                    type="button"
                    onClick={() => setNhomCols(nhomCols.filter(x => x !== k))}
                    title="Bỏ gom nhóm cột này"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
            {dsCotGomNhom.filter(c => !nhomCols.includes(c.k)).length > 0 && (
              <select
                className="ds-group-sel"
                value=""
                aria-label="Thêm cột gom nhóm"
                onChange={e => {
                  if (e.target.value) setNhomCols([...nhomCols, e.target.value])
                }}
              >
                <option value="">+ Thêm cột gom</option>
                {dsCotGomNhom
                  .filter(c => !nhomCols.includes(c.k))
                  .map(c => (
                    <option key={c.k} value={c.k}>
                      {c.t || c.k}
                    </option>
                  ))}
              </select>
            )}
            {nhomCols.length > 0 && (
              <button
                type="button"
                className="btn sm ghost"
                style={{ padding: '0 6px', height: 22, fontSize: 11.5, marginLeft: 'auto' }}
                onClick={() => setNhomCols([])}
              >
                Xoá gom nhóm
              </button>
            )}
          </div>

          {/* Bảng danh sách chứng từ */}
          {list.length ? (
            <>
              <Table
                cols={cot.colsHien}
                rows={displayRows}
                motDong
                keDoc
                doRong={cot.doRong}
                onToggleGroup={handleToggleGroup}
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['chk', 'stt', 'action']),
                  kieu: c => kieuCot(c.k), luaChon }}
                onRow={r => setActiveId(r.id)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' && ghi ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{
                  stt: nhomCols.length > 0 ? `Tổng: ${list.length}` : `Tổng: ${pagedRows.length}`,
                  ...congCot(nhomCols.length > 0 ? list : pagedRows),
                }}
              />
              <PhanTrang
                tong={list.length}
                tongCong={congCot(list)}
                trang={trangHienTai}
                coTrang={coTrang}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có chứng từ khớp bộ lọc</b>
              <button
                type="button"
                className="btn sm"
                style={{ marginTop: 10 }}
                onClick={() => { loc0.xoaHet(); setChipTT('all'); setLocCot({}); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>

        {/* Nửa dưới: chi tiết bên trong chứng từ đang chọn (thu gọn / mở rộng được) */}
        <section className={`card ct-panel voucher-bottom${panelMo ? '' : ' gon'}`}>
          {activeRow ? (
            panelMo ? (
              <>
                <div className="voucher-bottom-h">
                  <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                    <Icon n="doc" className="ic sm" />
                    <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                    <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ({activeRow.ngay}) — {activeRow.dienGiai}
                    </span>
                  </div>
                  <div className="tabs" style={{ margin: 0, flex: 'none' }}>
                    <button
                      type="button"
                      className={tabPanel === 'ct' ? 'on' : ''}
                      onClick={() => setTabPanel('ct')}
                    >
                      Hàng tiền ({activeDong.length} dòng)
                    </button>
                    {coTabHt && (
                      <button
                        type="button"
                        className={tabPanel === 'ht' ? 'on' : ''}
                        onClick={() => setTabPanel('ht')}
                      >
                        {ghi ? 'Hạch toán' : 'Ghi sổ'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={tabPanel === 'khac' ? 'on' : ''}
                      onClick={() => setTabPanel('khac')}
                    >
                      Thông tin khác
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn sm"
                    style={{ flex: 'none', marginLeft: 8 }}
                    onClick={() => nav(`${path}/${activeRow.id}`)}
                    title="Mở form toàn màn hình (hoặc đúp chuột vào dòng)"
                  >
                    <Icon n="eye" className="ic sm" />Xem chi tiết
                  </button>
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ flex: 'none', marginLeft: 4 }}
                    onClick={() => setPanelMo(false)}
                    title="Thu gọn màn hình chi tiết"
                  >
                    <Icon n="chevd" className="ic sm" />Thu gọn
                  </button>
                </div>

                <div className="voucher-bottom-b">
                  {tabPanel === 'ct' && cfg.kiemKe && <BangKiemKe dong={activeDong} cheDo="xem" />}
                  {tabPanel === 'ct' && !cfg.kiemKe && (
                    <BangSua
                      cfg={cfgDong}
                      dong={activeDong}
                      cheDo="xem"
                      coKho={Boolean(bo.kho) && (s.goi === 'PR' || (nhom !== 'mua' && nhom !== 'ban'))}   // gói dưới Pro: kho ở đầu phiếu mua, bán (T83)
                      coCk={Boolean(bo.ck)}
                      coKm={ghi}
                      coNhapKho={nhom === 'mua' && Boolean(boO(nhom, cfgDong).tongNhap)}
                      lyDo={oLy ? { nhan: oLy.nhan, ds: oLy.ds ?? [], macDinh: '' } : undefined}
                    />
                  )}

                {tabPanel === 'ht' && (
                  <div style={{ padding: 14 }}>
                    <HachToan
                      cfg={cfg}
                      tien={activeRow.tien}
                      thue={activeRow.thue || 0}
                      dt={String(activeRow.doiTuong ?? '')}
                      cn={String(activeRow.cn ?? '')}
                    />
                  </div>
                )}

                {tabPanel === 'khac' && (
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13, padding: 14 }}>
                    <div><b>Đối tượng:</b> {activeRow.doiTuong || '—'}</div>
                    <div><b>Chi nhánh:</b> {activeRow.cn || '—'}</div>
                    <div><b>Nguồn dữ liệu:</b> {activeRow.nguon}</div>
                    <div><b>Tổng tiền:</b> {money(activeRow.tong)} đ</div>
                    <div><b>Thuế GTGT:</b> {money(activeRow.thue || 0)} đ</div>
                    <div><b>Trạng thái:</b> {TT_CT[activeRow.tt]?.[1] ?? activeRow.tt}</div>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div
                className="voucher-bottom-h"
                onClick={() => setPanelMo(true)}
                title="Bấm để mở rộng màn hình chi tiết chứng từ"
                style={{ cursor: 'pointer' }}
              >
                <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                  <Icon n="doc" className="ic sm" />
                  <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                  <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ({activeRow.ngay}) — {activeRow.dienGiai}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn sm ghost"
                  style={{ flex: 'none', marginLeft: 8 }}
                  onClick={e => { e.stopPropagation(); setPanelMo(true) }}
                  title="Mở màn hình chi tiết chứng từ"
                >
                  <Icon n="chevu" className="ic sm" />Mở chi tiết
                </button>
              </div>
            )
          ) : (
            <div className="empty">
              <b>Chọn một chứng từ ở bảng trên để xem chi tiết</b>
            </div>
          )}
        </section>
      </div>
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
    </div>
  )
}
