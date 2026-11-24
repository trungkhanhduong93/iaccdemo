// Dữ liệu Tồn kho ban đầu mẫu C (T879): mỗi kho một bảng mã hàng -> ĐVT, số lượng, đơn giá; giữ trong phiên.
// Danh sách = mọi mặt hàng có theo dõi tồn (nguyên vật liệu + hàng hoá có tonKho), kể cả mặt hàng chưa có tồn đầu.
// Kho bị khoá khi cửa hàng chứa kho đã khoá sổ tới tháng của ngày số dư, hoặc kho đã có phiếu kiểm kê ghi sổ sau ngày số dư (Trum chốt 18/11/2026)
import { useSyncExternalStore } from 'react'
import { CUA_HANG, HANG, NVL, khoaSoDenCua } from '../../data/mock'
import { DON_VI_TINH, NHOM_HANG, QUY_DOI_DVT } from '../danh-muc/data'
import { timMan } from '../../app/registry'
import { tonBanDauMau } from './data'
import { apKhoPhieu } from '../../ui/generic/daXoa'

export type TrangThaiTd = 'co' | 'chua'
/** id = mã hàng|ĐVT: một mặt hàng có nhiều dòng tồn đầu miễn khác ĐVT */
export interface DongTonDau { id: string; ma: string; ten: string; nhom: string; nhomMa: string; dvt: string; dvtMa: string; sl: number | null; gia: number | null; tien: number | null; xem: boolean; co: boolean }
export type LyDoKhoa = { loai: 'kiem-ke'; so: string; ngay: string; id: string } | { loai: 'khoa-so'; cuaHang: string; ky: string }

/** Ngày số dư tồn kho ban đầu, trùng mẫu đã duyệt; sau mốc khoá sổ chung tháng 8/2026 của dữ liệu mẫu */
export const NGAY_SO_DU = '01/09/2026'

const MAT_HANG = [...NVL, ...HANG.filter(h => h.tonKho)]
const thuong = (s: string) => s.trim().toLowerCase()
const maDvt = (ten: string) => DON_VI_TINH.find(d => thuong(d[1]) === thuong(ten))?.[0] ?? ten.toUpperCase()
const maNhom = (ten: string) => NHOM_HANG.find(n => thuong(n.ten) === thuong(ten))?.ma ?? ''   // nhóm chưa có trong danh mục thì để trống mã

interface Luu { dvt: string; sl: number | null; gia: number | null }
const KHO_TD = new Map<string, Map<string, Luu[]>>()
for (const r of tonBanDauMau()) bang(r.kho).set(r.ma, [{ dvt: r.dvt, sl: r.sl, gia: r.gia }])
// Hai dòng mẫu thiếu một nửa để chip Cần xem lại có số
bang('Kho tổng').set('NVL009', [{ dvt: 'Lon', sl: 36, gia: null }])
bang('Kho tổng').set('NS01', [{ dvt: 'Chai', sl: null, gia: 9000 }])

function bang(kho: string) {
  let b = KHO_TD.get(kho)
  if (!b) KHO_TD.set(kho, (b = new Map()))
  return b
}

let phienBan = 0
const nghe = new Set<() => void>()
const doi = () => { phienBan++; nghe.forEach(f => f()) }
/** Bộ đếm phiên bản, đổi sau mỗi lần lưu, xoá, chép để màn vẽ lại */
export const useTonDau = () => useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => phienBan)

export function dsTonDau(kho: string): DongTonDau[] {
  const b = KHO_TD.get(kho)
  return MAT_HANG.flatMap(h => {
    const ls = b?.get(h.ma)
    return (ls?.length ? ls : [{ dvt: h.dvt, sl: null, gia: null }]).map(l => {
      const sl = l.sl, gia = l.gia
      return { id: `${h.ma}|${l.dvt}`, ma: h.ma, ten: h.ten, nhom: h.nhom, nhomMa: maNhom(h.nhom), dvt: l.dvt, dvtMa: maDvt(l.dvt), sl, gia,
        tien: sl != null && gia != null ? sl * gia : null, co: sl != null || gia != null, xem: (sl == null) !== (gia == null) }
    })
  })
}

export const locChip = (ds: DongTonDau[], chip: TrangThaiTd) => ds.filter(d => chip === 'co' ? d.co : !d.co)

/** ĐVT gốc đứng đầu, rồi các ĐVT quy đổi được với ĐVT gốc trong danh mục quy đổi */
export function dvtCuaHang(ma: string) {
  const goc = MAT_HANG.find(h => h.ma === ma)?.dvt ?? ''
  const ten = [goc, ...QUY_DOI_DVT.flatMap(q => thuong(q.tu) === thuong(goc) ? [q.den] : thuong(q.den) === thuong(goc) ? [q.tu] : [])]
  return [...new Set(ten)].map(t => ({ ma: maDvt(t), ten: t }))
}

