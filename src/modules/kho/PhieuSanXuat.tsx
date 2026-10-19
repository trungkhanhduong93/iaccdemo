// Danh sách phiếu xuất, nhập sơ chế và xuất, nhập chế biến theo iPOS Inventory (T152).
// Chip trạng thái Chờ nhập, Đã nhập, Đã huỷ; lọc Thời gian, mã phiếu, kho; cột như IVT. Form phiếu dùng form chứng từ chung
// Danh sách dùng chung cho phiếu điều chuyển, chuyển kho (T155): cột, chip, dải giải thích khai qua KieuDs
import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { Table } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { fold, money } from '../../ui/format'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
import { ChungTuForm } from '../../ui/generic/ChungTuForm'
import { useDsPhieuSx } from './BangSanXuat'
import { SX } from './san-xuat'

/** Dải giải thích đầu màn sản xuất, đóng được, nhớ trên máy người dùng */
export function DaiGiaiThich({ soChe }: { soChe: boolean }) {
  const khoa = `iacc-sx-giai-thich:${soChe ? 'so-che' : 'che-bien'}`
  const [mo, setMo] = useState(() => { try { return localStorage.getItem(khoa) !== 'dong' } catch { return true } })
  const [viDu, setViDu] = useState(false)
  if (!mo) return null
  const dong = () => { setMo(false); try { localStorage.setItem(khoa, 'dong') } catch { /* trình duyệt chặn lưu thì chỉ đóng trong phiên */ } }
  return (
    <div className="sx-giai" role="note">
      <Icon n="info" className="ic sm" />
      <div className="sx-giai-nd">
        {soChe ? <>
          <b>Sơ chế là tách: một nguyên liệu ra nhiều mã hàng</b>
          <span>Bạn đang ở Sơ chế. Phiếu gộp nhiều nguyên liệu thành một thành phẩm thì lập ở Chế biến.</span>
          {viDu && <span className="sx-giai-vd">Ví dụ: xuất 25 kg thịt bò nguyên tảng. Theo công thức sơ chế, nhập lại 11,25 kg thăn, 5 kg gầu, 3,75 kg nạm, 3 kg xương ống.</span>}
        </> : <>
          <b>Chế biến là gộp: nhiều nguyên liệu ra một thành phẩm</b>
          <span>Bạn đang ở Chế biến. Phiếu tách một nguyên liệu ra nhiều mã hàng thì lập ở Sơ chế.</span>
          {viDu && <span className="sx-giai-vd">Ví dụ: xuất xương ống, nạm bò, quế hồi, hành tím theo công thức cho 200 lít, nhập lại 200 lít nước dùng phở.</span>}
        </>}
      </div>
      <button type="button" className="btn sm" onClick={() => setViDu(v => !v)}>{viDu ? 'Ẩn ví dụ' : 'Xem ví dụ'}</button>
      <button type="button" className="icon-btn sm" title="Đóng giải thích" aria-label="Đóng giải thích" onClick={dong}><Icon n="x" className="ic sm" /></button>
    </div>
  )
}

export function PhieuSanXuat({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher!
  const loai = cfg.sanXuat!
  const rows = useDsPhieuSx(loai)
  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} />
  }
  const t = SX[loai]
  const nhanKho = t.nhap ? 'Kho nhập' : 'Kho xuất'
  const kieu: KieuDs = {
    ten: t.ten, nhap: t.nhap, manDoi: SX[t.doi!].man, chips: t.nhap ? ['da', 'huy'] : ['cho', 'da', 'huy'], nhanKho, coTien: true,
    dai: <DaiGiaiThich soChe={t.soChe} />,
    cot: [
      { k: 'kho', t: nhanKho, w: 170 },
      { k: 'ngay', t: t.nhap ? 'Thời gian nhập' : 'Thời gian xuất', w: 140 },
      { k: 'ghiChu', t: 'Ghi chú' },
      { k: 'ngayTao', t: 'Ngày tạo', w: 140 },
      { k: 'nguoiTao', t: 'Người tạo', w: 140 },
      { k: 'ngayCapNhat', t: 'Ngày cập nhật', w: 140 },
      { k: 'nguoiCapNhat', t: 'Người cập nhật', w: 140 },
    ],
  }
  return <DsPhieuTc sc={sc} mod={mod} kieu={kieu} rows={rows} />
}

