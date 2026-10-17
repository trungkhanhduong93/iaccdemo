// Công nợ nhà cung cấp, Công nợ khách hàng theo mẫu iFaster (T185): mỗi đối tượng một dòng Nợ đầu kỳ (I), Tiền mua/bán hàng (II), Tiền trả hàng (III),
// Tiền thanh toán (IV), Nợ cuối kỳ (V = I+II-III-IV). Bấm tên đối tượng mở popup Lịch sử công nợ; số liệu dòng tổng hợp cộng từ chính các phiếu trong lịch sử
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Col, Row } from '../types'
import { CUA_HANG, KHACH, NCC } from '../../data/mock'
import { between, k, pad, rng } from '../../ui/format'
import { Icon } from '../../ui/Icon'
import { Table } from '../../ui/Table'
import { ganMoPhieu } from '../../ui/generic/SoChungTu'
import { chungTu } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'

type Loai = 'ncc' | 'kh'
interface PhieuCn { ngay: string; kho: string; so: string; ghiChu: string; dienGiai: string; ps: number; tra: number; tt: number }

const NHAN: Record<Loai, { doiTuong: string; ps: string; tienPs: string }> = {
  ncc: { doiTuong: 'Nhà cung cấp', ps: 'Mua hàng', tienPs: 'Tiền mua hàng' },
  kh: { doiTuong: 'Khách hàng', ps: 'Bán hàng', tienPs: 'Tiền bán hàng' },
}
const dsDoiTuong = (loai: Loai) => (loai === 'ncc' ? NCC : KHACH.filter(x => x.ma !== 'KL'))

/** Phiếu mua hàng 4.1.1 của nhà cung cấp trong tháng, theo cửa hàng (T307): tiền mua hàng của công nợ NCC lấy đúng tổng tiền phiếu (gồm thuế GTGT),
 *  để mua nợ không vượt tổng nhập và khớp trang chủ, danh sách mua. Tháng chưa có phiếu mẫu thì trả về null, công nợ sinh số mẫu như cũ */
function phieuMuaNcc(ma: string, thang: number, cnTen: string): PhieuCn[] | null {
  const tatCa = chungTu(PHIEU_MUA, '4.1.1')
  if (!tatCa.some(x => Number(x.thang) === thang)) return null
  return tatCa.filter(x => Number(x.thang) === thang && x.cn === cnTen && x.maDt === ma).map(x => ({
    ngay: String(x.ngay), kho: cnTen, so: String(x.so), ghiChu: '', dienGiai: String(x.dienGiai || `Mua hàng ${cnTen}`), ps: Number(x.tong) || 0, tra: 0, tt: 0,
  }))
}

