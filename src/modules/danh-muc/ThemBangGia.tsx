// Thêm bảng giá (T723): một lần khai giá cho một khoảng thời gian, nhiều nhà cung cấp (giá nhập) hoặc khách hàng (giá bán), nhiều mặt hàng.
// Đầu form: loại giá, thời gian áp dụng, cửa hàng áp dụng (chung cho mọi dòng); nhà cung cấp, khách hàng mặc định cho dòng mới.
// Lưới chi tiết: mỗi dòng một đối tượng + một mặt hàng + ĐVT (chọn lại được ĐVT quy đổi) + đơn giá + VAT.
// Giá nhập bắt buộc nhà cung cấp; giá bán để trống khách hàng là áp dụng cho mọi khách hàng.
// T761 (QD101): mỗi lần khai là một bảng giá có mã BGxxxx, tên. Kho lưu mỗi mặt hàng một dòng kèm soBg, tenBg; danh sách hiện chi tiết từng dòng.
// Bấm một dòng mở form này với mọi dòng cùng mã bảng giá để sửa cả lưới. Trùng mặt hàng với bảng giá khác cùng thời gian, cửa hàng thì hỏi lại, bảng bắt đầu muộn hơn được ưu tiên.
import { useState } from 'react'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Icon } from '../../ui/Icon'
import { HopXacNhan } from '../../ui/LocNangCao'
import { Select } from '../../ui/Dropdown'
import { ChonKhoangNgay, type KhoangNgay } from '../../ui/ChonNgay'
import { ThemHangLoat, type HangChon } from '../../ui/generic/ThemHangLoat'
import { gieoCatalogRows, thayNhomCatalogRows, useAddedCatalogRows } from '../../ui/generic/danhMucStore'
import { dmy, docSoQT, money } from '../../ui/format'
import { OLoc, dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../../ui/LocCot'
import type { Row } from '../types'
import { CUA_HANG, HANG, HOM_NAY, KHACH, NCC, NVL } from '../../data/mock'
import { DS_HANG_HOA_12 } from './data'
import { ChonCoTim, ChonNhieu, quyDoiTuDanhMuc } from './QuyDoiDvt'
import { ONhap } from '../ccdc/the-phan-bo'

type LoaiGia = 'Giá nhập' | 'Giá bán'
interface HangGia { ma: string; ten: string; dvt: string; nhom?: string; gia: number; vat: number }
interface DongGia { key: number; dt: string; ma: string; dvt: string; gia: string; vat: string }   // dt: mã nhà cung cấp (giá nhập) hoặc khách hàng (giá bán)
interface DongLuu { dt: string; ma: string; dvt: string; gia: number; vat: number }   // một mặt hàng của bảng giá trước khi thành dòng danh sách

/** Giá bán: món, hàng bán; giá nhập: nguyên vật liệu và hàng mua về bán lại (có tồn kho) */
const HANG_BAN: HangGia[] = DS_HANG_HOA_12.map(h => {
  const g = HANG.find(x => x.ma === h.ma)
  return { ...h, gia: g?.gia ?? 0, vat: g?.ts ?? 8 }
})
const HANG_NHAP: HangGia[] = [
  ...NVL.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: h.gia, vat: h.ts })),
  ...HANG.filter(h => h.tonKho).map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: Math.round(h.gia * 0.6), vat: h.ts })),
]

/** ĐVT chọn được của hàng: ĐVT chính rồi các ĐVT quy đổi trong danh mục Quy đổi ĐVT; heSo: số ĐVT chính trong 1 ĐVT đó */
function dvtCua(h: HangGia): { dv: string; heSo: number }[] {
  return [{ dv: h.dvt, heSo: 1 }, ...quyDoiTuDanhMuc(h.ten, h.dvt).map(q => ({ dv: q.dv, heSo: q.nguoc ? q.tl : 1 / q.tl }))]
}

