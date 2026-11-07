// Thêm bảng giá (T723): một lần khai giá cho một khoảng thời gian, nhiều nhà cung cấp (giá nhập) hoặc khách hàng (giá bán), nhiều mặt hàng.
// Đầu form: loại giá, thời gian áp dụng, cửa hàng áp dụng (chung cho mọi dòng); nhà cung cấp, khách hàng mặc định cho dòng mới.
// Lưới chi tiết: mỗi dòng một đối tượng + một mặt hàng + ĐVT (chọn lại được ĐVT quy đổi) + đơn giá + VAT.
// Giá nhập bắt buộc nhà cung cấp; giá bán để trống khách hàng là áp dụng cho mọi khách hàng.
// T761 (QD101): mỗi lần khai là một bảng giá có mã BGxxxx, tên, giữ cả lưới trong dong; danh sách một dòng mỗi bảng giá.
// Bấm dòng bảng giá mở form này để sửa cả lưới. Trùng mặt hàng với bảng giá khác cùng thời gian, cửa hàng thì hỏi lại, bảng bắt đầu muộn hơn được ưu tiên.
import { useState } from 'react'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Icon } from '../../ui/Icon'
import { HopXacNhan } from '../../ui/LocNangCao'
import { Select } from '../../ui/Dropdown'
import { ChonKhoangNgay, type KhoangNgay } from '../../ui/ChonNgay'
import { ThemHangLoat, type HangChon } from '../../ui/generic/ThemHangLoat'
import { addCatalogRow, gieoCatalogRows, suaCatalogRow, useAddedCatalogRows } from '../../ui/generic/danhMucStore'
import { dmy, docSoQT } from '../../ui/format'
import type { Row } from '../types'
import { CUA_HANG, HANG, HOM_NAY, KHACH, NCC, NVL } from '../../data/mock'
import { DS_HANG_HOA_12 } from './data'
import { ChonCoTim, ChonNhieu, quyDoiTuDanhMuc } from './QuyDoiDvt'
import { ONhap } from '../ccdc/the-phan-bo'

type LoaiGia = 'Giá nhập' | 'Giá bán'
interface HangGia { ma: string; ten: string; dvt: string; nhom?: string; gia: number; vat: number }
interface DongGia { key: number; dt: string; ma: string; dvt: string; gia: string; vat: string }   // dt: mã nhà cung cấp (giá nhập) hoặc khách hàng (giá bán)
interface DongLuu { dt: string; ma: string; dvt: string; gia: number; vat: number }   // dòng lưu trong bảng giá (cột dong)

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

/** Một dòng danh sách bảng giá: giữ cả lưới trong dong; soHang, hang, ncc, kh là phần tóm tắt để hiện, tìm */
function bangGia(ma: string, ten: string, loai: LoaiGia, thoiGian: string, cuaHang: string, dong: DongLuu[], _tt = 1): Row {
  const laNhap = loai === 'Giá nhập'
  const ds = laNhap ? HANG_NHAP : HANG_BAN
  const duyNhat = (a: string[]) => [...new Set(a.filter(Boolean))].join(', ')
  return {
    ma, ten, loai, thoiGian, cuaHang, dong, _tt,
    soHang: new Set(dong.map(d => d.ma)).size,
    hang: duyNhat(dong.map(d => ds.find(h => h.ma === d.ma)?.ten ?? d.ma)),
    ncc: laNhap ? duyNhat(dong.map(d => tenNcc(d.dt))) : '',
    // Giá bán: dòng để trống khách hàng là mọi khách hàng
    kh: laNhap ? '' : duyNhat([...(dong.some(d => !d.dt) ? ['Tất cả khách hàng'] : []), ...dong.map(d => tenKh(d.dt))]),
  }
}