/** Nợ đầu kỳ và các phiếu phát sinh trong tháng của một đối tượng, theo cửa hàng chọn trên thanh trên (tên cửa hàng, thiếu là tất cả) */
function soLieu(loai: Loai, ma: string, thang: number, cnTen?: string) {
  const dsCn = CUA_HANG.filter(c => !cnTen || c.ten === cnTen)
  let dau = 0
  const dauTheoCn: Record<string, number> = {}   // T308: nợ đầu kỳ từng cửa hàng, để tách dòng cửa hàng dưới nhà cung cấp
  const phieu: PhieuCn[] = []
  for (const c of dsCn) {
    const r = rng(`cn-${loai}-${ma}-${c.id}-${thang}`)
    const dauCn = k(between(r, 0, loai === 'ncc' ? 60e6 : 25e6) / dsCn.length)
    dau += dauCn
    dauTheoCn[c.ten] = dauCn
    // NCC (T307): mua hàng lấy từ phiếu mua thật; phiếu mẫu chỉ còn trả hàng, thanh toán, tổng không vượt số đang nợ
    const muaThat = loai === 'ncc' ? phieuMuaNcc(ma, thang, c.ten) : null
    const ngayToiDa = muaThat ? Math.max(2, ...muaThat.map(x => Number(x.ngay.slice(0, 2)) || 2)) : 27
    if (muaThat) phieu.push(...muaThat)
    let conNo = dauCn + (muaThat ?? []).reduce((a, x) => a + x.ps, 0)
    const soPhieu = Math.floor(between(r, 0, 4))
    for (let i = 0; i < soPhieu; i++) {
      const ngay = 2 + Math.floor(between(r, 0, ngayToiDa - 1))
      const kieu = muaThat ? 0.55 + r() * 0.45 : r()
      const tien = k(between(r, 1.5e6, loai === 'ncc' ? 38e6 : 18e6))
      if (muaThat) {
        const tra = kieu < 0.65 ? Math.min(k(tien * 0.2), conNo) : 0
        const tt = kieu >= 0.65 ? Math.min(tien, k(conNo * 0.8)) : 0
        if (tra + tt <= 0) continue
        conNo -= tra + tt
        phieu.push({
          ngay: `${pad(ngay)}/${pad(thang)}/2026`, kho: c.ten, so: tra ? 'TLN' : 'PC', ghiChu: '',
          dienGiai: tra ? 'Trả lại hàng' : 'Thanh toán nhà cung cấp', ps: 0, tra, tt,
        })
        continue
      }
      const ps = kieu < 0.55 ? tien : 0
      const tra = kieu >= 0.55 && kieu < 0.65 ? k(tien * 0.2) : 0
      const tt = kieu >= 0.65 ? tien : 0
      const tienTo = ps ? (loai === 'ncc' ? 'MH' : 'BH') : tra ? (loai === 'ncc' ? 'TLN' : 'TL') : (loai === 'ncc' ? 'PC' : 'PT')
      phieu.push({
        ngay: `${pad(ngay)}/${pad(thang)}/2026`, kho: c.ten, so: tienTo,
        ghiChu: '', dienGiai: ps ? `${NHAN[loai].ps} ${c.ngan}` : tra ? 'Trả lại hàng' : loai === 'ncc' ? 'Thanh toán nhà cung cấp' : 'Khách hàng thanh toán',
        ps, tra, tt,
      })
    }
  }
  phieu.sort((a, b) => a.ngay.localeCompare(b.ngay))
  // Số chứng từ đánh theo thứ tự ngày, riêng từng loại phiếu, mã đối tượng làm hạt để hai đối tượng không trùng số
  const dem: Record<string, number> = {}
  const goc = Number(ma.replace(/\D/g, '')) * 7
  for (const p of phieu) { if (p.so.includes('-')) continue; dem[p.so] = (dem[p.so] ?? goc) + 1; p.so = `${p.so}26${pad(thang)}-${pad(dem[p.so], 4)}` }
  return { dau, phieu, dauTheoCn }
}

/** Phần của một cửa hàng trong số liệu tất cả cửa hàng (T308): cộng các cửa hàng ra đúng dòng nhà cung cấp */
function soLieuCuaHang(loai: Loai, ma: string, thang: number, cn: string) {
  const all = soLieu(loai, ma, thang)
  return { dau: all.dauTheoCn[cn] ?? 0, phieu: all.phieu.filter(p => p.kho === cn) }
}

/** Tên đối tượng bấm được, mở popup Lịch sử công nợ cùng kỳ, cùng cửa hàng */
function TenDoiTuong({ x }: { x: Row }) {
  const [mo, setMo] = useState(false)
  return <>
    <button type="button" className="bc-mo-so cn-ten" onClick={() => setMo(true)}>{x.ten}</button>
    <span className="muted"> · {x.ma}</span>
    {mo && <LichSuCongNo loai={x._loai} ma={x.ma} ten={x.ten} thang={x._thang} cnTen={x._cn} onDong={() => setMo(false)} />}
  </>
}

/** Dòng cửa hàng dưới nhà cung cấp (T308): bấm tên cửa hàng mở Lịch sử công nợ phần cửa hàng đó */
function TenCuaHang({ x }: { x: Row }) {
  const [mo, setMo] = useState(false)
  return <>
    <button type="button" className="bc-mo-so cn-ten cn-cua-hang" onClick={() => setMo(true)}>{x.cuaHang}</button>
    {mo && <LichSuCongNo loai={x._loai} ma={x.ma} ten={x.ten} thang={x._thang} chiCn={x.cuaHang} onDong={() => setMo(false)} />}
  </>
}

