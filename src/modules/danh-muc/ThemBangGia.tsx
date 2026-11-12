// Thêm bảng giá (T723): một lần khai giá cho một khoảng thời gian, nhiều mặt hàng.
// T761 (QD101): mỗi lần khai là một bảng giá có mã BGxxxx, tên. Kho lưu mỗi mặt hàng một dòng kèm soBg, tenBg; danh sách hiện chi tiết từng dòng.
// Bấm một dòng mở form này với mọi dòng cùng mã bảng giá để sửa cả lưới. Trùng mặt hàng với bảng giá khác cùng thời gian, cửa hàng thì hỏi lại, bảng bắt đầu muộn hơn được ưu tiên.
// T812: bố trí lại. Bên trái khai lần lượt loại bảng giá (Giá mua, Giá bán), tên, cửa hàng, đối tượng; góc phải là số bảng giá và thời gian áp dụng như số, ngày chứng từ.
// Đối tượng khai ở đầu form: một nhà cung cấp (giá mua) hoặc một khách hàng (giá bán), hoặc giá chung cho mọi đối tượng; lưới bỏ cột đối tượng.
// Một mặt hàng khai được nhiều dòng, mỗi dòng một ĐVT với giá riêng; chỉ trùng khi cùng mặt hàng và cùng ĐVT. Cột Ghi chú tự nhập; trống thì form tự điền phần quy đổi khi dòng dùng ĐVT khác ĐVT chính. Ô chọn hàng có tìm như phiếu mua, hiện cả mã và tên.
import { useState } from 'react'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Icon } from '../../ui/Icon'
import { HopXacNhan } from '../../ui/LocNangCao'
import { Select } from '../../ui/Dropdown'
import { ONgay, docNgay, type KhoangNgay } from '../../ui/ChonNgay'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { ThemHangLoat, type HangChon } from '../../ui/generic/ThemHangLoat'
import { gieoCatalogRows, thayNhomCatalogRows, useAddedCatalogRows } from '../../ui/generic/danhMucStore'
import { dmy, docSoQT, money } from '../../ui/format'
import { OLoc, dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../../ui/LocCot'
import type { Row } from '../types'
import { CUA_HANG, HANG, HOM_NAY, KHACH, NCC, NVL } from '../../data/mock'
import { DS_HANG_HOA_12 } from './data'
import { ChonCoTim, ChonNhieu, quyDoiTuDanhMuc } from './QuyDoiDvt'
import { ONhap } from '../ccdc/the-phan-bo'

type LoaiGia = 'Giá mua' | 'Giá bán'
interface HangGia { ma: string; ten: string; dvt: string; nhom?: string; gia: number; vat: number }
interface DongGia { key: number; ma: string; dvt: string; gia: string; vat: string; ghiChu?: string; ghiTu?: boolean }   // ghiTu: ghi chú do form tự điền phần quy đổi, người dùng chưa sửa
interface DongLuu { ma: string; ten?: string; dvt: string; gia: number; vat: number; ghiChu?: string }   // một mặt hàng của bảng giá trước khi thành dòng danh sách

/** Giá bán: món, hàng bán; giá mua: nguyên vật liệu và hàng mua về bán lại (có tồn kho) */
const HANG_BAN: HangGia[] = DS_HANG_HOA_12.map(h => {
  const g = HANG.find(x => x.ma === h.ma)
  return { ...h, gia: g?.gia ?? 0, vat: g?.ts ?? 8 }
})
const HANG_MUA: HangGia[] = [
  ...NVL.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: h.gia, vat: h.ts })),
  ...HANG.filter(h => h.tonKho).map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: Math.round(h.gia * 0.6), vat: h.ts })),
]

/** ĐVT chọn được của hàng: ĐVT chính rồi các ĐVT quy đổi trong danh mục Quy đổi ĐVT; heSo: số ĐVT chính trong 1 ĐVT đó */
function dvtCua(h: HangGia): { dv: string; heSo: number }[] {
  return [{ dv: h.dvt, heSo: 1 }, ...quyDoiTuDanhMuc(h.ten, h.dvt).map(q => ({ dv: q.dv, heSo: q.nguoc ? q.tl : 1 / q.tl }))]
}