// shortcut: bản mẫu chưa có lịch sử giá nhập theo mặt hàng; nguyên vật liệu lấy giá danh mục, hàng hoá lấy 65% giá bán. Có sổ mua hàng thì lấy phiếu nhập gần nhất trước ngày số dư
export function giaNhapGanNhat(ma: string, _kho: string): number | null {
  const n = NVL.find(h => h.ma === ma)
  if (n) return n.gia
  const h = HANG.find(x => x.ma === ma)
  return h ? Math.round(h.gia * 0.65 / 100) * 100 : null
}

/** Ghi từng dòng theo (mã hàng, ĐVT). dvtCu có thì dòng ĐVT cũ đổi sang ĐVT mới; số lượng và đơn giá cùng trống thì xoá dòng */
export function luuTonDau(kho: string, ds: { ma: string; dvt: string; sl: number | null; gia: number | null; dvtCu?: string }[]) {
  const b = bang(kho)
  for (const d of ds) {
    const ls = b.get(d.ma) ?? []
    if (d.dvtCu && d.dvtCu !== d.dvt) { const i = ls.findIndex(l => l.dvt === d.dvtCu); if (i >= 0) ls.splice(i, 1) }
    const j = ls.findIndex(l => l.dvt === d.dvt)
    if (d.sl == null && d.gia == null) { if (j >= 0) ls.splice(j, 1) }
    else if (j >= 0) ls[j] = { dvt: d.dvt, sl: d.sl, gia: d.gia }
    else ls.push({ dvt: d.dvt, sl: d.sl, gia: d.gia })
    if (ls.length) b.set(d.ma, ls); else b.delete(d.ma)
  }
  doi()
}

/** Xoá các dòng theo id (mã hàng|ĐVT) */
export function xoaTonDau(kho: string, id: string[]) {
  const b = bang(kho)
  for (const [ma, ls] of b) {
    const con = ls.filter(l => !id.includes(`${ma}|${l.dvt}`))
    if (con.length) b.set(ma, con); else b.delete(ma)
  }
  doi()
}

/** Xoá mọi dòng của các mã hàng, dùng khi nhập Excel ghi đè theo mã */
export function xoaTheoMa(kho: string, ma: string[]) {
  const b = bang(kho)
  ma.forEach(m => b.delete(m))
  doi()
}

/** Chép số lượng, đơn giá của các dòng sang kho nhận, ghi đè dòng cùng mã hàng và ĐVT đang có */
export function chepTonDau(tuKho: string, denKho: string[], id: string[]) {
  const tu = bang(tuKho)
  for (const k of denKho) {
    const den = bang(k)
    for (const i of id) {
      const [m, dvt] = i.split('|')
      const l = tu.get(m)?.find(x => x.dvt === dvt)
      const ls = den.get(m) ?? []
      const j = ls.findIndex(x => x.dvt === dvt)
      if (l) { if (j >= 0) ls[j] = { ...l }; else ls.push({ ...l }) } else if (j >= 0) ls.splice(j, 1)
      if (ls.length) den.set(m, ls); else den.delete(m)
    }
  }
  doi()
}

const soNgay = (d: string) => { const [n, t, y] = d.split('/').map(Number); return y * 10000 + t * 100 + n }

export function khoaTonDau(kho: string): LyDoKhoa | null {
  const [, t, y] = NGAY_SO_DU.split('/').map(Number)
  const ch = CUA_HANG.find(c => c.kho.includes(kho))
  const k = khoaSoDenCua(ch?.id)   // Kho tổng không thuộc cửa hàng nào: dùng mốc khoá chung
  if (k.nam > y || (k.nam === y && k.thang >= t)) return { loai: 'khoa-so', cuaHang: ch?.ten ?? 'tất cả cửa hàng', ky: `${k.thang}/${k.nam}` }
  // Phiếu kiểm kê như màn Kiểm kê đang thấy: phiếu mẫu và phiếu lập trong phiên, bỏ phiếu đã xoá (kể cả phiếu mẫu)
  const v = timMan('kho', '5-1-10').sc?.voucher
  const kk = apKhoPhieu('kho/5-1-10', v?.rowsMau?.() ?? [])
    .filter(r => String(r._kho || CUA_HANG.find(c => c.ten === r.cn)?.kho[0] || '') === kho && r.tt === 'ghi' && soNgay(String(r.ngay)) > soNgay(NGAY_SO_DU))
    .sort((a, b) => soNgay(String(a.ngay)) - soNgay(String(b.ngay)))[0]
  return kk ? { loai: 'kiem-ke', so: String(kk.so), ngay: String(kk.ngay), id: String(kk.id) } : null
}