function LichSuCongNo({ loai, ma, ten, thang, cnTen, chiCn, onDong }: { loai: Loai; ma: string; ten: string; thang: number; cnTen?: string; chiCn?: string; onDong: () => void }) {
  const { dau, phieu } = chiCn ? soLieuCuaHang(loai, ma, thang, chiCn) : soLieu(loai, ma, thang, cnTen)
  let no = dau
  const cuoiThang = new Date(2026, thang, 0).getDate()
  const rows: Row[] = [
    { stt: 1, ngay: `01/${pad(thang)}/2026`, dienGiai: 'Đầu kỳ', ps: 0, tra: 0, tt: 0, no: dau, _b: 1 },
    ...phieu.map((p, i) => { no += p.ps - p.tra - p.tt; return { stt: i + 2, ...p, no } }),
    { stt: phieu.length + 2, ngay: `${cuoiThang}/${pad(thang)}/2026`, dienGiai: 'Cuối kỳ', ps: phieu.reduce((a, p) => a + p.ps, 0),
      tra: phieu.reduce((a, p) => a + p.tra, 0), tt: phieu.reduce((a, p) => a + p.tt, 0), no, _t: 1 },
  ]
  const cols: Col[] = [
    { k: 'stt', t: '#', c: true, w: 48 }, { k: 'ngay', t: 'Thời gian', w: 100 }, { k: 'kho', t: 'Kho hàng' }, { k: 'so', t: 'Chứng từ', cls: 'code' },
    { k: 'ghiChu', t: 'Ghi chú' }, { k: 'dienGiai', t: 'Diễn giải' }, { k: 'ps', t: NHAN[loai].ps, num: true },
    { k: 'tra', t: 'Trả hàng', num: true }, { k: 'tt', t: 'Tiền thanh toán', num: true }, { k: 'no', t: 'Công nợ', num: true },
  ]
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }} onKeyDown={e => { if (e.key === 'Escape') onDong() }}>
      <div className="ds-hop cn-hop" role="dialog" aria-modal="true" aria-label={`Lịch sử công nợ - ${ten}`}>
        <div className="ds-hop-dau"><b>Lịch sử công nợ - {ten}{chiCn ? ` · ${chiCn}` : ''}</b><span className="grow" />
          {loai === 'ncc' && no > 0 && <Link to={linkThanhToan(ten, chiCn)} className="btn pri sm" onClick={onDong}>Thanh toán ngay</Link>}
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong} autoFocus><Icon n="x" className="ic sm" /></button></div>
        <div className="cn-hop-than"><Table cols={ganMoPhieu(cols)} rows={rows} motDong keDoc /></div>
      </div>
    </div>,
    document.body,
  )
}

/** Lập phiếu chi trả nợ nhà cung cấp: lý do CHI02 Thanh toán công nợ nhà cung cấp, điền sẵn nhà cung cấp (T304) */
const linkThanhToan = (ten: string, cn?: string) => {
  const id = cn ? CUA_HANG.find(c => c.ten === cn)?.id : undefined   // dòng cửa hàng: lập phiếu chi cho đúng cửa hàng (T308)
  return `/app/tien/2-1-1/moi?loai=chi&ly=CHI02&dt=${encodeURIComponent(ten)}${id ? `&cn=${id}` : ''}`
}

/** Cột số tiền: tiêu đề hai dòng tên cột, ký hiệu công thức như iFaster; độ rộng cột tính theo t nên t chỉ ghi tên */
const cotSo = (k: string, ten: string, kh: string): Col =>
  ({ k, t: ten, num: true, hd: <span className="cn-tieu-de">{ten}<small>({kh})</small></span> })

