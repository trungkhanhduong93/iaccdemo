// Màn chứng từ chung: danh sách theo bố cục AMIS với cột đứng yên, bộ lọc kỳ nhanh, khung chi tiết bên dưới, thao tác hàng loạt.
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { Dropdown, MenuHead, MenuItem, Select } from '../Dropdown'
import { St, Table } from '../Table'
import { PhanTrang } from '../PhanTrang'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../CongCuDs'
import { fold, money } from '../format'
import { dangLoc, khopLoc, type GiaTriLoc, type KieuLoc } from '../LocCot'
import {
  BoLoc, ChipTrangThai, NutHangLoat, NutTuyChinhCot, cotChon, dsChipTT, khopChipTT, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef,
} from '../LocNangCao'
import { NGUON, TT_CT, chungTu, dongCua, ttNghiepVu } from './gen'
import { boO, nhomCua, theoLoai, TT_HD, TT_TIEN } from './nhom'
import { BangSua } from './BangSua'
import { ChungTuForm, HachToan, LichSu, VoucherDetail } from './ChungTuForm'

const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so', 'action'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['tenLoai', 'nguon', 'ttTien', 'ttHd'])

// Re-export để các màn khác (như ban-hang/ChungTuBanHang.tsx) tiếp tục sử dụng
export { ChungTuForm, VoucherDetail, HachToan, LichSu }

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
interface GtLoc { thoiGian: KhoangNgay; tim: string; doiTuong: string; nguon: string; loai: string; ttTien: string; ttHd: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangNay(), tim: '', doiTuong: '', nguon: '', loai: '', ttTien: '', ttHd: '' })

const MAC_DINH: VoucherCfg ={ prefix: 'CT', doiTuong: 'none', dienGiai: ['Chứng từ'], tien: [1_000_000, 20_000_000] }

export function VoucherScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher ?? { ...MAC_DINH, dienGiai: [tenMan(sc)] }
  const rows = useMemo(() => (cfg.loai ? gopLoai(cfg, sc.code ?? sc.slug) : chungTu(cfg, sc.code ?? sc.slug)), [sc])

  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }

  return <VoucherList sc={sc} mod={mod} cfg={cfg} rows={rows} />
}

/** Màn nhiều loại phiếu: mỗi loại lấy 9 phiếu gần nhất rồi xếp chung theo ngày */
function gopLoai(cfg: VoucherCfg, seed: string): Row[] {
  const ngay = (r: Row) => String(r.ngay).split('/').reverse().join('')
  return cfg.loai!.flatMap(v => chungTu(theoLoai(cfg, v.k), `${seed}-${v.k}`).slice(0, 9)
    .map((r): Row => ({ ...r, id: `${v.k}-${r.id}`, loai: v.k, tenLoai: v.ten })))
    .sort((a, b) => ngay(b).localeCompare(ngay(a)) || String(b.so).localeCompare(String(a.so)))
    .map((r, i) => ({ ...r, tt: i < 3 ? 'nhap' : i === 5 ? 'loi' : 'ghi' }))
}

