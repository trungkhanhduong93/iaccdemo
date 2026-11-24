// Xuất kho định lượng (T849): mỗi phiếu Xuất bán POS sinh một phiếu xuất kho định lượng,
// T907: chi tiết đầu phiếu 2 nhóm như Xuất bán POS, lưới phẳng nhóm cột Món bán, Hàng hoá, món không xuất được ghi lý do.
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Table, useDoRongCot } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { fold, money, moneyD, soLuong } from '../../ui/format'
import { BoLoc, useCauHinhLoc, useLocNhap, type OLocDef } from '../../ui/LocNangCao'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { NutExcel } from '../../ui/CongCuDs'
import { Select } from '../../ui/Dropdown'
import { useDsPhieuXdl, type LyDoXdl, type PhieuXdl } from './xuat-dinh-luong'
import { CUA_HANG } from '../../data/mock'

// Món đồ uống do quầy bar pha, gói Pro xuất NVL từ kho bar (T915)
const DO_UONG = /cà phê|cafe|trà|sinh tố|nước|bia|soda|sữa|latte|cacao|matcha|đá xay|cocktail|rượu/i

export function XuatDinhLuong({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const rows = useDsPhieuXdl()

  if (id !== undefined) {
    const row = rows.find(r => r.id === id)
    return <ChiTietXuatDinhLuong sc={sc} mod={mod} row={row} />
  }

  return <DanhSachXuatDinhLuong sc={sc} mod={mod} rows={rows} />
}

function DanhSachXuatDinhLuong({ sc, mod, rows }: ScreenProps & { rows: PhieuXdl[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cnChon = cuaHangHienTai(s)

  // Hàng lọc giống Xuất huỷ (T886): kỳ, ô tìm, phễu (cửa hàng), lọc cột; giá trị nháp, bấm Lọc mới áp
  const loc0 = useLocNhap(() => ({ thoiGian: thangMacDinh() as KhoangNgay, tim: '', cn: '' }))
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const doRong = useDoRongCot('xuat-dinh-luong')   // kéo giãn cột như danh sách Xuất bán POS (T907)

  const dsCn = useMemo(() => [...new Set(rows.map(r => r.cn))].sort(), [rows])
  const kieuCot = (k: string): KieuLoc => (k === 'ngay' ? 'ngay' : k === 'tong' ? 'so' : 'chon')
  const giaTri = (r: PhieuXdl, k: string): unknown => (k === 'thamChieu' ? r.posSo : (r as unknown as Row)[k])

  const rowsLoc = useMemo(() => {
    return rows.filter(r => {
      if (!trongKhoang(docNgay(r.ngay), ap.thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (ap.cn && r.cn !== ap.cn) return false
      if (ap.tim.trim()) {
        const kw = fold(ap.tim.trim())
        const text = fold(`${r.so} ${r.maHd} ${r.posSo} ${r.ghiChu} ${r.cn} ${r.nguon} ${r.dong.map(m => m.ten).join(' ')}`)
        if (!text.includes(kw)) return false
      }
      for (const [k, g] of Object.entries(locCot)) {
        const v = giaTri(r, k)
        if (dangLoc(g) && !khopLoc(kieuCot(k), g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''), typeof v === 'number' ? v : undefined,
          k === 'ngay' ? docNgay(r.ngay) : undefined)) return false
      }
      return true
    })
  }, [rows, ap, cnChon, locCot])   // eslint-disable-line react-hooks/exhaustive-deps
  const layLuaChon = (k: string) => dsGiaTri(rows, r => String(giaTri(r, k) ?? ''))

  const apLoc = () => { loc0.loc(); setTrang(1) }
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', coGiaTri: true, o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số phiếu, mã hoá đơn, tham chiếu, món" aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    ...(!cnChon && dsCn.length > 1 ? [{ k: 'cn', ten: 'Cửa hàng', coGiaTri: Boolean(nhap.cn), o: (
      <Select className="ds-o-sel" value={nhap.cn} aria-label="Cửa hàng" onChange={e => dat('cn', e.target.value)}>
        <option value="">Tất cả</option>
        {dsCn.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
    ) }] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim'])

  const batDau = (trang - 1) * coTrang
  const rowsTrang = rowsLoc.slice(batDau, batDau + coTrang)

  const cols: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    { k: 'ngay', t: 'Ngày', w: 110 },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 125,
      r: (r: Row) => (
        <button
          type="button"
          className="ds-link-so"
          title="Mở chi tiết phiếu xuất kho định lượng"
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {r.so}
        </button>
      ),
    },
    // Mã hoá đơn FABi: # và 5 ký tự cuối, rê chuột xem đủ (QD114)
    { k: 'maHd', t: 'Mã hoá đơn', cls: 'code', w: 95, r: r => <span title={String(r.maHd)}>#{String(r.maHd).slice(-5)}</span> },
    ...(cnChon ? [] : [{ k: 'cn', t: 'Cửa hàng', w: 140 } as Col]),
    {
      k: 'thamChieu',
      t: 'Tham chiếu',
      cls: 'code',
      w: 120,
      r: (r: Row) => (
        <Link
          to={`/app/ban-hang/3-1-1/${r.posId}`}
          className="ds-link-so"
          title="Mở chứng từ Xuất bán POS"
          onClick={e => e.stopPropagation()}
        >
          {r.posSo}
        </Link>
      ),
    },
    { k: 'ghiChu', t: 'Ghi chú', w: 200, wCung: true, cls: 'xdl-cat', r: r => <span title={String(r.ghiChu)}>{String(r.ghiChu)}</span> },
    { k: 'ngayTao', t: 'Ngày tạo', w: 130 },
    { k: 'nguoiTao', t: 'Người tạo', w: 95 },
    {
      k: 'nguon',
      t: 'Nguồn',
      w: 75,
      r: (r: Row) => <span className="chip info">{String(r.nguon ?? 'Xuất bán POS')}</span>,
    },
    { k: 'tong', t: 'Tổng tiền', num: true, w: 115, dinh: 'phai' },
  ]

  const rowsBang: Row[] = rowsTrang.map((r, i) => ({
    ...r,
    stt: batDau + i + 1,
    thamChieu: r.posSo,
  }))

  const tongTien = rowsLoc.reduce((a, r) => a + r.tong, 0)

  return (
    <div className="page page-voucher page-dm xdl-page">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-toolbar-figma">
            <BoLoc
              ds={oLoc}
              cauHinh={cauHinhLoc}
              datCauHinh={datCauHinhLoc}
              dangLoc={loc0.dangLoc}
              khacNhap={loc0.khacNhap}
              onLoc={apLoc}
              onXoaHet={loc0.xoaNhap}
              chiNutPheu
              ngoaiRieng={{
                tim: (
                  <div key="tim" className="ds-tim-figma">
                    <IconFigmaSearch size={16} />
                    <input
                      value={nhap.tim}
                      placeholder="Số phiếu, mã hoá đơn, tham chiếu, món"
                      title="Tìm theo số phiếu, mã hoá đơn, tham chiếu, món"
                      aria-label="Tìm kiếm"
                      onChange={e => dat('tim', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') apLoc()
                      }}
                    />
                  </div>
                ),
              }}
            />
            <div className="ds-toolbar-phai">
              <NutExcel onXuat={() => toast(`Đã xuất ${rowsLoc.length} phiếu ra Excel`)} />
            </div>
          </div>
          <Table
            cols={cols}
            rows={rowsBang}
            onRow={r => nav(`${path}/${r.id}`)}
            doRong={doRong}
            loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt']), kieu: c => kieuCot(c.k), layLuaChon }}
            sum={{ ngay: 'Tổng cộng', tong: tongTien }}
          />
          <PhanTrang trang={trang} tong={rowsLoc.length} coTrang={coTrang} onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
        </section>
      </div>
    </div>
  )
}

/** Tên ngắn của lý do cho dải cảnh báo, nút ở cột Xử lý (T907) */
const LY_DO: Record<LyDoXdl['loai'], { ngan: string; nut: string }> = {
  1: { ngan: 'Chưa có công thức', nut: 'Tạo công thức' },
  2: { ngan: 'Chưa khớp mã hàng', nut: 'Khớp mã hàng' },
  3: { ngan: 'Thiếu ĐVT', nut: 'Thêm ĐVT' },
  4: { ngan: 'Công thức ngừng áp dụng', nut: 'Mở công thức' },
  5: { ngan: 'Thiếu giá vốn', nut: 'Tính giá vốn' },
}

function ChiTietXuatDinhLuong({ sc, mod, row }: ScreenProps & { row?: PhieuXdl }) {
  const { s } = useSession()
  const nav = useNavigate()
  const dongForm = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState<'ct' | 'ht'>('ct')
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const doRong = useDoRongCot('xuat-dinh-luong-ct')   // kéo giãn cột, kéo rộng Ghi chú xem đủ (T913)

  // Lưới phẳng như mẫu Chi tiết tiêu hao: mỗi dòng một NVL của một món, phần Món bán lặp lại để lọc từng cột đúng
  // Kho xuất (T915): Standard, Plus một kho chính theo cửa hàng; Pro tách kho bar cho đồ uống, kho bếp cho món còn lại
  const ch = CUA_HANG.find(c => c.ten === row?.cn)
  const khoCua = (tenMon: string) => {
    if (s.goi !== 'PR') return `Kho ${ch?.ngan ?? row?.cn ?? ''}`
    const bar = DO_UONG.test(tenMon) ? ch?.kho.find(k => k.startsWith('Kho bar')) : undefined
    return bar ?? ch?.kho[0] ?? ''
  }
  const dongLuoi = useMemo<Row[]>(() => (row?.dong ?? []).flatMap((m, i) => {
    const mon = { _mon: i, maCt: m.maCt ?? '', _ctId: m.ctId, tenMon: m.ten, maMon: m.maFabi ? `FABi: ${m.maFabi}` : m.ma, dvtMon: m.dvt, slMon: m.sl, giaMon: m.gia, tienMon: m.tien }
    if (!m.nvl.length) return [{ ...mon, id: `${i}`, ghiChu: m.lyDo?.text ?? '', _lyDo: m.lyDo }]
    const khoXuat = khoCua(m.ten)
    return m.nvl.map((n, j) => ({ ...mon, id: `${i}-${j}`, tenNvl: n.ten, maNvl: n.ma, dvtNvl: n.dvt, slNvl: n.sl, giaNvl: n.gia, tienNvl: n.tien, khoXuat, ghiChu: n.lyDo?.text ?? '', _lyDo: n.lyDo }))
  }), [row, s.goi])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!row) {
    return (
      <FormToanMan icon={mod.icon} iconNet xem onClose={dongForm} title="Xuất kho định lượng" foot={<button type="button" className="btn" onClick={dongForm}>Đóng</button>}>
        <div className="p-4 dim">Không tìm thấy phiếu xuất kho định lượng.</div>
      </FormToanMan>
    )
  }

  const isPro = s.goi === 'PR'
  const congThuc = s.goi === 'PL' ? '/app/danh-muc/cong-thuc-che-bien' : '/app/kho/9-1-3'   // gói Plus xem công thức ở Danh mục (T719)
  const diSua: Record<LyDoXdl['loai'], string> = { 1: congThuc, 2: '/app/danh-muc/1-2', 3: '/app/danh-muc/1-4', 4: congThuc, 5: '/app/kho/5-1-7' }

  const kieuCot = (k: string): KieuLoc => (/^(sl|gia|tien)/.test(k) ? 'so' : 'chon')
  const rowsLoc = dongLuoi.filter(r => Object.entries(locCot).every(([k, g]) => {
    const v = r[k]
    return !dangLoc(g) || khopLoc(kieuCot(k), g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''), typeof v === 'number' ? v : undefined)
  }))
  const rowsBang = rowsLoc.map((r, i) => ({ ...r, stt: i + 1 }))

  // Tổng: món bán cộng mỗi món một lần vì phần Món bán lặp theo dòng NVL
  const daDem = new Set<unknown>()
  const tong = { slMon: 0, tienMon: 0, slNvl: 0, tienNvl: 0 }
  for (const r of rowsLoc) {
    if (!daDem.has(r._mon)) { daDem.add(r._mon); tong.slMon += Number(r.slMon); tong.tienMon += Number(r.tienMon) }
    tong.slNvl += Number(r.slNvl ?? 0)
    tong.tienNvl += Number(r.tienNvl ?? 0)
  }

  // Dải cảnh báo: đếm món theo lý do; lý do 5 nằm ở dòng NVL nên đếm món có NVL thiếu giá
  const demLyDo = new Map<LyDoXdl['loai'], number>()
  for (const m of row.dong) {
    const loai = m.lyDo?.loai ?? (m.nvl.some(n => n.lyDo) ? 5 : undefined)
    if (loai) demLyDo.set(loai, (demLyDo.get(loai) ?? 0) + 1)
  }
  const monLoi = row.dong.filter(m => m.lyDo).length

  const tenMa = (ten: unknown, ma: unknown) => <>{String(ten)} <small className="code dim">{String(ma)}</small></>
  const soHoacTrong = (v: unknown) => (typeof v === 'number' ? money(v) : '')
  const cols: Col[] = [
    { k: 'stt', t: '#', w: 45, cls: 'dim' },
    // Hàng hoá bên trái, Món bán bên phải (T915); dòng tổng ghi nhãn ở cột Tên hàng hoá
    { k: 'tenNvl', t: 'Tên', nhom: 'Hàng hoá', w: 180, r: r => r.maNvl ? tenMa(r.tenNvl, r.maNvl) : String(r.tenNvl ?? '') },
    { k: 'dvtNvl', t: 'ĐVT', nhom: 'Hàng hoá', c: true, w: 60 },
    { k: 'slNvl', t: 'Số lượng', nhom: 'Hàng hoá', num: true, w: 85, r: r => typeof r.slNvl === 'number' ? soLuong(r.slNvl) : '' },
    { k: 'giaNvl', t: 'Đơn giá', nhom: 'Hàng hoá', num: true, w: 90, r: r => soHoacTrong(r.giaNvl) },
    { k: 'tienNvl', t: 'Tổng', nhom: 'Hàng hoá', num: true, w: 100, r: r => soHoacTrong(r.tienNvl) },
    { k: 'khoXuat', t: 'Kho xuất', nhom: 'Hàng hoá', w: 140 },
    {
      k: 'ghiChu', t: 'Ghi chú', nhom: 'Hàng hoá', w: 200, wCung: true, cls: 'xdl-cat',
      r: r => r.ghiChu ? <span className={(r._lyDo as LyDoXdl).loai === 5 ? 'xdl-nhac' : 'xdl-loi'} title={String(r.ghiChu)}>{String(r.ghiChu)}</span> : '',
    },
    {
      k: 'xuLy', t: 'Xử lý', nhom: 'Hàng hoá', w: 110,
      r: r => {
        const ld = r._lyDo as LyDoXdl | undefined
        return ld ? <button type="button" className="ds-link-so" onClick={e => { e.stopPropagation(); nav(diSua[ld.loai]) }}>{LY_DO[ld.loai].nut}</button> : ''
      },
    },
    {
      k: 'maCt', t: 'Mã công thức', nhom: 'Món bán', w: 100, cls: 'code',
      // Bấm mã mở công thức chế biến đó (T908)
      r: r => r._ctId ? <button type="button" className="ds-link-so" title="Mở công thức chế biến" onClick={e => { e.stopPropagation(); nav(`${congThuc}/${String(r._ctId)}`) }}>{String(r.maCt)}</button>
        : r.tenMon ? <span className="dim">—</span> : String(r.maCt ?? ''),   // dòng tổng: nhãn "Tổng cộng" không phải link
    },
    { k: 'tenMon', t: 'Tên', nhom: 'Món bán', w: 180, r: r => r.tenMon ? tenMa(r.tenMon, r.maMon) : '' },
    { k: 'dvtMon', t: 'ĐVT', nhom: 'Món bán', c: true, w: 60 },
    { k: 'slMon', t: 'Số lượng', nhom: 'Món bán', num: true, w: 85, r: r => typeof r.slMon === 'number' ? soLuong(r.slMon) : '' },
    { k: 'giaMon', t: 'Đơn giá', nhom: 'Món bán', num: true, w: 90 },
    { k: 'tienMon', t: 'Thành tiền', nhom: 'Món bán', num: true, w: 100 },
  ]

  return (
    <FormToanMan
      icon={mod.icon}
      iconNet
      xem
      onClose={dongForm}
      title="Xuất kho định lượng"
      giua={<span className="fsf-tt xem">Phiếu <b>{row.so}</b></span>}
      meta={
        <>
          <span className="chip ok">Đã xuất kho</span>
          <span className="src">{row.nguon}</span>
          <span className="chip info"><Icon n="cuahang" className="ic sm" />{row.cn}</span>
          {monLoi > 0 && <span className="chip warn">{monLoi} món chưa xuất</span>}
        </>
      }
      footClass="fsf-f-xem"
      foot={
        <>
          <div className="xp-footer-trai">
            <button type="button" className="xp-btn-in" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C13.687 12 13.3333 12 13.3333 12H12" />
                <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
                <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
              </svg>
              <span>In phiếu</span>
            </button>
          </div>
          <div className="fsf-tong">
            <small>Tổng tiền vốn:</small><b>{moneyD(row.tong)}</b>
          </div>
        </>
      }
    >
      <div className="stack" style={{ gap: 14 }}>
        <p className="pos-nhac" style={{ margin: 0 }}>
          <Icon n="info" className="ic sm" />
          Phiếu sinh tự động từ chứng từ Xuất bán POS. Chỉ xem, không sửa hay xoá.
        </p>

        {/* Đầu phiếu 2 nhóm kiểu nhãn trái ô phải như Xuất bán POS (T637, T641); nhãn ô thứ hai cố định để các ô thẳng cột */}
        <section className="xp637-dau xdl-dau">
          <div className="xp637-nhom">
            <div className="xp637-tieu">ĐƠN HÀNG POS</div>
            <div className="xp637-ds">
              <div className="xp637-o">
                <span className="xp637-nhan">Mã hoá đơn</span>
                <div className="xp637-tri"><span className="xp637-code">{row.maHd}</span></div>
              </div>
              <div className="xp637-cap">
                <div className="xp637-o">
                  <span className="xp637-nhan">Số đơn POS</span>
                  <div className="xp637-tri"><span className="xp637-code">{row.soDon}</span></div>
                </div>
                <div className="xp637-o xp637-o-phu">
                  <span className="xp637-nhan">Kênh bán</span>
                  <div className="xp637-tri"><span title={row.kenh}>{row.kenh}</span></div>
                </div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Tham chiếu</span>
                <div className="xp637-tri">
                  <Link to={`/app/ban-hang/3-1-1/${row.posId}`} className="ds-link-so" title="Mở chứng từ Xuất bán POS">{row.posSo}</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="xp637-nhom">
            <div className="xp637-tieu">PHIẾU XUẤT KHO</div>
            <div className="xp637-ds">
              <div className="xp637-cap">
                <div className="xp637-o">
                  <span className="xp637-nhan">Số chứng từ</span>
                  <div className="xp637-tri"><span className="xp637-code">{row.so}</span></div>
                </div>
                <div className="xp637-o xp637-o-phu">
                  <span className="xp637-nhan">Ngày xuất</span>
                  <div className="xp637-tri"><span>{row.ngay}</span></div>
                </div>
              </div>
              {/* Cửa hàng đã có ở chip góc trên phải nên bỏ ô ở đây (T915) */}
              <div className="xp637-o">
                <span className="xp637-nhan">Nguồn</span>
                <div className="xp637-tri"><span>{row.nguon} · {row.nguoiTao}</span></div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Ghi chú</span>
                <div className="xp637-tri"><span title={row.ghiChu}>{row.ghiChu}</span></div>
              </div>
            </div>
          </div>
        </section>

        {isPro && (
          <div className="xdl-tabs">
            <button type="button" className={`xdl-tab${tab === 'ct' ? ' on' : ''}`} onClick={() => setTab('ct')}>
              Chi tiết xuất kho ({row.dong.length} món)
            </button>
            <button type="button" className={`xdl-tab${tab === 'ht' ? ' on' : ''}`} onClick={() => setTab('ht')}>
              Hạch toán
            </button>
          </div>
        )}

        {tab === 'ct' && (
          <div className="card xdl-luoi" style={{ padding: 0, overflow: 'auto' }}>
            {demLyDo.size > 0 && (
              <div className="xdl-canh-bao">
                <b>{monLoi}/{row.dong.length} món chưa trừ được nguyên vật liệu.</b>
                {[...demLyDo].sort((a, b) => a[0] - b[0]).map(([loai, n]) => (
                  <span key={loai} className={loai === 5 ? 'xdl-nhac' : 'xdl-loi'}>{LY_DO[loai].ngan}: {n}</span>
                ))}
              </div>
            )}
            <Table
              cols={cols}
              rows={rowsBang}
              rowCls={r => (r._lyDo ? 'xdl-dong-loi' : '')}
              doRong={doRong}
              loc={{ gt: locCot, dat: (k, g) => setLocCot(x => ({ ...x, [k]: g })), bo: new Set(['stt', 'xuLy']), kieu: c => kieuCot(c.k), layLuaChon: k => dsGiaTri(dongLuoi, r => String(r[k] ?? '')) }}
              sum={{ tenNvl: 'Tổng cộng', ...tong }}
            />
          </div>
        )}

        {tab === 'ht' && isPro && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Diễn giải</th>
                  <th style={{ width: 120 }}>TK Nợ</th>
                  <th style={{ width: 120 }}>TK Có</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dim">1</td>
                  <td>Giá vốn xuất bán theo định lượng</td>
                  <td className="code">632</td>
                  <td className="code">152</td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><b>Tổng cộng</b></td>
                  <td style={{ textAlign: 'right' }}><b>{money(row.tong)}</b></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </FormToanMan>
  )
}