export function colsCongNo(loai: Loai): Col[] {
  return [
    { k: 'stt', t: '#', c: true, w: 48 },
    // T308: dòng con (cửa hàng) thụt vào dưới tên nhà cung cấp, cùng cột, để các cột số (nhất là Nợ cuối kỳ) vẫn vừa màn
    { k: 'ten', t: NHAN[loai].doiTuong, r: x => x._t ? x.ten : x._con ? <TenCuaHang x={x} /> : <TenDoiTuong x={x} /> },
    { k: 'soDon', t: 'Số đơn phát sinh', num: true, w: 130 },
    cotSo('dau', 'Nợ đầu kỳ', 'I'),
    cotSo('ps', NHAN[loai].tienPs, 'II'),
    cotSo('tra', 'Tiền trả hàng', 'III'),
    cotSo('tt', 'Tiền thanh toán', 'IV'),
    cotSo('cuoi', 'Nợ cuối kỳ', 'V = I+II-III-IV'),
    // Công nợ nhà cung cấp: nút Thanh toán ngay ở dòng còn nợ (T304)
    ...(loai === 'ncc' ? [{ k: '_thanhToan', t: 'Thanh toán', c: true, w: 140, chiManHinh: true,
      r: (x: Row) => !x._t && Number(x.cuoi) > 0 ? <Link to={linkThanhToan(String(x.ten), x._con ? String(x.cuaHang) : undefined)} className="btn sm cn-thanh-toan">Thanh toán ngay</Link> : null } as Col] : []),
  ]
}

export function rowsCongNo(loai: Loai, thang: number, cnTen?: string): Row[] {
  const ds = dsDoiTuong(loai).map((d, i): Row => {
    const { dau, phieu } = soLieu(loai, d.ma, thang, cnTen)
    const ps = phieu.reduce((a, p) => a + p.ps, 0), tra = phieu.reduce((a, p) => a + p.tra, 0), tt = phieu.reduce((a, p) => a + p.tt, 0)
    return { stt: i + 1, ma: d.ma, ten: d.ten, soDon: phieu.filter(p => p.ps).length, dau, ps, tra, tt, cuoi: dau + ps - tra - tt, _loai: loai, _thang: thang, _cn: cnTen }
  })
  const cong = (f: string) => ds.reduce((a, x) => a + (x[f] as number), 0)
  return [...ds, { ten: 'Tổng cộng', soDon: cong('soDon'), dau: cong('dau'), ps: cong('ps'), tra: cong('tra'), tt: cong('tt'), cuoi: cong('cuoi'), _t: 1 }]
}

/** Báo cáo 4.2.3 Công nợ nhà cung cấp có cấp nhóm (T308): xem tất cả cửa hàng thì dưới mỗi nhà cung cấp là từng cửa hàng có phát sinh
 *  (dòng con _con thụt vào cùng cột tên, giữ tên NCC ở trường ten để lọc Nhà cung cấp). Xem một cửa hàng thì như cũ.
 *  Trang chủ, điện thoại vẫn dùng rowsCongNo (không có dòng con) */
export function rowsCongNoNhom(loai: Loai, thang: number, cnTen?: string): Row[] {
  const goc = rowsCongNo(loai, thang, cnTen)
  if (cnTen) return goc
  const out: Row[] = []
  for (const r of goc) {
    if (r._t) { out.push(r); continue }
    const con = CUA_HANG.map(c => {
      const { dau, phieu } = soLieuCuaHang(loai, String(r.ma), thang, c.ten)
      const ps = phieu.reduce((a, p) => a + p.ps, 0), tra = phieu.reduce((a, p) => a + p.tra, 0), tt = phieu.reduce((a, p) => a + p.tt, 0)
      return { ma: r.ma, ten: r.ten, cuaHang: c.ten, soDon: phieu.filter(p => p.ps).length, dau, ps, tra, tt, cuoi: dau + ps - tra - tt, _loai: loai, _thang: thang, _con: 1, _i: 1 } as Row
    }).filter(x => [x.dau, x.ps, x.tra, x.tt].some(v => Number(v) !== 0))
    // Dòng nhà cung cấp in đậm (_nhom) là tổng; dưới là từng cửa hàng có phát sinh, kể cả khi chỉ có 1 cửa hàng
    out.push(con.length ? { ...r, _nhom: 1 } : r, ...con)
  }
  return out
}