let soKhoa = 0
const dongMoi = (dt = '', h?: HangGia): DongGia => ({ key: ++soKhoa, dt, ma: h?.ma ?? '', dvt: h?.dvt ?? '', gia: h ? String(h.gia) : '', vat: h ? String(h.vat) : '' })

/** Đọc "dd/mm/yyyy - dd/mm/yyyy" của dòng bảng giá thành khoảng ngày */
function docKhoang(t: unknown): KhoangNgay | null {
  const m = String(t ?? '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  return m ? { tu: new Date(+m[3], +m[2] - 1, +m[1]), den: new Date(+m[6], +m[5] - 1, +m[4]) } : null
}

const DM = '1.14'
const tenNcc = (ma: string) => NCC.find(n => n.ma === ma)?.ten ?? ''
const tenKh = (ma: string) => KHACH.find(n => n.ma === ma)?.ten ?? ''

/** Các dòng danh sách của một bảng giá: mỗi mặt hàng một dòng, kèm mã, tên bảng giá và phần chung (loại, thời gian, cửa hàng) */
function bangGia(soBg: string, tenBg: string, loai: LoaiGia, thoiGian: string, cuaHang: string, dong: DongLuu[], _tt = 1): Row[] {
  const laNhap = loai === 'Giá nhập'
  const ds = laNhap ? HANG_NHAP : HANG_BAN
  return dong.map((d, i) => ({
    _k: `${soBg}-${i + 1}`, soBg, tenBg, loai, thoiGian, cuaHang, _tt,
    maHang: d.ma, tenHang: ds.find(h => h.ma === d.ma)?.ten ?? d.ma, dvt: d.dvt, gia: d.gia, vat: d.vat, dtMa: d.dt,
    // Giá bán để trống khách hàng là mọi khách hàng
    ncc: laNhap ? tenNcc(d.dt) : '', kh: laNhap ? '' : tenKh(d.dt),
  }))
}

// Dữ liệu mẫu: giá bán thực đơn, giá bán riêng cho một khách hàng, giá nhập nguyên vật liệu theo nhà cung cấp cùng nhóm
gieoCatalogRows(DM, [
  // Thực đơn chỉ lấy món bán (HANG), không lấy nguyên vật liệu, công cụ dụng cụ trong danh mục hàng hoá chung
  ...bangGia('BG0001', 'Giá bán thực đơn 2026', 'Giá bán', '01/09/2026 - 31/12/2026', '',
    HANG_BAN.filter(h => HANG.some(x => x.ma === h.ma)).map(h => ({ dt: '', ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.vat }))),
  ...bangGia('BG0002', 'Giá bán khách đoàn Biển Xanh', 'Giá bán', '01/10/2026 - 31/12/2026', CUA_HANG[0]?.ten ?? '',
    HANG_BAN.slice(0, 4).map(h => ({ dt: KHACH.find(k => k.ma === 'KH002')?.ma ?? '', ma: h.ma, dvt: h.dvt, gia: Math.round(h.gia * 0.9 / 1000) * 1000, vat: h.vat }))),
  ...bangGia('BG0003', 'Giá nhập nguyên vật liệu Q4/2026', 'Giá nhập', '01/10/2026 - 31/03/2027', '',
    NVL.slice(0, 8).map(h => ({ dt: (NCC.find(n => n.nhom === h.nhom) ?? NCC[0]).ma, ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.ts }))),
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
  // Sửa: lấy mọi dòng cùng mã bảng giá với dòng vừa bấm; dau giữ phần chung của bảng giá
  const soBg = dongSua?.soBg ? String(dongSua.soBg) : ''
  const [dongCu] = useState(() => soBg ? tatCa.filter(r => r.soBg === soBg) : [])
  const dau: Row | undefined = dongCu[0] ?? dongSua
  const [ten, setTen] = useState(String(dau?.tenBg ?? ''))
  const [hoiTrung, setHoiTrung] = useState<string[] | null>(null)
  const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
  const [loai, setLoai] = useState<LoaiGia>(dau ? (dau.loai === 'Giá bán' ? 'Giá bán' : 'Giá nhập') : tab === 'Giá bán' ? 'Giá bán' : 'Giá nhập')   // mở theo tab đang xem (T724)
  const [khoang, setKhoang] = useState<KhoangNgay>(() => (dau && docKhoang(dau.thoiGian)) || { tu: homNay, den: new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1) })
  const [cuaHang, setCuaHang] = useState<string[]>(() => tachCh(dau?.cuaHang))
  const [dong, setDong] = useState<DongGia[]>(() => dongCu.length
    ? dongCu.map(r => ({ key: ++soKhoa, dt: String(r.dtMa ?? ''), ma: String(r.maHang ?? ''), dvt: String(r.dvt ?? ''), gia: String(r.gia ?? ''), vat: String(r.vat ?? '') }))
    : [dongMoi(), dongMoi(), dongMoi()])
  // Dòng vừa bấm ở danh sách: tô nhẹ trong lưới để dễ thấy
  const [keyBam] = useState(() => { const i = dongCu.findIndex(r => r._k === dongSua?._k); return i >= 0 ? dong[i].key : -1 })
  // Sửa: mọi dòng cùng một nhà cung cấp, khách hàng thì lấy làm mặc định
  const [dtMacDinh, setDtMacDinh] = useState(() => new Set(dong.map(d => d.dt)).size === 1 ? dong[0].dt : '')
  const [loi, setLoi] = useState<Set<number>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)
  // Lọc dòng chi tiết giá như bảng chi tiết phiếu mua hàng (T383): bấm phễu hiện hàng ô lọc dưới tiêu đề cột, tắt phễu thì bỏ lọc
  const [moLoc, setMoLoc] = useState(false)
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})

  const laNhap = loai === 'Giá nhập'
  const dsHang = laNhap ? HANG_NHAP : HANG_BAN
  const hangCua = (ma: string) => dsHang.find(h => h.ma === ma)
  const dsDt = laNhap ? NCC : KHACH
  const nhanDt = laNhap ? 'nhà cung cấp' : 'khách hàng'
  const tenDtCua = (ma: string) => dsDt.find(n => n.ma === ma)?.ten ?? ''

  // [khoá, tên cột, chữ của dòng, số của dòng (cột số lọc theo =, >, trong khoảng…)]
  const cotLoc: [string, string, (d: DongGia) => string, ((d: DongGia) => number)?][] = [
    ['dt', laNhap ? 'Nhà cung cấp' : 'Khách hàng', d => d.dt ? tenDtCua(d.dt) : laNhap ? '' : 'Tất cả khách hàng'],
    ['ma', 'Mặt hàng', d => d.ma ? `${d.ma} · ${hangCua(d.ma)?.ten ?? ''}` : ''],
    ['dvt', 'ĐVT', d => d.dvt],
    ['gia', 'Đơn giá', d => money(docSoQT(d.gia)), d => docSoQT(d.gia)],
    ['vat', 'VAT (%)', d => d.vat, d => docSoQT(d.vat)],
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
  const xoa = (key: number) => setDong(ds => ds.length > 1 ? ds.filter(d => d.key !== key) : [dongMoi(dtMacDinh)])
  // Đổi loại giá thì danh sách hàng, đối tượng khác hẳn: bỏ hết dòng, giữ lại 3 dòng trống
  const doiLoai = (l: LoaiGia) => {
    if (l === loai) return
    setLoai(l); setDtMacDinh(''); setDong([dongMoi(), dongMoi(), dongMoi()]); setLoi(new Set()); setGtLoc({})
  }
  // Đổi nhà cung cấp, khách hàng mặc định: điền cho các dòng chưa chọn
  const doiDtMacDinh = (ma: string) => { setDtMacDinh(ma); setDong(ds => ds.map(d => d.dt ? d : { ...d, dt: ma })) }
  // Chọn nhiều hàng một lần: bỏ dòng trống còn thừa, thêm mỗi hàng một dòng với đối tượng mặc định
  const themHangLoat = (ds: HangChon[]) => {
    setDong(cu => [...cu.filter(d => d.ma), ...ds.map(h => dongMoi(dtMacDinh, hangCua(h.ma)))])
  }
  // Đổi ĐVT thì quy đơn giá theo tỷ lệ quy đổi, vd 320.000/kg sang g thành 320/g
  const doiDvt = (d: DongGia, dv: string) => {
    const h = hangCua(d.ma)
    if (!h) return
    const ds = dvtCua(h)
    const cu = ds.find(x => x.dv === d.dvt)?.heSo ?? 1
    const moi = ds.find(x => x.dv === dv)?.heSo ?? 1
    const gia = docSoQT(d.gia)
    sua(d.key, { dvt: dv, ...(gia > 0 ? { gia: String(Math.round(gia / cu * moi * 100) / 100) } : {}) })
  }

  const dongDien = dong.filter(d => d.ma || d.gia)
  const luu = (boQuaTrung = false) => {
    if (!dongDien.length) { toast('Chọn ít nhất một mặt hàng và nhập đơn giá'); return }
    const khoaTrung = (d: DongGia) => `${d.dt}|${d.ma}|${d.dvt}`
    const dem = new Map<string, number>()
    dongDien.forEach(d => dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1))
    const lyDo = (d: DongGia) => !d.ma ? 'chưa chọn mặt hàng'
      : laNhap && !d.dt ? 'chưa chọn nhà cung cấp'
      : docSoQT(d.gia) <= 0 ? 'đơn giá phải lớn hơn 0'
      : (dem.get(khoaTrung(d)) ?? 0) > 1 ? `trùng ${nhanDt}, mặt hàng và ĐVT với dòng khác`
      : ''
    const sai = dongDien.filter(d => lyDo(d))
    if (sai.length) {
      setLoi(new Set(sai.map(d => d.key)))
      toast(`Dòng ${dong.indexOf(sai[0]) + 1}: ${lyDo(sai[0])}`)
      return
    }
    // Trùng mặt hàng với bảng giá khác đang dùng, cùng loại, giao thời gian và cửa hàng: hỏi lại trước khi lưu
    if (!boQuaTrung) {
      const nhom = new Map<string, string[]>()
      tatCa.filter(r => r.soBg !== soBg && r.loai === loai && r._tt !== 0)
        .filter(r => { const k = docKhoang(r.thoiGian); return k && giaoNgay(k, khoang) && giaoCh(tachCh(r.cuaHang), cuaHang) })
        .filter(r => dongDien.some(d => r.maHang === d.ma && (r.dtMa ?? '') === d.dt && r.dvt === d.dvt))
        .forEach(r => { const k = `${r.soBg} ${r.tenBg}`; nhom.set(k, [...(nhom.get(k) ?? []), String(r.tenHang)]) })
      const trung = [...nhom].map(([k, ds]) => `${k}: ${ds.slice(0, 3).join(', ')}${ds.length > 3 ? ` và ${ds.length - 3} mặt hàng khác` : ''}`)
      if (trung.length) { setHoiTrung(trung); return }
    }
    const thoiGian = `${dmy(khoang.tu)} - ${dmy(khoang.den)}`
    const ma = soBg || maKeTiep(tatCa)
    const tenLuu = ten.trim() || `${loai} ${thoiGian}`
    const rows = bangGia(ma, tenLuu, loai, thoiGian, cuaHang.join(', '),
      dongDien.map(d => ({ dt: d.dt, ma: d.ma, dvt: d.dvt || hangCua(d.ma)!.dvt, gia: docSoQT(d.gia), vat: docSoQT(d.vat) })), dau?._tt ?? 1)
    thayNhomCatalogRows(DM, r => r.soBg === ma, rows)   // thêm mới: chưa có dòng nào cùng mã nên thêm vào cuối
    toast(`Đã lưu bảng giá ${ma} (${dongDien.length} dòng), áp dụng ${thoiGian}`)
    onDong()
  }

  // Giá bán: mục đầu "Tất cả khách hàng" (mã rỗng) để bỏ chọn khách hàng, ô trống cũng hiện chữ này
  const dsMucDt = [
    ...(laNhap ? [] : [{ v: '', t: 'Tất cả khách hàng', phu: 'Áp dụng cho mọi khách hàng' }]),
    ...dsDt.map(n => ({ v: n.ma, t: n.ten, phu: `Mã: ${n.ma}${n.nhom ? ` · ${n.nhom}` : ''}` })),
  ]
  const dsMucHang = dsHang.map(h => ({ v: h.ma, t: h.ten, phu: `Mã: ${h.ma} · ${h.dvt}` }))

  return (
    <FormToanMan icon="banggia" title={soBg ? `Sửa bảng giá ${soBg}` : 'Thêm bảng giá'} chuaMenu onClose={onDong}
      meta={<span className="muted">Khai giá cho nhiều mặt hàng, nhiều {nhanDt} cùng một khoảng thời gian.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {soBg && (
            <button type="button" className="btn" onClick={() => setHoiXoa(true)}>
              <Icon n="trash" className="ic sm" />Xoá
            </button>
          )}
          <span className="grow" />
          <button type="button" className="btn pri" onClick={() => luu()}>Lưu ({dongDien.length} dòng)</button>
        </>
      )}>
      <section className="card bg-dau">
        <div className="bg-dau-o">
          <label className="bg-nhan">Mã bảng giá</label>
          <input className="inp" value={soBg || maKeTiep(tatCa)} readOnly aria-label="Mã bảng giá" />
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">Tên bảng giá</label>
          <input className="inp" value={ten} onChange={e => setTen(e.target.value)} aria-label="Tên bảng giá" placeholder="Vd Giá nhập rau củ quý 4" />
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">Loại giá <span className="req">*</span></label>
          <div className="bg-loai" role="radiogroup" aria-label="Loại giá">
            {(['Giá nhập', 'Giá bán'] as LoaiGia[]).map(l => (
              <button key={l} type="button" role="radio" aria-checked={loai === l} className={loai === l ? 'on' : ''} disabled={Boolean(dongSua) && loai !== l}
                title={dongSua && loai !== l ? 'Đang sửa dòng giá, không đổi loại giá' : undefined} onClick={() => doiLoai(l)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">Thời gian áp dụng <span className="req">*</span></label>
          <ChonKhoangNgay value={khoang} onChange={setKhoang} />
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">Cửa hàng áp dụng</label>
          <ChonNhieu ds={CUA_HANG.map(c => ({ v: c.ten, t: c.ten }))} value={cuaHang} onChange={setCuaHang} nhan="cửa hàng áp dụng" goiY="Tất cả cửa hàng" />
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">{laNhap ? 'Nhà cung cấp mặc định' : 'Khách hàng mặc định'}</label>
          <ChonCoTim key={loai} ds={dsMucDt} value={dtMacDinh} onChange={doiDtMacDinh} nhan={nhanDt} />
          <span className="bg-goi-y">{laNhap ? 'Tự điền cho dòng mới và dòng chưa chọn nhà cung cấp' : 'Để trống là áp dụng cho mọi khách hàng'}</span>
        </div>
      </section>

      <section className="card bang-sua bg-chi-tiet">
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
          <button type="button" className="btn sm ghost" onClick={() => setDong(ds => [...ds, dongMoi(dtMacDinh)])}><Icon n="plus" className="ic sm" />Thêm dòng</button>
        </div>
        <div className="bg-bang-cuon">
          <table className="bg-bang">
            <thead>
              <tr>
                <th className="c" style={{ width: 40 }}>#</th>
                <th style={{ width: 260 }}>{laNhap ? <>Nhà cung cấp <span className="req">*</span></> : 'Khách hàng'}</th>
                <th style={{ width: 260 }}>Mặt hàng <span className="req">*</span></th>
                <th style={{ width: 110 }}>ĐVT</th>
                <th className="r" style={{ width: 140 }}>Đơn giá <span className="req">*</span></th>
                <th className="r" style={{ width: 80 }}>VAT (%)</th>
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
                <tr><td colSpan={7} className="c muted">Không có dòng nào khớp bộ lọc</td></tr>
              )}
              {dong.map((d, i) => {
                if (!khop(d)) return null   // giữ số thứ tự gốc của dòng khi đang lọc
                const h = hangCua(d.ma)
                const dsDv = h ? dvtCua(h) : []
                return (
                  <tr key={d.key} className={loi.has(d.key) ? 'bg-loi' : d.key === keyBam ? 'bg-bam' : ''}>
                    <td className="c muted">{i + 1}</td>
                    <td>
                      <ChonCoTim className="inp sm" ds={dsMucDt} value={d.dt} onChange={v => sua(d.key, { dt: v })} nhan={nhanDt} />
                    </td>
                    <td>
                      <ChonCoTim className="inp sm" ds={dsMucHang} value={d.ma} nhan="mặt hàng" hienChon={m => `${m.v} · ${m.t}`}
                        // Chọn hàng thì lấy ĐVT chính, giá, VAT gần nhất của hàng; người dùng sửa lại được
                        onChange={v => { const x = hangCua(v); sua(d.key, { ma: v, dvt: x?.dvt ?? '', ...(x ? { gia: String(x.gia), vat: String(x.vat) } : {}) }) }} />
                    </td>
                    <td>
                      {dsDv.length > 1
                        ? <Select className="inp sm" aria-label={`ĐVT dòng ${i + 1}`} value={d.dvt} onChange={e => doiDvt(d, e.target.value)} ds={dsDv.map(x => ({ v: x.dv, t: x.dv }))} />
                        : <span className="muted">{d.dvt}</span>}
                    </td>
                    <td><ONhap v={d.gia} so ten={`Đơn giá dòng ${i + 1}`} onDoi={t => sua(d.key, { gia: t })} /></td>
                    <td><ONhap v={d.vat} so ten={`VAT dòng ${i + 1}`} onDoi={t => sua(d.key, { vat: t })} /></td>
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

      {hoiXoa && soBg && (
        <HopXacNhan tieuDe={`Xoá bảng giá ${soBg}?`} nut="Xoá" onDong={() => setHoiXoa(false)}
          onDongY={() => { thayNhomCatalogRows(DM, r => r.soBg === soBg, []); toast(`Đã xoá bảng giá ${soBg}`); onDong() }}>
          Xoá bảng giá {String(dau?.tenBg ?? '')} cùng {dongCu.length} dòng mặt hàng, áp dụng {String(dau?.thoiGian ?? '')}.
        </HopXacNhan>
      )}
      {hoiTrung && (
        <HopXacNhan tieuDe="Mặt hàng đã có giá ở bảng giá khác" nut="Vẫn lưu" nutDo={false} onDong={() => setHoiTrung(null)}
          onDongY={() => { setHoiTrung(null); luu(true) }}>
          <p>Cùng {nhanDt}, mặt hàng, ĐVT đã có giá trong thời gian và cửa hàng này:</p>
          <ul>{hoiTrung.map(t => <li key={t}>{t}</li>)}</ul>
          <p>Lưu vẫn được, khi bán hàng, nhập hàng bảng giá bắt đầu muộn hơn được ưu tiên.</p>
        </HopXacNhan>
      )}
      {moHangLoat && (
        <ThemHangLoat ds={dsHang.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: laNhap && h.ma.startsWith('NVL') ? 'Nguyên vật liệu' : 'Hàng hoá' }))}
          // Một mặt hàng có thể có giá của nhiều nhà cung cấp, khách hàng, nên chỉ khoá hàng đã có của đúng đối tượng mặc định
          daCo={dong.filter(d => d.ma && d.dt === dtMacDinh).map(d => d.ma)}
          onDong={() => setMoHangLoat(false)} onXacNhan={themHangLoat} />
      )}
    </FormToanMan>
  )
}