/** Ghi chú quy đổi của ĐVT khác ĐVT chính, vd "1 Thùng = 24 Lon"; ĐVT chính thì rỗng */
function ghiQuyDoi(h: HangGia | undefined, dvt: string, heSo?: number): string {
  if (!h || !dvt || dvt === h.dvt) return ''
  const hs = heSo ?? dvtCua(h).find(x => x.dv === dvt)?.heSo
  return hs ? `1 ${dvt} = ${(Math.round(hs * 1000) / 1000).toLocaleString('vi-VN')} ${h.dvt}` : ''
}

let soKhoa = 0
const dongMoi = (h?: HangGia, dvt?: string, heSo = 1): DongGia => {
  const dv = dvt ?? h?.dvt ?? ''
  const ghi = ghiQuyDoi(h, dv, heSo)
  return {
    key: ++soKhoa, ma: h?.ma ?? '', dvt: dv,
    gia: h && h.gia ? String(Math.round(h.gia * heSo * 100) / 100) : '', vat: h ? String(h.vat) : '',
    ghiChu: ghi, ghiTu: Boolean(ghi),
  }
}

/** Đọc "dd/mm/yyyy - dd/mm/yyyy" của dòng bảng giá thành khoảng ngày */
function docKhoang(t: unknown): KhoangNgay | null {
  const m = String(t ?? '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  return m ? { tu: new Date(+m[3], +m[2] - 1, +m[1]), den: new Date(+m[6], +m[5] - 1, +m[4]) } : null
}

const DM = '1.14'
const tenNcc = (ma: string) => NCC.find(n => n.ma === ma)?.ten ?? ''
const tenKh = (ma: string) => KHACH.find(n => n.ma === ma)?.ten ?? ''

/** Các dòng danh sách của một bảng giá: mỗi mặt hàng một dòng, kèm mã, tên bảng giá và phần chung (loại, thời gian, cửa hàng, đối tượng) */
function bangGia(soBg: string, tenBg: string, loai: LoaiGia, thoiGian: string, cuaHang: string, dt: string, dong: DongLuu[], _tt = 1): Row[] {
  const laMua = loai === 'Giá mua'
  const ds = laMua ? HANG_MUA : HANG_BAN
  return dong.map((d, i) => ({
    _k: `${soBg}-${i + 1}`, soBg, tenBg, loai, thoiGian, cuaHang, _tt,
    maHang: d.ma, tenHang: d.ten || (ds.find(h => h.ma === d.ma)?.ten ?? d.ma), dvt: d.dvt, gia: d.gia, vat: d.vat, ghiChu: d.ghiChu ?? '', dtMa: dt,
    // Để trống đối tượng là giá chung cho mọi nhà cung cấp, khách hàng
    ncc: laMua ? tenNcc(dt) : '', kh: laMua ? '' : tenKh(dt),
  }))
}

// Dữ liệu mẫu: giá bán thực đơn chung, giá bán riêng một khách hàng, giá mua chung nguyên vật liệu, giá mua của một nhà cung cấp theo nhiều ĐVT
// Hàng có ĐVT lớn hơn ĐVT chính (bao, thùng): khai giá ĐVT chính và ĐVT lớn
const NVL_NHIEU_DVT = HANG_MUA.filter(h => dvtCua(h).some(x => x.heSo > 1)).slice(0, 3)
gieoCatalogRows(DM, [
  // Thực đơn chỉ lấy món bán (HANG), không lấy nguyên vật liệu, công cụ dụng cụ trong danh mục hàng hoá chung
  ...bangGia('BG0001', 'Giá bán thực đơn 2026', 'Giá bán', '01/09/2026 - 31/12/2026', '', '',
    HANG_BAN.filter(h => HANG.some(x => x.ma === h.ma)).map(h => ({ ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.vat }))),
  ...bangGia('BG0002', 'Giá bán khách đoàn Biển Xanh', 'Giá bán', '01/10/2026 - 31/12/2026', CUA_HANG[0]?.ten ?? '', KHACH.find(k => k.ma === 'KH002')?.ma ?? '',
    HANG_BAN.slice(0, 4).map(h => ({ ma: h.ma, dvt: h.dvt, gia: Math.round(h.gia * 0.9 / 1000) * 1000, vat: h.vat }))),
  ...bangGia('BG0003', 'Giá mua nguyên vật liệu Q4/2026', 'Giá mua', '01/10/2026 - 31/03/2027', '', '',
    NVL.slice(0, 8).map(h => ({ ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.ts }))),
  ...bangGia('BG0004', `Giá mua ${NCC[0]?.ten ?? ''} theo ĐVT`, 'Giá mua', '01/11/2026 - 31/01/2027', '', NCC[0]?.ma ?? '',
    NVL_NHIEU_DVT.flatMap(h => [dvtCua(h)[0], dvtCua(h).find(x => x.heSo > 1)!].map(x => ({ ma: h.ma, dvt: x.dv, gia: Math.round(h.gia * x.heSo * 0.97), vat: h.vat, ghiChu: ghiQuyDoi(h, x.dv, x.heSo) })))),
])

/** Mã bảng giá kế tiếp: BG + 4 số, lớn nhất đang có cộng 1 */
function maKeTiep(rows: Row[]): string {
  const so = Math.max(0, ...rows.map(r => Number(String(r.soBg ?? '').replace(/^BG/, '')) || 0))
  return `BG${String(so + 1).padStart(4, '0')}`
}

/** Hai khoảng ngày giao nhau; hai danh sách cửa hàng giao nhau (rỗng là mọi cửa hàng) */
const giaoNgay = (a: KhoangNgay, b: KhoangNgay) => a.tu <= b.den && b.tu <= a.den
const tachCh = (t: unknown) => String(t ?? '').split(',').map(x => x.trim()).filter(Boolean)
const giaoCh = (a: string[], b: string[]) => !a.length || !b.length || a.some(x => b.includes(x))

export function ThemBangGia({ onDong, tab, sua: dongSua }: { onDong: () => void; tab?: string; sua?: Row }) {
  const { toast } = useSession()
  const tatCa = useAddedCatalogRows(DM)
  // Sửa: lấy mọi dòng cùng mã bảng giá với dòng vừa bấm; dau giữ phần chung của bảng giá. Lưu và thêm mới thì về form thêm (maSua rỗng)
  const soBgGoc = dongSua?.soBg ? String(dongSua.soBg) : ''
  const [maSua, setMaSua] = useState(soBgGoc)
  const [dongCu] = useState(() => soBgGoc ? tatCa.filter(r => r.soBg === soBgGoc) : [])
  const dau: Row | undefined = dongCu[0] ?? dongSua
  const [ten, setTen] = useState(String(dau?.tenBg ?? ''))
  const [hoiTrung, setHoiTrung] = useState<{ ds: string[]; themTiep: boolean } | null>(null)
  const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
  const [loai, setLoai] = useState<LoaiGia>(dau ? (dau.loai === 'Giá bán' ? 'Giá bán' : 'Giá mua') : tab === 'Giá bán' ? 'Giá bán' : 'Giá mua')   // mở theo tab đang xem (T724)
  // Thời gian áp dụng: hai ô Từ ngày, Đến ngày gõ dd/mm/yyyy hoặc chọn lịch (T812)
  const [khoangDau] = useState<KhoangNgay>(() => (dau && docKhoang(dau.thoiGian)) || { tu: homNay, den: new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1) })
  const [tuNgay, setTuNgay] = useState(dmy(khoangDau.tu))
  const [denNgay, setDenNgay] = useState(dmy(khoangDau.den))
  const khoang: KhoangNgay = { tu: docNgay(tuNgay), den: docNgay(denNgay) }
  const ngayHong = isNaN(khoang.tu.getTime()) || isNaN(khoang.den.getTime()) || khoang.den < khoang.tu
  const [cuaHang, setCuaHang] = useState<string[]>(() => tachCh(dau?.cuaHang))
  // Đối tượng của cả bảng giá: rỗng là giá chung; rieng bật mà chưa chọn thì lưu báo thiếu
  const [dt, setDt] = useState(String(dau?.dtMa ?? ''))
  const [rieng, setRieng] = useState(Boolean(dau?.dtMa))
  const [dong, setDong] = useState<DongGia[]>(() => dongCu.length
    ? dongCu.map(r => ({ key: ++soKhoa, ma: String(r.maHang ?? ''), dvt: String(r.dvt ?? ''), gia: String(r.gia ?? ''), vat: String(r.vat ?? ''), ghiChu: String(r.ghiChu ?? '') }))
    : [dongMoi(), dongMoi(), dongMoi()])
  // Hàng vừa thêm tại ô chọn hàng (chưa có trong danh sách gốc): giữ mã, tên, ĐVT để hiện và lưu
  const [hangThem, setHangThem] = useState<HangGia[]>(() => dongCu.map(r => ({ ma: String(r.maHang ?? ''), ten: String(r.tenHang ?? ''), dvt: String(r.dvt ?? ''), gia: 0, vat: 8 })))
  // Dòng vừa bấm ở danh sách: tô nhẹ trong lưới để dễ thấy
  const [keyBam] = useState(() => { const i = dongCu.findIndex(r => r._k === dongSua?._k); return i >= 0 ? dong[i].key : -1 })
  const [loi, setLoi] = useState<Set<number>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)
  // Lọc dòng chi tiết giá như bảng chi tiết phiếu mua hàng (T383): bấm phễu hiện hàng ô lọc dưới tiêu đề cột, tắt phễu thì bỏ lọc
  const [moLoc, setMoLoc] = useState(false)
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})

  const laMua = loai === 'Giá mua'
  const dsHang = laMua ? HANG_MUA : HANG_BAN
  const hangCua = (ma: string) => dsHang.find(h => h.ma === ma) ?? hangThem.find(h => h.ma === ma)
  const dsDt = laMua ? NCC : KHACH
  const nhanDt = laMua ? 'nhà cung cấp' : 'khách hàng'
  const tenDtCua = (ma: string) => dsDt.find(n => n.ma === ma)?.ten ?? ''
  const soBg = maSua || maKeTiep(tatCa)
  const giaSauThue = (d: DongGia) => docSoQT(d.gia) * (1 + docSoQT(d.vat) / 100)

  // [khoá, tên cột, chữ của dòng, số của dòng (cột số lọc theo =, >, trong khoảng…)]
  const cotLoc: [string, string, (d: DongGia) => string, ((d: DongGia) => number)?][] = [
    ['ma', 'Mặt hàng', d => d.ma ? `${d.ma} - ${hangCua(d.ma)?.ten ?? ''}` : ''],
    ['dvt', 'ĐVT', d => d.dvt],
    ['gia', 'Đơn giá', d => money(docSoQT(d.gia)), d => docSoQT(d.gia)],
    ['vat', 'VAT (%)', d => d.vat, d => docSoQT(d.vat)],
    ['sau', 'Giá sau thuế', d => money(giaSauThue(d)), giaSauThue],
    ['ghiChu', 'Ghi chú', d => d.ghiChu ?? ''],
  ]
  const kieuLoc = (k: string): KieuLoc => cotLoc.find(c => c[0] === k)?.[3] ? 'so' : 'chon'
  const loc: LocCot = { gt: gtLoc, dat: (k, g) => setGtLoc(t => ({ ...t, [k]: g })), kieu: c => kieuLoc(c.k),
    layLuaChon: k => { const lay = cotLoc.find(c => c[0] === k)?.[2]; return lay ? dsGiaTri(dong, lay) : [] } }
  const khop = (d: DongGia) => !moLoc || cotLoc.every(([k, , lay, so]) => !dangLoc(gtLoc[k]) || khopLoc(kieuLoc(k), gtLoc[k], lay(d), so?.(d)))
  const soKhop = dong.filter(khop).length

  const sua = (key: number, p: Partial<DongGia>) => {
    setDong(ds => ds.map(d => d.key === key ? { ...d, ...p } : d))
    setLoi(l => { const n = new Set(l); n.delete(key); return n })
  }
  const xoa = (key: number) => setDong(ds => ds.length > 1 ? ds.filter(d => d.key !== key) : [dongMoi()])
  // Đổi loại giá thì danh sách hàng, đối tượng khác hẳn: bỏ hết dòng, giữ lại 3 dòng trống
  const doiLoai = (l: LoaiGia) => {
    if (l === loai) return
    setLoai(l); setDt(''); setRieng(false); setDong([dongMoi(), dongMoi(), dongMoi()]); setLoi(new Set()); setGtLoc({})
  }
  // Chọn hàng: mặt hàng đã có ở dòng khác thì lấy ĐVT chưa khai đầu tiên (khai giá ĐVT khác bằng dòng mới), giá quy theo ĐVT đó
  const chonHang = (d: DongGia, ma: string, muc?: { t: string; dvt?: string }) => {
    let h = hangCua(ma)
    if (!h && muc) {
      h = { ma, ten: muc.t.split(' - ').slice(1).join(' - ') || muc.t, dvt: muc.dvt ?? '', gia: 0, vat: 8 }
      const moi = h
      setHangThem(ds => [...ds.filter(x => x.ma !== ma), moi])
    }
    if (!h) { sua(d.key, { ma }); return }
    const daKhai = dong.filter(x => x.key !== d.key && x.ma === ma).map(x => x.dvt)
    const dv = dvtCua(h).find(x => !daKhai.includes(x.dv)) ?? dvtCua(h)[0]
    const m = dongMoi(h, dv.dv, dv.heSo)
    sua(d.key, { ma, dvt: m.dvt, gia: m.gia, vat: m.vat, ...(!d.ghiChu?.trim() || d.ghiTu ? { ghiChu: m.ghiChu, ghiTu: m.ghiTu } : {}) })
  }
  // Chọn nhiều hàng một lần: bỏ dòng trống còn thừa, thêm mỗi hàng một dòng ĐVT chính
  const themHangLoat = (ds: HangChon[]) => {
    setDong(cu => [...cu.filter(d => d.ma), ...ds.map(h => dongMoi(hangCua(h.ma)))])
  }
  // Đổi ĐVT thì quy đơn giá theo tỷ lệ quy đổi, vd 320.000/kg sang g thành 320/g
  const doiDvt = (d: DongGia, dv: string) => {
    const h = hangCua(d.ma)
    if (!h) return
    const ds = dvtCua(h)
    const cu = ds.find(x => x.dv === d.dvt)?.heSo ?? 1
    const moi = ds.find(x => x.dv === dv)?.heSo ?? 1
    const gia = docSoQT(d.gia)
    // Ghi chú trống hoặc do form tự điền: ghi lại phần quy đổi của ĐVT mới, người dùng đã tự ghi thì giữ
    const ghi = ghiQuyDoi(h, dv, moi)
    sua(d.key, { dvt: dv, ...(gia > 0 ? { gia: String(Math.round(gia / cu * moi * 100) / 100) } : {}),
      ...(!d.ghiChu?.trim() || d.ghiTu ? { ghiChu: ghi, ghiTu: Boolean(ghi) } : {}) })
  }

  const dongDien = dong.filter(d => d.ma || d.gia)
  const luu = (themTiep: boolean, boQuaTrung = false) => {
    if (!ten.trim()) { toast('Nhập tên bảng giá'); return }
    if (rieng && !dt) { toast(`Chọn ${nhanDt}, hoặc chọn áp dụng cho mọi ${nhanDt}`); return }
    if (ngayHong) { toast('Thời gian áp dụng: nhập đủ Từ ngày, Đến ngày dạng dd/mm/yyyy, Đến ngày không trước Từ ngày'); return }
    if (!dongDien.length) { toast('Chọn ít nhất một mặt hàng và nhập đơn giá'); return }
    const khoaTrung = (d: DongGia) => `${d.ma}|${d.dvt}`
    const dem = new Map<string, number>()
    dongDien.forEach(d => dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1))
    const lyDo = (d: DongGia) => !d.ma ? 'chưa chọn mặt hàng'
      : docSoQT(d.gia) <= 0 ? 'đơn giá phải lớn hơn 0'
      : (dem.get(khoaTrung(d)) ?? 0) > 1 ? 'trùng mặt hàng và ĐVT với dòng khác'
      : ''
    const sai = dongDien.filter(d => lyDo(d))
    if (sai.length) {
      setLoi(new Set(sai.map(d => d.key)))
      toast(`Dòng ${dong.indexOf(sai[0]) + 1}: ${lyDo(sai[0])}`)
      return
    }
    const maDt = rieng ? dt : ''
    // Trùng mặt hàng, ĐVT với bảng giá khác đang dùng, cùng loại, cùng đối tượng, giao thời gian và cửa hàng: hỏi lại trước khi lưu
    if (!boQuaTrung) {
      const nhom = new Map<string, string[]>()
      tatCa.filter(r => r.soBg !== maSua && r.loai === loai && r._tt !== 0 && String(r.dtMa ?? '') === maDt)
        .filter(r => { const k = docKhoang(r.thoiGian); return k && giaoNgay(k, khoang) && giaoCh(tachCh(r.cuaHang), cuaHang) })
        .filter(r => dongDien.some(d => r.maHang === d.ma && r.dvt === d.dvt))
        .forEach(r => { const k = `${r.soBg} ${r.tenBg}`; nhom.set(k, [...(nhom.get(k) ?? []), `${r.tenHang} (${r.dvt})`]) })
      const trung = [...nhom].map(([k, ds]) => `${k}: ${ds.slice(0, 3).join(', ')}${ds.length > 3 ? ` và ${ds.length - 3} dòng khác` : ''}`)
      if (trung.length) { setHoiTrung({ ds: trung, themTiep }); return }
    }
    const thoiGian = `${dmy(khoang.tu)} - ${dmy(khoang.den)}`
    const rows = bangGia(soBg, ten.trim(), loai, thoiGian, cuaHang.join(', '), maDt,
      dongDien.map(d => ({ ma: d.ma, ten: hangCua(d.ma)?.ten, dvt: d.dvt || hangCua(d.ma)?.dvt || '', gia: docSoQT(d.gia), vat: docSoQT(d.vat), ghiChu: d.ghiChu?.trim() })), maSua ? (dau?._tt ?? 1) : 1)
    thayNhomCatalogRows(DM, r => r.soBg === soBg, rows)   // thêm mới: chưa có dòng nào cùng mã nên thêm vào cuối
    toast(`Đã lưu bảng giá ${soBg} (${dongDien.length} dòng), áp dụng cho ${maDt ? tenDtCua(maDt) : `mọi ${nhanDt}`}`)
    if (!themTiep) { onDong(); return }
    // Lưu và thêm mới: giữ loại, thời gian, cửa hàng, đối tượng; xoá tên và lưới
    setMaSua(''); setTen(''); setDong([dongMoi(), dongMoi(), dongMoi()]); setLoi(new Set()); setGtLoc({})
  }

  const dsMucDt = dsDt.map(n => ({ v: n.ma, t: n.ten, phu: `Mã: ${n.ma}${n.nhom ? ` · ${n.nhom}` : ''}` }))
  const dsMucHang = dsHang.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}`, dvt: h.dvt }))

  return (
    <FormToanMan icon="banggia" iconNet footClass="fsf-f-xem" title={maSua ? `Sửa bảng giá ${maSua}` : `Thêm bảng giá ${laMua ? 'mua' : 'bán'}`} chuaMenu onClose={onDong}
      meta={<span className="muted">Khai giá cho nhiều mặt hàng, mỗi ĐVT một giá.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {maSua && (
            <button type="button" className="btn" onClick={() => setHoiXoa(true)}>
              <Icon n="trash" className="ic sm" />Xoá
            </button>
          )}
          <span className="grow" />
          <button type="button" className="btn bgf-nut-vien" onClick={() => luu(true)}>Lưu và thêm mới</button>
          <button type="button" className="btn pri" onClick={() => luu(false)}>Lưu</button>
        </>
      )}>
      {/* Như phiếu thu chi: bảng chi tiết kéo hết chiều cao form, chân trắng (T812) */}
      <div className="ct-co-dinh bgf-than">
      <section className="card bgf-dau">
        <div className="bgf-trai">
          <div className="bg-dau-o">
            <label className="bg-nhan">Loại bảng giá <span className="req">*</span></label>
            <div className="bg-loai" role="radiogroup" aria-label="Loại bảng giá">
              {(['Giá mua', 'Giá bán'] as LoaiGia[]).map(l => (
                <button key={l} type="button" role="radio" aria-checked={loai === l} className={loai === l ? 'on' : ''} disabled={Boolean(maSua) && loai !== l}
                  title={maSua && loai !== l ? 'Đang sửa bảng giá, không đổi loại bảng giá' : undefined} onClick={() => doiLoai(l)}>
                  <span className={`bgf-cham ${l === 'Giá mua' ? 'mua' : 'ban'}`} />{l}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-dau-o">
            <label className="bg-nhan" htmlFor="bgf-ten">Tên bảng giá <span className="req">*</span></label>
            <input id="bgf-ten" className="inp" value={ten} onChange={e => setTen(e.target.value)} placeholder={laMua ? 'Vd: Giá mua rau củ quý 4' : 'Vd: Giá bán khách đoàn'} />
          </div>
          <div className="bg-dau-o">
            <label className="bg-nhan">Cửa hàng áp dụng</label>
            <ChonNhieu ds={CUA_HANG.map(c => ({ v: c.ten, t: c.ten }))} value={cuaHang} onChange={setCuaHang} nhan="cửa hàng áp dụng" goiY="Tất cả cửa hàng" />
          </div>
          {/* Hàng 2 thẳng cột hàng 1: chọn đối tượng dưới Loại, ô đối tượng dưới Tên bảng giá */}
          <div className="bg-dau-o">
            <label className="bg-nhan">Áp dụng cho {nhanDt}</label>
            <div className="bg-loai" role="radiogroup" aria-label={`Áp dụng cho ${nhanDt}`}>
              <button type="button" role="radio" aria-checked={!rieng} className={!rieng ? 'on' : ''} onClick={() => setRieng(false)}>Mọi {nhanDt}</button>
              <button type="button" role="radio" aria-checked={rieng} className={rieng ? 'on' : ''} onClick={() => setRieng(true)}>Một {nhanDt}</button>
            </div>
          </div>
          {rieng && (
            <div className="bg-dau-o">
              <label className="bg-nhan">{laMua ? 'Nhà cung cấp' : 'Khách hàng'} <span className="req">*</span></label>
              <ChonCoTim key={loai} ds={dsMucDt} value={dt} onChange={setDt} nhan={nhanDt} hienChon={m => `${m.v} - ${m.t}`} />
            </div>
          )}
        </div>

        <aside className="bgf-phai">
          {/* Số bảng giá chỉ hiện khi xem, sửa; thêm mới thì số tự sinh lúc lưu */}
          {maSua && (
            <div className="bgf-so">
              <span className="bgf-so-nhan">Số bảng giá</span>
              <span className="bgf-so-gt">{maSua}</span>
            </div>
          )}
          <div className="bg-dau-o">
            <label className="bg-nhan">Thời gian áp dụng <span className="req">*</span></label>
            <div className={`bgf-ngay${ngayHong ? ' loi' : ''}`}>
              <ONgay value={tuNgay} onChange={setTuNgay} placeholder="Từ ngày" ariaLabel="Áp dụng từ ngày" />
              <span aria-hidden="true">–</span>
              <ONgay value={denNgay} onChange={setDenNgay} placeholder="Đến ngày" ariaLabel="Áp dụng đến ngày" />
            </div>
          </div>
        </aside>
      </section>

      <section className="card bang-sua bg-chi-tiet ct-than-card">
        <div className="bg-thanh">
          <b>Chi tiết giá</b>
          <button type="button" className={`ct-nut-loc${moLoc ? ' on' : ''}`} aria-pressed={moLoc}
            title={moLoc ? 'Ẩn bộ lọc dòng chi tiết' : 'Lọc dòng chi tiết'} aria-label="Lọc dòng chi tiết"
            onClick={() => { if (moLoc) setGtLoc({}); setMoLoc(v => !v) }}>
            <Icon n="filter" className="ic sm" />
          </button>
          {moLoc && soKhop < dong.length && <span className="muted bg-dem-loc">{soKhop}/{dong.length} dòng</span>}
          <span className="grow" />
          <button type="button" className="btn sm ghost" onClick={() => setMoHangLoat(true)}><Icon n="layers" className="ic sm" />Chọn nhiều mặt hàng</button>
          <button type="button" className="btn sm ghost" onClick={() => setDong(ds => [...ds, dongMoi()])}><Icon n="plus" className="ic sm" />Thêm dòng</button>
        </div>
        <div className="bg-bang-cuon">
          <table className="bg-bang">
            <thead>
              <tr>
                <th className="c" style={{ width: 40 }}>#</th>
                <th style={{ width: 340 }}>Mặt hàng <span className="req">*</span></th>
                <th style={{ width: 130 }}>ĐVT <span className="req">*</span></th>
                <th className="r" style={{ width: 140 }}>Đơn giá <span className="req">*</span></th>
                <th className="r" style={{ width: 80 }}>VAT (%)</th>
                <th className="r" style={{ width: 130 }}>Giá sau thuế</th>
                <th style={{ width: 220 }}>Ghi chú</th>
                <th style={{ width: 40 }} />
              </tr>
              {moLoc && (
                <tr className="loc-hang">
                  <th />
                  {cotLoc.map(([k, t]) => <th key={k}><OLoc c={{ k, t }} loc={loc} /></th>)}
                  <th />
                </tr>
              )}
            </thead>
            <tbody>
              {moLoc && soKhop === 0 && (
                <tr><td colSpan={8} className="c muted">Không có dòng nào khớp bộ lọc</td></tr>
              )}
              {dong.map((d, i) => {
                if (!khop(d)) return null   // giữ số thứ tự gốc của dòng khi đang lọc
                const h = hangCua(d.ma)
                const dsDv = h ? dvtCua(h) : []
                return (
                  <tr key={d.key} className={loi.has(d.key) ? 'bg-loi' : d.key === keyBam ? 'bg-bam' : ''}>
                    <td className="c muted">{i + 1}</td>
                    <td>
                      <ChonDanhMuc dm="hang" nhan="hàng hoá" coMa gon className="inp sm" trong="Chọn mặt hàng" goiYTim="Tìm mã, tên hàng"
                        value={d.ma} ds={dsMucHang} onChange={(v, muc) => chonHang(d, v, muc)} />
                    </td>
                    <td>
                      {dsDv.length > 1
                        ? <Select className="inp sm" aria-label={`ĐVT dòng ${i + 1}`} value={d.dvt} onChange={e => doiDvt(d, e.target.value)} ds={dsDv.map(x => ({ v: x.dv, t: x.dv }))} />
                        : <span className="muted">{d.dvt}</span>}
                    </td>
                    <td><ONhap v={d.gia} so ten={`Đơn giá dòng ${i + 1}`} onDoi={t => sua(d.key, { gia: t })} /></td>
                    <td><ONhap v={d.vat} so ten={`VAT dòng ${i + 1}`} onDoi={t => sua(d.key, { vat: t })} /></td>
                    <td className="r muted">{docSoQT(d.gia) > 0 ? money(Math.round(giaSauThue(d))) : ''}</td>
                    <td><input className="inp sm" value={d.ghiChu ?? ''} onChange={e => sua(d.key, { ghiChu: e.target.value, ghiTu: false })} aria-label={`Ghi chú dòng ${i + 1}`} /></td>
                    <td className="c">
                      <button type="button" className="icon-btn sm" aria-label={`Xoá dòng ${i + 1}`} title="Xoá dòng" onClick={() => xoa(d.key)}>
                        <Icon n="trash" className="ic sm" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      </div>

      {hoiXoa && maSua && (
        <HopXacNhan tieuDe={`Xoá bảng giá ${maSua}?`} nut="Xoá" onDong={() => setHoiXoa(false)}
          onDongY={() => { thayNhomCatalogRows(DM, r => r.soBg === maSua, []); toast(`Đã xoá bảng giá ${maSua}`); onDong() }}>
          Xoá bảng giá {String(dau?.tenBg ?? '')} cùng {dongCu.length} dòng mặt hàng, áp dụng {String(dau?.thoiGian ?? '')}.
        </HopXacNhan>
      )}
      {hoiTrung && (
        <HopXacNhan tieuDe="Mặt hàng đã có giá ở bảng giá khác" nut="Vẫn lưu" nutDo={false} onDong={() => setHoiTrung(null)}
          onDongY={() => { const t = hoiTrung.themTiep; setHoiTrung(null); luu(t, true) }}>
          <p>Cùng {rieng ? nhanDt : `giá chung cho mọi ${nhanDt}`}, mặt hàng, ĐVT đã có giá trong thời gian và cửa hàng này:</p>
          <ul>{hoiTrung.ds.map(t => <li key={t}>{t}</li>)}</ul>
          <p>Lưu vẫn được, khi bán hàng, mua hàng bảng giá bắt đầu muộn hơn được ưu tiên.</p>
        </HopXacNhan>
      )}
      {moHangLoat && (
        <ThemHangLoat ds={dsHang.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: laMua && h.ma.startsWith('NVL') ? 'Nguyên vật liệu' : 'Hàng hoá' }))}
          // Một mặt hàng khai được nhiều ĐVT, nên chỉ khoá hàng đã có dòng ĐVT chính
          daCo={dong.filter(d => d.ma && d.dvt === hangCua(d.ma)?.dvt).map(d => d.ma)}
          onDong={() => setMoHangLoat(false)} onXacNhan={themHangLoat} />
      )}
    </FormToanMan>
  )
}