// Dữ liệu mẫu: giá bán thực đơn, giá bán riêng cho một khách hàng, giá nhập nguyên vật liệu theo nhà cung cấp cùng nhóm
gieoCatalogRows(DM, [
  bangGia('BG0001', 'Giá bán thực đơn 2026', 'Giá bán', '01/09/2026 - 31/12/2026', '',
    HANG_BAN.map(h => ({ dt: '', ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.vat }))),
  bangGia('BG0002', `Giá bán riêng ${KHACH[0]?.ten ?? 'khách quen'}`, 'Giá bán', '01/10/2026 - 31/12/2026', CUA_HANG[0]?.ten ?? '',
    HANG_BAN.slice(0, 4).map(h => ({ dt: KHACH[0]?.ma ?? '', ma: h.ma, dvt: h.dvt, gia: Math.round(h.gia * 0.9 / 1000) * 1000, vat: h.vat }))),
  bangGia('BG0003', 'Giá nhập nguyên vật liệu Q4/2026', 'Giá nhập', '01/10/2026 - 31/03/2027', '',
    NVL.slice(0, 8).map(h => ({ dt: (NCC.find(n => n.nhom === h.nhom) ?? NCC[0]).ma, ma: h.ma, dvt: h.dvt, gia: h.gia, vat: h.ts }))),
])

/** Mã bảng giá kế tiếp: BG + 4 số, lớn nhất đang có cộng 1 */
function maKeTiep(rows: Row[]): string {
  const so = Math.max(0, ...rows.map(r => Number(String(r.ma ?? '').replace(/^BG/, '')) || 0))
  return `BG${String(so + 1).padStart(4, '0')}`
}

/** Hai khoảng ngày giao nhau; hai danh sách cửa hàng giao nhau (rỗng là mọi cửa hàng) */
const giaoNgay = (a: KhoangNgay, b: KhoangNgay) => a.tu <= b.den && b.tu <= a.den
const tachCh = (t: unknown) => String(t ?? '').split(',').map(x => x.trim()).filter(Boolean)
const giaoCh = (a: string[], b: string[]) => !a.length || !b.length || a.some(x => b.includes(x))