export function VoucherList({ sc, mod, cfg, rows, extra, title }: ScreenProps & { cfg: VoucherCfg; rows: Row[]; extra?: React.ReactNode; title?: string }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc0 = useLocNhap(locMacDinh)
  const [chipTT, setChipTT] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [activeId, setActiveId] = useState<string>(rows[0]?.id ?? '')
  const [panelMo, setPanelMo] = useState(true)
  const [tabPanel, setTabPanel] = useState<'ct' | 'ht' | 'khac'>('ct')

  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const cnChon = chiNhanhHienTai(s)
  const nhom = nhomCua(mod.key, cfg)
  const bo = boO(nhom, cfg)
  const path = duongDan(mod, sc)

  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)

  // Lọc từng cột trên hàng lọc dưới tiêu đề bảng: phễu điều kiện theo kiểu cột, so theo chữ hiện trong ô
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tong' || k === 'thue' ? 'so' : 'chu'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'nguon') return (NGUON[r.nguon] ?? NGUON.tay)[1]
    if (k === 'tt') return ghi ? (TT_CT[r.tt]?.[1] ?? 'Chưa ghi') : r.tt === 'nhap' ? 'Nháp' : 'Đã lưu'
    if ((k === 'ttTien' || k === 'ttHd') && (nhom === 'mua' || nhom === 'ban')) {
      const nv = ttNghiepVu(r)
      return (k === 'ttTien' ? TT_TIEN : TT_HD)[nhom][k === 'ttTien' ? nv.ttTien : nv.ttHd]?.[1] ?? ''
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
    ...(cfg.loai ? [{ k: 'loai', ten: 'Loại phiếu', o: chonO('loai', 'Loại phiếu', cfg.loai.map(v => [v.k, v.ten])) }] : []),
    ...(muaBan ? [
      { k: 'ttTien', ten: nhom === 'mua' ? 'TT thanh toán' : 'TT thu tiền', o: chonO('ttTien', 'Trạng thái thanh toán', Object.entries(TT_TIEN[nhom as 'mua' | 'ban']).map(([v, x]) => [v, x[1]])) },
      { k: 'ttHd', ten: nhom === 'mua' ? 'Nhận hoá đơn' : 'Xuất hoá đơn', o: chonO('ttHd', 'Trạng thái hoá đơn', Object.entries(TT_HD[nhom as 'mua' | 'ban']).map(([v, x]) => [v, x[1]])) },
    ] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'doiTuong'])

  // Lọc theo các ô đã áp dụng, chi nhánh trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const ap = loc0.ap
  const truocTT = rows.filter(r => {
    if (!trongKhoang(docNgay(r.ngay), ap.thoiGian)) return false
    if (cnChon && r.cn !== cnChon.ten) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''}`).includes(fold(ap.tim.trim()))) return false
    if (ap.doiTuong && r.doiTuong !== ap.doiTuong) return false
    if (ap.nguon && String(r.nguon ?? 'tay') !== ap.nguon) return false
    if (ap.loai && r.loai !== ap.loai) return false
    if (muaBan && (ap.ttTien || ap.ttHd)) {
      const nv = ttNghiepVu(r)
      if (ap.ttTien && nv.ttTien !== ap.ttTien) return false
      if (ap.ttHd && nv.ttHd !== ap.ttHd) return false
    }
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(r.ngay) : undefined)) return false
    }
    return true
  })
  const chips = dsChipTT(truocTT, ghi)
  const list = truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  const selectedRows = useMemo(() => list.filter(r => selectedIds.has(r.id)), [list, selectedIds])

  const tong = list.reduce((a, r) => a + r.tong, 0)

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang).map((r, i) => ({ ...r, stt: batDau + i + 1 }))
  }, [list, trangHienTai, coTrang])

  // Dòng đang chọn xem chi tiết ở khung dưới
  const activeRow = list.find(r => r.id === activeId) ?? list[0]
  const activeDong = useMemo(() => {
    if (!activeRow) return []
    const seed = `${sc.code ?? sc.slug}-${activeRow.id}`
    return dongCua(cfg, seed)
  }, [activeRow, cfg, sc])

  // Định nghĩa các cột (Cột Ngày, Số chứng từ đứng yên bên trái; Cột Chức năng đứng yên bên phải)
  const cols: Col[] = [
    cotChon(list, selectedIds, setSelectedIds, () => setMoHangLoat(true)),
    { k: 'stt', t: 'STT', w: 60, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 100, dinh: 'trai' },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 140, dinh: 'trai' },
    ...(cfg.loai ? [{ k: 'tenLoai', t: 'Loại', w: 130 } as Col] : []),
    { k: 'dienGiai', t: 'Diễn giải' },
    ...(cfg.doiTuong !== 'none' ? [{ k: 'doiTuong', t: cfg.nhan ?? 'Đối tượng' } as Col] : []),
    // Đang chọn một chi nhánh trên thanh trên thì cột chi nhánh thừa
    ...(cnChon ? [] : [{ k: 'cn', t: 'Chi nhánh', cls: 'dim', w: 130 } as Col]),
    // Trạng thái thanh toán & hoá đơn cho nhóm mua / bán
    ...(nhom === 'mua' || nhom === 'ban' ? [
      {
        k: 'ttTien',
        t: nhom === 'mua' ? 'TT thanh toán' : 'TT thu tiền',
        w: 135,
        r: (r: Row) => {
          const nv = ttNghiepVu(r)
          const [cls, nhan] = TT_TIEN[nhom as 'mua' | 'ban'][nv.ttTien] ?? ['dim', '—']
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
    ] : []),
    ...(cfg.thue !== undefined || cfg.dong === 'hang' ? [{ k: 'thue', t: 'Tiền thuế', num: true, w: 120 } as Col] : []),
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120 },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 90,
      r: r => {
        const [c, t] = NGUON[r.nguon] ?? NGUON.tay
        return <span className={`src ${c}`}>{t}</span>
      },
    },
    // Cột chức năng đứng yên bên phải
    {
      k: 'action',
      t: 'Chức năng',
      w: 105,
      dinh: 'phai',
      r: r => (
        <div className="row" style={{ gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="btn sm ghost ct-xem"
            onClick={() => nav(`${path}/${r.id}`)}
          >
            Xem
          </button>
          <Dropdown
            btnClass="icon-btn sm"
            align="end"
            width={160}
            label={<Icon n="more" className="ic sm" />}
          >
            <MenuItem icon="edit" onClick={() => nav(`${path}/${r.id}?sua=1`)}>Sửa</MenuItem>
            <MenuItem icon="copy" onClick={() => toast(`Đã nhân bản ${r.so}`)}>Nhân bản</MenuItem>
            <MenuItem icon="printer" onClick={() => toast(`In ${r.so}`)}>In</MenuItem>
            {ghi && (
              <MenuItem
                icon="check"
                onClick={() => toast(r.tt === 'ghi' ? `Đã bỏ ghi sổ ${r.so}` : `Đã ghi sổ ${r.so}`)}
              >
                {r.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}
              </MenuItem>
            )}
            <MenuItem icon="trash" danger onClick={() => toast(`Xoá ${r.so}`)}>Xoá</MenuItem>
          </Dropdown>
        </div>
      ),
    },
  ]

  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{title ?? tenMan(sc)}</h1>

      {extra}

      <div className={`voucher-split${panelMo ? '' : ' gon-ct'}`}>
        {/* Nửa trên: 50% danh sách các phiếu */}
        <section className="card voucher-top">
          {/* Thanh công cụ: chip trạng thái bên trái; ô lọc, phễu, Lọc, Tuỳ chỉnh cột, Excel, Hàng loạt, Thêm mới | ⌄ (T43) */}
          <div className="ds-thanh">
            <ChipTrangThai ds={chips} chon={chipTT} onChon={k => { setChipTT(k); setTrang(1) }} />
            <div className="ds-thanh-phai">
              <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
                onLoc={apLoc} onXoaHet={loc0.xoaNhap} />
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} onLuu={cot.luu} />
              <NutExcel
                onNhap={() => toast('Nhập chứng từ từ file Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)}
              />
              <NutHangLoat
                selectedRows={selectedRows}
                ghi={ghi}
                onBoChon={() => setSelectedIds(new Set())}
                open={moHangLoat}
                onOpenChange={setMoHangLoat}
              />
              <NutThemMoiSplit
                toMoi={cfg.loai ? `${path}/moi?loai=${cfg.loai[0].k}` : `${path}/moi`}
                loai={cfg.loai}
                taiNguon={cfg.nguon && cfg.nguon !== 'tay' ? {
                  ten: NGUON[cfg.nguon][1],
                  onTai: () => toast(`Đã tải 14 chứng từ mới từ ${NGUON[cfg.nguon!][1]}`),
                } : undefined}
              />
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => setPanelMo(p => !p)}
                title={panelMo ? 'Thu gọn chi tiết chứng từ (mở rộng danh sách)' : 'Mở màn hình chi tiết chứng từ'}
                aria-label={panelMo ? 'Thu gọn chi tiết' : 'Mở chi tiết'}
              >
                <Icon n={panelMo ? 'chevd' : 'chevu'} className="ic sm" />
              </button>
            </div>
          </div>

          {/* Bảng danh sách chứng từ */}
          {list.length ? (
            <>
              <Table
                cols={cot.colsHien}
                rows={pagedRows}
                motDong
                keDoc
                doRong={cot.doRong}
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['chk', 'stt', 'action']),
                  kieu: c => kieuCot(c.k), luaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{
                  stt: `Tổng: ${list.length}`,
                  tong,
                  thue: list.reduce((a, r) => a + (r.thue || 0), 0),
                }}
              />
              <PhanTrang
                tong={list.length}
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
                    <button
                      type="button"
                      className={tabPanel === 'ht' ? 'on' : ''}
                      onClick={() => setTabPanel('ht')}
                    >
                      {ghi ? 'Hạch toán' : 'Ghi sổ'}
                    </button>
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
                  {tabPanel === 'ct' && (
                    <BangSua
                      cfg={theoLoai(cfg, activeRow.loai)}
                      dong={activeDong}
                      cheDo="xem"
                      coKho={Boolean(bo.kho)}
                      coCk={Boolean(bo.ck)}
                      coKm={ghi}
                    />
                  )}

                {tabPanel === 'ht' && (
                  <div style={{ padding: 14 }}>
                    <HachToan
                      cfg={cfg}
                      goi={s.goi}
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
    </div>
  )
}
