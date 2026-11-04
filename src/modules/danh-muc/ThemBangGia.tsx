// Thêm bảng giá (T723): một lần khai giá cho một khoảng thời gian, nhiều nhà cung cấp, nhiều mặt hàng.
// Đầu form: loại giá, thời gian áp dụng, kho áp dụng (chung cho mọi dòng); giá nhập có nhà cung cấp mặc định cho dòng mới.
// Lưới chi tiết: mỗi dòng một nhà cung cấp (giá nhập) + một mặt hàng + đơn giá + VAT. Lưu thì mỗi dòng thành một dòng bảng giá.
import { useState } from 'react'
import { useSession } from '../../app/session'
import { FormToanMan } from '../../ui/FormToanMan'
import { Icon } from '../../ui/Icon'
import { ChonKhoangNgay, type KhoangNgay } from '../../ui/ChonNgay'
import { ThemHangLoat, type HangChon } from '../../ui/generic/ThemHangLoat'
import { addCatalogRow } from '../../ui/generic/danhMucStore'
import { dmy, docSoQT, soQT } from '../../ui/format'
import { HANG, HOM_NAY, KHO, NCC, NVL } from '../../data/mock'
import { DS_HANG_HOA_12 } from './data'
import { ChonCoTim, ChonNhieu } from './QuyDoiDvt'
import { ONhap } from '../ccdc/the-phan-bo'

type LoaiGia = 'Giá nhập' | 'Giá bán'
interface HangGia { ma: string; ten: string; dvt: string; nhom?: string; gia: number; vat: number }
interface DongGia { key: number; ncc: string; ma: string; gia: string; vat: string }

/** Giá bán: món, hàng bán; giá nhập: nguyên vật liệu và hàng mua về bán lại (có tồn kho) */
const HANG_BAN: HangGia[] = DS_HANG_HOA_12.map(h => {
  const g = HANG.find(x => x.ma === h.ma)
  return { ...h, gia: g?.gia ?? 0, vat: g?.ts ?? 8 }
})
const HANG_NHAP: HangGia[] = [
  ...NVL.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: h.gia, vat: h.ts })),
  ...HANG.filter(h => h.tonKho).map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, gia: Math.round(h.gia * 0.6), vat: h.ts })),
]

let soKhoa = 0
const dongMoi = (ncc = '', h?: HangGia): DongGia => ({ key: ++soKhoa, ncc, ma: h?.ma ?? '', gia: h ? String(h.gia) : '', vat: h ? String(h.vat) : '' })

