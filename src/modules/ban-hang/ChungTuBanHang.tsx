// Chứng từ bán hàng: mỗi chi nhánh một chứng từ mỗi ngày, gom từ đơn POS trên FABi. Số khớp KQKD, Tổng quan.
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHE_DO } from '../../app/che-do'
import { CHI_NHANH, DAILY, HANG, cnTen, soBH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { VoucherDetail } from '../../ui/generic/VoucherScreen'
import { St, Table } from '../../ui/Table'
import { dmy, fold, money, moneyD } from '../../ui/format'
import { Popover, Select } from '../../ui/Dropdown'
import { PhanTrang } from '../../ui/PhanTrang'
import { useDaXoa, xoaPhieu } from '../../ui/generic/daXoa'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { dangLoc, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import {
  BoLoc, ChipTrangThai, NutHangLoat, NutTuyChinhCot, cotChon, dsChipTT, khopChipTT, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef,
} from '../../ui/LocNangCao'
import { HopInChungTu, type PhieuIn } from '../../ui/bao-cao/InChungTu'

/** Bán hàng ngoài POS: tiệc mang về, khách công ty đặt trước. Lập tay, không qua FABi */
const NGOAI_POS: VoucherCfg = {
  prefix: 'BH', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Bán hàng ngoài POS', dong: 'hang', tien: [0, 0], nguon: 'tay', soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
  dienGiai: ['Bán tiệc mang về cho khách công ty', 'Bán set quà Trung thu'], noCo: [['1111', '5111', 'Doanh thu'], ['1111', '33311', 'Thuế GTGT đầu ra'], ['632', '152', 'Giá vốn']],
}

const TY_LE = [0.21, 0.09, 0.12, 0.14, 0.07, 0.15, 0.1, 0.09, 0.03]   // cơ cấu doanh thu theo món trong HANG

function dongMon(dt: number) {
  let con = dt
  return HANG.map((h, i) => {
    const tien = i === HANG.length - 1 ? con : Math.round(dt * TY_LE[i] / h.gia) * h.gia
    con -= tien
    const sl = Math.max(1, Math.round(tien / h.gia))
    return { ...h, sl, tien, thue: Math.round(tien * h.ts / 100), stt: i + 1 }
  })
}

export function ChungTuBanHang({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const tatCa = useMemo(() => DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().map((x, i) => ({
    id: String(i), so: soBH(x), ngay: dmy(x.date), thang: x.date.getMonth() + 1, cn: cnTen(x.cn), x,
    dienGiai: `Doanh thu ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`, doiTuong: 'Khách lẻ POS',
    tien: x.dt, thue: x.vat, tong: x.dt + x.vat, nguon: 'FABi', tt: i < 3 ? 'nhap' : x.cn === 'q5' && x.date.getDate() === 5 && x.date.getMonth() === 9 ? 'loi' : 'ghi',
  })), [])
  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban])
  if (id === 'moi') return <VoucherDetail sc={sc} mod={mod} cfg={NGOAI_POS} />
  if (id) return <ChiTiet sc={sc} mod={mod} row={rows.find(r => r.id === id) ?? rows[0]} />
  return <DanhSach sc={sc} mod={mod} rows={rows} />
}

/** Cột cố định hai đầu, không ẩn, không kéo đổi thứ tự */
const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['cn', 'nguon'])

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
interface GtLoc { thoiGian: KhoangNgay; tim: string; cn: string; nguon: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangNay(), tim: '', cn: '', nguon: '' })