export function ThemBangGia({ onDong, tab, sua: dongSua }: { onDong: () => void; tab?: string; sua?: Row }) {
  const { toast } = useSession()
  const tatCa = useAddedCatalogRows(DM)
  const [ten, setTen] = useState(String(dongSua?.ten ?? ''))
  const [hoiTrung, setHoiTrung] = useState<string[] | null>(null)
  const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
  const [loai, setLoai] = useState<LoaiGia>(dongSua ? (dongSua.loai === 'Giá bán' ? 'Giá bán' : 'Giá nhập') : tab === 'Giá bán' ? 'Giá bán' : 'Giá nhập')   // mở theo tab đang xem (T724)
  const [khoang, setKhoang] = useState<KhoangNgay>(() => (dongSua && docKhoang(dongSua.thoiGian)) || { tu: homNay, den: new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1) })
  const [cuaHang, setCuaHang] = useState<string[]>(() => dongSua?.cuaHang ? String(dongSua.cuaHang).split(',').map(x => x.trim()).filter(Boolean) : [])
  const [dong, setDong] = useState<DongGia[]>(() => {
    const cu = (dongSua?.dong ?? []) as DongLuu[]
    return cu.length ? cu.map(d => ({ key: ++soKhoa, dt: d.dt, ma: d.ma, dvt: d.dvt, gia: String(d.gia), vat: String(d.vat) })) : [dongMoi(), dongMoi(), dongMoi()]
  })
  // Sửa: mọi dòng cùng một nhà cung cấp, khách hàng thì lấy làm mặc định
  const [dtMacDinh, setDtMacDinh] = useState(() => new Set(dong.map(d => d.dt)).size === 1 ? dong[0].dt : '')
  const [loi, setLoi] = useState<Set<number>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)

  const laNhap = loai === 'Giá nhập'
  const dsHang = laNhap ? HANG_NHAP : HANG_BAN
  const hangCua = (ma: string) => dsHang.find(h => h.ma === ma)
  const dsDt = laNhap ? NCC : KHACH
  const nhanDt = laNhap ? 'nhà cung cấp' : 'khách hàng'

  const sua = (key: number, p: Partial<DongGia>) => {
    setDong(ds => ds.map(d => d.key === key ? { ...d, ...p } : d))
    setLoi(l => { const n = new Set(l); n.delete(key); return n })
  }
  const xoa = (key: number) => setDong(ds => ds.length > 1 ? ds.filter(d => d.key !== key) : [dongMoi(dtMacDinh)])
  // Đổi loại giá thì danh sách hàng, đối tượng khác hẳn: bỏ hết dòng, giữ lại 3 dòng trống
  const doiLoai = (l: LoaiGia) => {
    if (l === loai) return
    setLoai(l); setDtMacDinh(''); setDong([dongMoi(), dongMoi(), dongMoi()]); setLoi(new Set())
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
      const trung = tatCa.filter(r => r.ma !== dongSua?.ma && r.loai === loai && r._tt !== 0)
        .filter(r => { const k = docKhoang(r.thoiGian); return k && giaoNgay(k, khoang) && giaoCh(tachCh(r.cuaHang), cuaHang) })
        .flatMap(r => {
          const ds = dongDien.filter(d => ((r.dong ?? []) as DongLuu[]).some(x => x.ma === d.ma && x.dt === d.dt && x.dvt === d.dvt))
          return ds.length ? [`${r.ma} ${r.ten}: ${ds.slice(0, 3).map(d => hangCua(d.ma)?.ten).join(', ')}${ds.length > 3 ? ` và ${ds.length - 3} mặt hàng khác` : ''}`] : []
        })
      if (trung.length) { setHoiTrung(trung); return }
    }
    const thoiGian = `${dmy(khoang.tu)} - ${dmy(khoang.den)}`
    const ma = dongSua?.ma ? String(dongSua.ma) : maKeTiep(tatCa)
    const tenLuu = ten.trim() || `${loai} ${thoiGian}`
    const row = bangGia(ma, tenLuu, loai, thoiGian, cuaHang.join(', '),
      dongDien.map(d => ({ dt: d.dt, ma: d.ma, dvt: d.dvt || hangCua(d.ma)!.dvt, gia: docSoQT(d.gia), vat: docSoQT(d.vat) })), dongSua?._tt ?? 1)
    if (dongSua?.ma) suaCatalogRow(DM, ma, row); else addCatalogRow(DM, row)
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
    <FormToanMan icon="banggia" title={dongSua ? `Sửa bảng giá ${String(dongSua.ma ?? '')}` : 'Thêm bảng giá'} chuaMenu onClose={onDong}
      meta={<span className="muted">Khai giá cho nhiều mặt hàng, nhiều {nhanDt} cùng một khoảng thời gian.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {dongSua?.ma && (
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
          <input className="inp" value={String(dongSua?.ma ?? maKeTiep(tatCa))} readOnly aria-label="Mã bảng giá" />
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
            </thead>
            <tbody>
              {dong.map((d, i) => {
                const h = hangCua(d.ma)
                const dsDv = h ? dvtCua(h) : []
                return (
                  <tr key={d.key} className={loi.has(d.key) ? 'bg-loi' : ''}>
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

      {hoiXoa && dongSua?.ma && (
        <HopXacNhan tieuDe={`Xoá bảng giá ${String(dongSua.ma)}?`} nut="Xoá" onDong={() => setHoiXoa(false)}
          onDongY={() => { suaCatalogRow(DM, dongSua.ma, null); toast(`Đã xoá bảng giá ${String(dongSua.ma)}`); onDong() }}>
          Xoá bảng giá {String(dongSua.ten ?? '')} cùng {dongSua.soHang} mặt hàng, áp dụng {String(dongSua.thoiGian ?? '')}.
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