/** Cấu hình danh sách phiếu có tham chiếu xuất, nhập (T155) */
export interface KieuDs {
  ten: string; nhap: boolean
  manDoi?: string            // màn của phiếu đối ứng; có thì hiện cột Tham chiếu
  chips?: string[]           // trạng thái trên chip; không khai thì không có chip
  nhanKho: string            // nhãn ô lọc kho (lọc theo kho ghi trên phiếu)
  cot: Col[]                 // cột giữa Tham chiếu và Tổng tiền
  coTien: boolean            // cột Tổng tiền
  dai?: ReactNode            // dải giải thích đầu màn
}

interface GtLoc { thoiGian: KhoangNgay; tim: string; kho: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangNay(), tim: '', kho: '' })
const COT_CO_DINH = new Set(['stt', 'so'])
const MAU_TT: Record<string, [string, string]> = { cho: ['Chờ nhập', 'var(--amber)'], da: ['Đã nhập', 'var(--green)'], huy: ['Đã huỷ', 'var(--red)'] }


export function DsPhieuTc({ sc, mod, kieu: t, rows: rowsGoc }: ScreenProps & { kieu: KieuDs; rows: Row[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cnChon = cuaHangHienTai(s)
  const [chip, setChip] = useState(t.chips ? (t.nhap ? 'da' : 'cho') : '')
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const [activeId, setActiveId] = useState('')
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const nhanKho = t.nhanKho

  // Cột hiện: kho, ghi chú, tham chiếu (phiếu nhập: phiếu xuất gốc; phiếu xuất: phiếu nhập đã lập), người, ngày cập nhật
  const rows: Row[] = rowsGoc.map(r => {
    const pn = r._phieuNhap as { id: string; so: string } | undefined
    return {
      ...r, kho: String(r._kho ?? ''), khoNhan: String(r._khoNhan ?? ''), khoXuat: String(r._khoXuat ?? ''), cnNhan: String(r._cnNhan ?? ''), cnXuat: String(r._cnXuat ?? ''), ghiChu: String(r._ghiChu ?? r.dienGiai ?? ''),
      thamChieu: t.nhap ? String(r._thamChieu ?? '') : pn?.so ?? '', _tcId: t.nhap ? String(r._thamChieuId ?? '') : pn?.id ?? '',
      ngayTao: String(r._ngayTao ?? ''), nguoiTao: String(r._nguoiTao ?? ''), ngayCapNhat: String(r._ngayCapNhat ?? ''), nguoiCapNhat: String(r._nguoiCapNhat ?? ''),
    }
  })
  const dsKho = [...new Set(rows.map(r => r.kho).filter(Boolean))].sort()
  const kieuCot = (k: string): KieuLoc => (k === 'ngay' ? 'ngay' : k === 'tong' ? 'so' : 'chon')   // cột chữ lọc kiểu chọn (T466)

  const apLoc = () => { loc0.loc(); setTrang(1) }
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', o: <input className="ds-o-inp" value={nhap.tim} placeholder="Nhập mã phiếu" aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    { k: 'kho', ten: nhanKho, o: (
      <Select className="ds-o-sel" value={nhap.kho} aria-label={nhanKho} onChange={e => dat('kho', e.target.value)}>
        <option value="">Tất cả</option>
        {dsKho.map(k => <option key={k} value={k}>{k}</option>)}
      </Select>
    ) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'kho'])

  // Lọc theo ô đã áp dụng, cửa hàng trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const truocChip = rows.filter(r => {
    if (!trongKhoang(docNgay(String(r.ngay).split(' ')[0]), ap.thoiGian)) return false
    if (cnChon && r.cn !== cnChon.ten) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.thamChieu}`).includes(fold(ap.tim.trim()))) return false
    if (ap.kho && r.kho !== ap.kho) return false
    for (const [k, g] of Object.entries(locCot)) {
      const v = r[k]
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? ''), typeof v === 'number' ? v : undefined,
        k === 'ngay' ? docNgay(String(r.ngay).split(' ')[0]) : undefined)) return false
    }
    return true
  })
  const chips: Chip[] = (t.chips ?? []).map(k => ({ k, ten: MAU_TT[k][0], mau: MAU_TT[k][1], so: truocChip.filter(r => r.ttSx === k).length }))
  const list = chip ? truocChip.filter(r => r.ttSx === chip) : truocChip
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHt = Math.min(trang, soTrang)
  const batDau = (trangHt - 1) * coTrang
  const rowsTrang = list.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  const tongTien = (ds: Row[]) => ds.reduce((a, r) => a + (Number(r.tong) || 0), 0)

  const moPhieu = (r: Row) => nav(`${path}/${r.id}`)
  const cols: Col[] = [
    { k: 'stt', t: '#', w: 56, c: true, dinh: 'trai' },
    { k: 'so', t: 'Mã phiếu', w: 140, dinh: 'trai', r: r => (
      <button type="button" className="ds-link-so" onClick={e => { e.stopPropagation(); moPhieu(r) }}>{r.so}</button>
    ) },
    ...(t.manDoi ? [{ k: 'thamChieu', t: 'Tham chiếu', w: 140, r: (r: Row) => r._tcId
      ? <Link className="ds-link-so" to={`/app/${t.manDoi}/${r._tcId}`} onClick={e => e.stopPropagation()}>{r.thamChieu}</Link> : '' }] : []),
    ...t.cot,
    ...(t.coTien ? [{ k: 'tong', t: 'Tổng tiền', num: true, w: 130, dinh: 'phai' as const }] : []),   // cố định bên phải (T239)
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)
  const layLuaChon = (k: string) => dsGiaTri(rows, r => String(r[k] ?? ''))   // chỉ tính khi mở ô lọc (T466)

  return (
    <div className="page page-voucher page-dm">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      {t.dai}
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-thanh">
            {t.chips && <ChipTrangThai ds={chips} chon={chip} onChon={k => { setChip(c => (c === k ? '' : k)); setTrang(1) }} />}
            <div className="ds-thanh-phai">
              <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
                onLoc={apLoc} onXoaHet={loc0.xoaNhap} />
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
              <NutExcel onNhap={() => toast(`Nhập phiếu ${t.ten.toLowerCase()} từ Excel`)} onXuat={() => toast(`Đã xuất ${list.length} phiếu ra Excel`)} />
              <NutThemMoiSplit toMoi={`${path}/moi`} />
            </div>
          </div>
          {list.length ? <>
            <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} motDong keDoc
              loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt']), kieu: c => kieuCot(c.k), layLuaChon }}
              onRow={r => setActiveId(String(r.id))} onDbl={moPhieu}
              rowCls={r => [r.id === activeId ? 'dang-chon' : '', r.ttSx === 'huy' ? 'sx-huy' : ''].filter(Boolean).join(' ')}
              sum={{ stt: `Tổng: ${rowsTrang.length}`, ...(t.coTien ? { tong: tongTien(rowsTrang) } : {}) }} />
            <PhanTrang tong={list.length} tongCong={t.coTien ? { tong: tongTien(list) } : undefined} trang={trangHt} coTrang={coTrang}
              onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
          </> : (
            <div className="empty">
              <b>Không có phiếu khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={() => { loc0.xoaHet(); setChip(''); setLocCot({}); setTrang(1) }}>Xoá bộ lọc</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