function DanhSach({ sc, mod, rows }: ScreenProps & { rows: Row[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [chipTT, setChipTT] = useState('all')
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [moGhiChu, setMoGhiChu] = useState(false)
  const nutGhiChu = useRef<HTMLButtonElement>(null)
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const [tabPanel, setTabPanel] = useState('ct')
  const [panelMo, setPanelMo] = useState(false)
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieu !== 'khong'
  // Chi nhánh chọn trên thanh trên (QD17): lọc theo chi nhánh đó, bỏ cột và ô lọc chi nhánh
  const cnChon = chiNhanhHienTai(s)

  const tenTT = (r: Row) => r.tt === 'loi' && ghi ? 'Lệch đối soát' : r.tt === 'nhap' && ghi ? 'Chưa ghi sổ' : 'Đã ghi sổ'
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tien' || k === 'thue' || k === 'tong' ? 'so' : 'chu'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'tt') return tenTT(r)
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }
  const luaChon = useMemo(() => Object.fromEntries([...COT_CHON].map(k => [k, [...new Set(rows.map(r => chuCot(k, r)).filter(Boolean))]])), [rows, ghi])

  // Ô lọc: giá trị nháp, bấm Lọc mới áp dụng (T41)
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const chonO = (k: 'cn' | 'nguon', ten: string, ds: [string, string][]) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)}>
      <option value="">Tất cả</option>
      {ds.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </Select>
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay align="end" value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    {
      k: 'tim', ten: 'Tìm kiếm', o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, diễn giải" title="Tìm theo số chứng từ, diễn giải" aria-label="Tìm kiếm"
        onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(cnChon ? [] : [{ k: 'cn', ten: 'Chi nhánh', o: chonO('cn', 'Chi nhánh', CHI_NHANH.map(c => [c.id, c.ten])) }]),
    { k: 'nguon', ten: 'Nguồn', o: chonO('nguon', 'Nguồn', [...new Set(rows.map(r => String(r.nguon)))].map(v => [v, v])) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'cn'])

  // Lọc theo các ô đã áp dụng, chi nhánh trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const truocTT = rows.filter(r => {
    const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
    if (!trongKhoang(d, ap.thoiGian)) return false
    if (cnChon && r.x?.cn !== cnChon.id) return false
    if (ap.cn && r.x?.cn !== ap.cn) return false
    if (ap.nguon && r.nguon !== ap.nguon) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.dienGiai}`).includes(fold(ap.tim.trim()))) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? d : undefined)) return false
    }
    return true
  })
  const chips = dsChipTT(truocTT, ghi, 'Lệch đối soát')
  const list = truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  const selectedRows = useMemo(() => list.filter(r => chon.has(r.id)), [list, chon])
  const [activeId, setActiveId] = useState<string>(() => list[0]?.id ?? '')
  const activeRow = list.find(r => r.id === activeId) ?? list[0]

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  }, [list, trangHienTai, coTrang])

  const sum = (k: string) => pagedRows.reduce((a, r) => a + r[k], 0)
  const tongDs = (k: string) => list.reduce((a, r) => a + (r as Row)[k], 0)
  const cols: Col[] = [
    cotChon(list, chon, setChon, () => setMoHangLoat(true)),
    { k: 'stt', t: 'STT', w: 60, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 100, dinh: 'trai' },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 150, dinh: 'trai' },
    { k: 'dienGiai', t: 'Diễn giải' },
    ...(cnChon ? [] : [{ k: 'cn', t: 'Chi nhánh', cls: 'dim' } as Col]),
    { k: 'tien', t: 'Doanh thu chưa thuế', num: true, w: 160 }, { k: 'thue', t: 'Thuế GTGT', num: true, w: 120 },
    { k: 'nguon', t: 'Nguồn', w: 90, r: () => <span className="src">FABi</span> },
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120 },   // Tổng tiền là cột cuối (T48)
  ]
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className={`voucher-split${panelMo ? '' : ' gon-ct'}`}>
        <section className="card voucher-top">
          {/* Thanh công cụ: chip trạng thái bên trái; ô lọc, phễu, Lọc, Tuỳ chỉnh cột, Excel, Hàng loạt, Thêm mới | ⌄ (T43) */}
          <div className="ds-thanh">
            <div className="ds-chips-wrap">
              {ghi && <ChipTrangThai ds={chips} chon={chipTT} onChon={k => { setChipTT(k); setTrang(1) }} />}
              <button
                ref={nutGhiChu}
                type="button"
                className="icon-btn sm ds-ghi-chu-fabi"
                title="Đơn POS trên FABi tự gom thành một chứng từ cho mỗi chi nhánh mỗi ngày. Đơn huỷ, trả hàng sau khi chốt ca được điều chỉnh vào chứng từ cùng ngày, không tạo chứng từ trùng."
                aria-label="Ghi chú FABi"
                onClick={() => setMoGhiChu(v => !v)}
              >
                <Icon n="info" className="ic sm" />
              </button>
              <Popover anchor={nutGhiChu} open={moGhiChu} onClose={() => setMoGhiChu(false)} width={320}>
                <div style={{ padding: '10px 14px', fontSize: 13, lineHeight: 1.45, color: 'var(--ink)' }}>
                  <b>Ghi chú FABi</b>
                  <p style={{ margin: '6px 0 0', color: 'var(--body)' }}>
                    Đơn POS trên FABi tự gom thành một chứng từ cho mỗi chi nhánh mỗi ngày. Đơn huỷ, trả hàng sau khi chốt ca được điều chỉnh vào chứng từ cùng ngày, không tạo chứng từ trùng.
                  </p>
                </div>
              </Popover>
            </div>
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
                onNhap={() => toast('Nhập chứng từ bán hàng từ file Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)}
              />
              <NutHangLoat
                selectedRows={selectedRows}
                ghi={ghi}
                onBoChon={() => setChon(new Set())}
                onXoa={ids => xoaPhieu(`${mod.key}/${sc.slug}`, ids)}
                open={moHangLoat}
                onOpenChange={setMoHangLoat}
              />
              <NutThemMoiSplit
                toMoi={`${path}/moi`}
                taiNguon={{
                  ten: 'FABi',
                  onTai: () => toast('Đã tải 612 đơn mới từ FABi, gom vào 3 chứng từ ngày 07/10'),
                }}
              />
            </div>
          </div>
          {list.length ? (
            <>
              <Table
                cols={cot.colsHien}
                rows={pagedRows}
                motDong
                keDoc
                doRong={cot.doRong}
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['chk', 'stt']),
                  kieu: c => kieuCot(c.k), luaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' && ghi ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{ stt: 'Tổng trang', tien: sum('tien'), thue: sum('thue'), tong: sum('tong') }}
              />
              <PhanTrang
                tong={list.length}
                tongCong={{ tien: tongDs('tien'), thue: tongDs('thue'), tong: tongDs('tong') }}
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
                    {[
                      ['ct', 'Hàng bán'],
                      ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'],
                      ['tt', 'Thanh toán'],
                      ['goc', 'Đơn POS gốc'],
                    ].map(([k, l]) => (
                      <button
                        key={k}
                        type="button"
                        className={tabPanel === k ? 'on' : ''}
                        onClick={() => setTabPanel(k)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn sm"
                    style={{ flex: 'none', marginLeft: 8 }}
                    onClick={() => nav(`${duongDan(mod, sc)}/${activeRow.id}`)}
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
                  <NoiDungTab x={activeRow.x} tab={tabPanel} kieu={kieu} />
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
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Chọn một chứng từ ở bảng trên để xem chi tiết</b>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function NoiDungTab({ x, tab, kieu }: { x: (typeof DAILY)[number]; tab: string; kieu: ReturnType<typeof kieuGhiSo> }) {
  const dong = dongMon(x.dt)
  const ht = [
    { dg: 'Thu tiền mặt', no: '1111', co: '5111, 33311', tien: x.tm },
    { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: '5111, 33311', tien: x.ck + x.the },
    { dg: 'Phải thu app giao đồ ăn', no: '131', co: '5111, 33311', tien: x.app },
    { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: x.gv },
  ]
  const rowsSo = [
    { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: x.dt },
    { so: 'Sổ theo dõi thuế GTGT', tien: x.vat },
    { so: 'Sổ tiền mặt', tien: x.tm },
    { so: 'Sổ tiền gửi ngân hàng', tien: x.ck + x.the },
  ]
  return (
    <>
      {tab === 'ct' && (
        <Table
          cols={[
            { k: 'stt', t: '#', w: 40, cls: 'dim' },
            { k: 'ma', t: 'Mã món', cls: 'code' },
            { k: 'ten', t: 'Tên món' },
            { k: 'dvt', t: 'ĐVT' },
            { k: 'sl', t: 'Số lượng', num: true },
            { k: 'gia', t: 'Đơn giá', num: true },
            { k: 'tien', t: 'Thành tiền', num: true },
            { k: 'ts', t: 'Thuế suất', num: true, r: r => `${r.ts}%` },
            { k: 'thue', t: 'Tiền thuế', num: true },
          ]}
          rows={dong}
          sum={{
            stt: `Tổng cộng (${dong.length} dòng)`,
            sl: dong.reduce((a, r) => a + r.sl, 0),
            tien: dong.reduce((a, r) => a + r.tien, 0),
            thue: dong.reduce((a, r) => a + r.thue, 0),
          }}
        />
      )}
      {tab === 'ht' && (
        <div style={{ padding: 14 }}>
          {kieu === 'khong' && <Note kind="gray">Gói Free không hạch toán. Doanh thu vào báo cáo kết quả kinh doanh, tiền mặt vào sổ quỹ.</Note>}
          {kieu === 'so' && (
            <>
              <Note icon="book">{CHE_DO.TT58.soHieu}: ghi vào sổ doanh thu và sổ tiền, không dùng tài khoản.</Note>
              <div style={{ marginTop: 10 }}>
                <Table
                  cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'tien', t: 'Số tiền', num: true }]}
                  rows={rowsSo}
                  sum={{ so: `Tổng cộng (${rowsSo.length} dòng)`, tien: rowsSo.reduce((a, r) => a + r.tien, 0) }}
                />
              </div>
            </>
          )}
          {kieu === 'noco' && (
            <Table
              cols={[{ k: 'dg', t: 'Diễn giải' }, { k: 'no', t: 'TK Nợ', cls: 'code' }, { k: 'co', t: 'TK Có', cls: 'code' }, { k: 'tien', t: 'Số tiền', num: true }]}
              rows={ht}
              sum={{ dg: `Doanh thu ${moneyD(x.dt)} · thuế ${moneyD(x.vat)}`, tien: x.tm + x.ck + x.the + x.app + x.gv }}
            />
          )}
        </div>
      )}
      {tab === 'tt' && (
        <Table
          cols={[{ k: 'ht', t: 'Hình thức' }, { k: 'tien', t: 'Số tiền', num: true }]}
          rows={[
            { ht: 'Tiền mặt', tien: x.tm },
            { ht: 'Chuyển khoản, QR', tien: x.ck },
            { ht: 'Thẻ', tien: x.the },
            { ht: 'GrabFood, ShopeeFood', tien: x.app },
          ]}
          sum={{ ht: 'Tổng', tien: x.tm + x.ck + x.the + x.app }}
        />
      )}
      {tab === 'goc' && (
        <Table
          cols={[{ k: 'ca', t: 'Ca' }, { k: 'gio', t: 'Giờ chốt' }, { k: 'don', t: 'Số đơn', num: true }, { k: 'tn', t: 'Thu ngân' }]}
          rows={[
            { ca: 'Ca sáng', gio: '14:00', don: Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
            { ca: 'Ca tối', gio: '22:30', don: x.don - Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
          ]}
          sum={{ ca: 'Tổng: 2 ca', don: x.don }}
        />
      )}
    </>
  )
}

function ChiTiet({ sc, mod, row }: ScreenProps & { row: Row }) {
  const { s, toast } = useSession()
  const dong0 = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState('ct')
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const x = row.x
  const kieu = kieuGhiSo(s.cheDo)
  // In: bảng kê lấy đúng các món của chứng từ, không sinh dòng giả
  const moIn = () => setPhieuIn([{
    sc, row, cfg: NGOAI_POS,
    dong: dongMon(x.dt).map(d => ({ stt: d.stt, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, tien: d.tien, thue: d.thue, ts: d.ts })),
  }])
  return (
    <FormToanMan icon={mod.icon} onClose={dong0} tong={x.dt + x.vat} title={`Chứng từ bán hàng ${row.so}`}
      meta={<><span className="src">FABi</span><span className="chip">{row.cn}</span><span className="chip">{x.don} đơn POS</span>{kieu !== 'khong' && <span className="chip ok">Đã ghi sổ</span>}</>}
      foot={<>
        <button className="btn" onClick={dong0}>Đóng</button>
        <span className="grow" />
        <button className="btn" onClick={moIn}><Icon n="printer" className="ic sm" />In</button>
        <button className="btn" disabled={!['PL', 'PR'].includes(s.goi)} title={['PL', 'PR'].includes(s.goi) ? '' : 'Xuất hoá đơn điện tử có từ gói Plus'} onClick={() => toast('Đã gửi hoá đơn tổng hợp sang iPOS Invoice')}><Icon n="receipt" className="ic sm" />Xuất hoá đơn</button>
        <button className="btn pri" onClick={() => { toast('Đã lưu'); dong0() }}>Lưu</button>
      </>}>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px', alignItems: 'start' }}>
        <section className="card">
          <div className="tabs">
            {[['ct', 'Hàng bán'], ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'], ['tt', 'Thanh toán'], ['goc', 'Đơn POS gốc']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <NoiDungTab x={x} tab={tab} kieu={kieu} />
          <div className="tot">
            <span>Doanh thu chưa thuế</span><b>{moneyD(x.dt)}</b><span>Thuế GTGT</span><b>{moneyD(x.vat)}</b><span>Tổng thanh toán</span><b className="big">{moneyD(x.dt + x.vat)}</b>
          </div>
        </section>
        <div className="stack">
          <Card title="Thông tin">
            <div className="stack" style={{ gap: 8, fontSize: 13 }}>
              <div className="row"><span className="muted">Ngày</span><span className="grow" />{row.ngay}</div>
              <div className="row"><span className="muted">Chi nhánh</span><span className="grow" />{row.cn}</div>
              <div className="row"><span className="muted">Khách hàng</span><span className="grow" />Khách lẻ POS</div>
              <div className="row"><span className="muted">Đồng bộ lúc</span><span className="grow" />23:30 cùng ngày</div>
            </div>
          </Card>
          {row.tt === 'loi' && <Note kind="err" icon="alert">Doanh thu trên FABi lớn hơn sổ 1.250.000 đ. <Link to="/app/tien-ich/11-7">Mở đối soát</Link></Note>}
        </div>
      </div>
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
    </FormToanMan>
  )
}