export function ThemBangGia({ onDong }: { onDong: () => void }) {
  const { toast } = useSession()
  const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
  const [loai, setLoai] = useState<LoaiGia>('Giá nhập')
  const [khoang, setKhoang] = useState<KhoangNgay>({ tu: homNay, den: new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1) })
  const [kho, setKho] = useState<string[]>([])
  const [nccMacDinh, setNccMacDinh] = useState('')
  const [dong, setDong] = useState<DongGia[]>(() => [dongMoi(), dongMoi(), dongMoi()])
  const [loi, setLoi] = useState<Set<number>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)

  const laNhap = loai === 'Giá nhập'
  const dsHang = laNhap ? HANG_NHAP : HANG_BAN
  const hangCua = (ma: string) => dsHang.find(h => h.ma === ma)
  const tenNcc = (ma: string) => NCC.find(n => n.ma === ma)?.ten ?? ''

  const sua = (key: number, p: Partial<DongGia>) => {
    setDong(ds => ds.map(d => d.key === key ? { ...d, ...p } : d))
    setLoi(l => { const n = new Set(l); n.delete(key); return n })
  }
  const xoa = (key: number) => setDong(ds => ds.length > 1 ? ds.filter(d => d.key !== key) : [dongMoi(nccMacDinh)])
  // Đổi loại giá thì danh sách hàng khác hẳn: bỏ hết dòng, giữ lại 3 dòng trống
  const doiLoai = (l: LoaiGia) => { if (l === loai) return; setLoai(l); setDong([dongMoi(), dongMoi(), dongMoi()]); setLoi(new Set()) }
  // Đổi nhà cung cấp mặc định: điền cho các dòng chưa chọn nhà cung cấp
  const doiNccMacDinh = (ma: string) => { setNccMacDinh(ma); setDong(ds => ds.map(d => d.ncc ? d : { ...d, ncc: ma })) }
  // Chọn nhiều hàng một lần: bỏ dòng trống còn thừa, thêm mỗi hàng một dòng với nhà cung cấp mặc định
  const themHangLoat = (ds: HangChon[]) => {
    setDong(cu => [...cu.filter(d => d.ma), ...ds.map(h => dongMoi(nccMacDinh, hangCua(h.ma)))])
  }

  const dongDien = dong.filter(d => d.ma || d.gia)
  const luu = () => {
    if (!dongDien.length) { toast('Chọn ít nhất một mặt hàng và nhập đơn giá'); return }
    const khoaTrung = (d: DongGia) => `${laNhap ? d.ncc : ''}|${d.ma}`
    const dem = new Map<string, number>()
    dongDien.forEach(d => dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1))
    const lyDo = (d: DongGia) => !d.ma ? 'chưa chọn mặt hàng'
      : laNhap && !d.ncc ? 'chưa chọn nhà cung cấp'
      : docSoQT(d.gia) <= 0 ? 'đơn giá phải lớn hơn 0'
      : (dem.get(khoaTrung(d)) ?? 0) > 1 ? (laNhap ? 'trùng nhà cung cấp và mặt hàng với dòng khác' : 'trùng mặt hàng với dòng khác')
      : ''
    const sai = dongDien.filter(d => lyDo(d))
    if (sai.length) {
      setLoi(new Set(sai.map(d => d.key)))
      toast(`Dòng ${dong.indexOf(sai[0]) + 1}: ${lyDo(sai[0])}`)
      return
    }
    const thoiGian = `${dmy(khoang.tu)} - ${dmy(khoang.den)}`
    const lan = Date.now()
    dongDien.forEach((d, i) => {
      const h = hangCua(d.ma)!
      addCatalogRow('1.14', { id: `bg-${lan}-${i}`, loai, ten: h.ten, dvt: h.dvt, thoiGian, gia: docSoQT(d.gia), vat: docSoQT(d.vat),
        ncc: laNhap ? tenNcc(d.ncc) : '', kho: kho.join(', '), _tt: 1 })
    })
    const soNcc = new Set(dongDien.map(d => d.ncc)).size
    toast(`Đã thêm ${dongDien.length} dòng ${loai.toLowerCase()}${laNhap ? ` của ${soNcc} nhà cung cấp` : ''}, áp dụng ${thoiGian}`)
    onDong()
  }

  const dsNcc = NCC.map(n => ({ v: n.ma, t: n.ten, phu: `Mã: ${n.ma}${n.nhom ? ` · ${n.nhom}` : ''}` }))
  const dsMucHang = dsHang.map(h => ({ v: h.ma, t: h.ten, phu: `Mã: ${h.ma} · ${h.dvt}` }))

  return (
    <FormToanMan icon="banggia" title="Thêm bảng giá" onClose={onDong}
      meta={<span className="muted">Khai giá cho nhiều mặt hàng{laNhap ? ', nhiều nhà cung cấp' : ''} cùng một khoảng thời gian.</span>}
      foot={(
        <>
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={luu}>Lưu ({dongDien.length} dòng)</button>
        </>
      )}>
      <section className="card bg-dau">
        <div className="bg-dau-o">
          <label className="bg-nhan">Loại giá <span className="req">*</span></label>
          <div className="bg-loai" role="radiogroup" aria-label="Loại giá">
            {(['Giá nhập', 'Giá bán'] as LoaiGia[]).map(l => (
              <button key={l} type="button" role="radio" aria-checked={loai === l} className={loai === l ? 'on' : ''} onClick={() => doiLoai(l)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bg-dau-o">
          <label className="bg-nhan">Thời gian áp dụng <span className="req">*</span></label>
          <ChonKhoangNgay value={khoang} onChange={setKhoang} />
        </div>
        <div className="bg-dau-o bg-dau-kho">
          <label className="bg-nhan">Kho áp dụng</label>
          <ChonNhieu ds={KHO.map(k => ({ v: k, t: k }))} value={kho} onChange={setKho} nhan="kho áp dụng" goiY="Tất cả kho" />
        </div>
        {laNhap && (
          <div className="bg-dau-o bg-dau-ncc">
            <label className="bg-nhan">Nhà cung cấp mặc định</label>
            <ChonCoTim ds={dsNcc} value={nccMacDinh} onChange={doiNccMacDinh} nhan="nhà cung cấp" />
            <span className="bg-goi-y">Tự điền cho dòng mới và dòng chưa chọn nhà cung cấp</span>
          </div>
        )}
      </section>

      <section className="card bang-sua bg-chi-tiet">
        <div className="bg-thanh">
          <b>Chi tiết giá</b>
          <span className="grow" />
          <button type="button" className="btn sm ghost" onClick={() => setMoHangLoat(true)}><Icon n="layers" className="ic sm" />Chọn nhiều mặt hàng</button>
          <button type="button" className="btn sm ghost" onClick={() => setDong(ds => [...ds, dongMoi(nccMacDinh)])}><Icon n="plus" className="ic sm" />Thêm dòng</button>
        </div>
        <div className="bg-bang-cuon">
          <table className="bg-bang">
            <thead>
              <tr>
                <th className="c" style={{ width: 40 }}>#</th>
                {laNhap && <th style={{ width: 260 }}>Nhà cung cấp <span className="req">*</span></th>}
                <th style={{ width: 260 }}>Mặt hàng <span className="req">*</span></th>
                <th style={{ width: 70 }}>ĐVT</th>
                <th className="r" style={{ width: 140 }}>Đơn giá <span className="req">*</span></th>
                <th className="r" style={{ width: 80 }}>VAT (%)</th>
                <th className="r" style={{ width: 140 }}>Giá gồm VAT</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {dong.map((d, i) => {
                const h = hangCua(d.ma)
                const gia = docSoQT(d.gia)
                return (
                  <tr key={d.key} className={loi.has(d.key) ? 'bg-loi' : ''}>
                    <td className="c muted">{i + 1}</td>
                    {laNhap && <td><ChonCoTim className="inp sm" ds={dsNcc} value={d.ncc} onChange={v => sua(d.key, { ncc: v })} nhan="nhà cung cấp" /></td>}
                    <td>
                      <ChonCoTim className="inp sm" ds={dsMucHang} value={d.ma} nhan="mặt hàng" hienChon={m => `${m.v} · ${m.t}`}
                        // Chọn hàng thì lấy sẵn giá, VAT gần nhất của hàng; người dùng sửa lại được
                        onChange={v => { const x = hangCua(v); sua(d.key, { ma: v, ...(x && !d.gia ? { gia: String(x.gia) } : {}), ...(x && !d.vat ? { vat: String(x.vat) } : {}) }) }} />
                    </td>
                    <td className="muted">{h?.dvt ?? ''}</td>
                    <td><ONhap v={d.gia} so ten={`Đơn giá dòng ${i + 1}`} onDoi={t => sua(d.key, { gia: t })} /></td>
                    <td><ONhap v={d.vat} so ten={`VAT dòng ${i + 1}`} onDoi={t => sua(d.key, { vat: t })} /></td>
                    <td className="r muted">{gia > 0 ? soQT(Math.round(gia * (1 + docSoQT(d.vat) / 100))) : ''}</td>
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

      {moHangLoat && (
        <ThemHangLoat ds={dsHang.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: laNhap && h.ma.startsWith('NVL') ? 'Nguyên vật liệu' : 'Hàng hoá' }))}
          // Giá nhập cho phép một mặt hàng nhiều nhà cung cấp, nên chỉ khoá hàng đã có của đúng nhà cung cấp mặc định
          daCo={dong.filter(d => d.ma && (!laNhap || d.ncc === nccMacDinh)).map(d => d.ma)}
          onDong={() => setMoHangLoat(false)} onXacNhan={themHangLoat} />
      )}
    </FormToanMan>
  )
}
