// Khoá sổ bản gói Free (T315): không ghi sổ, không kết chuyển, chỉ chốt số liệu theo tháng.
// Khoá xong thì phiếu trong tháng chỉ xem (không sửa, không xoá), ô Tháng ghi nhận chi phí không chọn được tháng đã khoá.
// Mở khoá bắt buộc ghi lý do. Tháng đã khoá, lịch sử lưu ở trình duyệt (khoaSoCuaHang, data/mock.ts).
// Khoá riêng từng cửa hàng (T19): bảng các tháng của một cửa hàng chọn trên màn, lọc theo năm, trạng thái.
// Khoá một tháng thì khoá luôn các tháng trước còn thiếu; Mở khoá chỉ ở tháng khoá gần nhất. Nhiều cửa hàng dùng Khoá sổ hàng loạt
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, KY_MO, LICH_SU_KHOA_SO, khoaSoCuaHang, khoaSoDenCua, kySau, kyTruoc, type CuaHang, type KyKhoa, type LichSuKhoaSo } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { ThongBao } from '../../ui/ThongBao'
import { Card, Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { ChipTrangThai, type Chip } from '../../ui/LocNangCao'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import { docNgay } from '../../ui/ChonNgay'
import { moneyD } from '../../ui/format'
import { soLieuKiemKe } from '../home/khoStandard'
import { tonQuyTheoSo } from '../home/LichSuQuy'
import { useChoGhiTang } from '../ccdc/GhiTangHangLoat'
import { tinhToanTongQuan } from '../home/chiSo'

const soKy = (k: KyKhoa) => k.nam * 100 + k.thang
export const nhanKy = (k: KyKhoa) => `${k.thang}/${k.nam}`
// Tháng đang mở (chưa hết tháng) chưa khoá được
const sanSang = (den: KyKhoa) => soKy(kySau(den)) < soKy(KY_MO)

/** Mốc khoá của các cửa hàng đang chọn trên thanh trên (T19): một cửa hàng hoặc tất cả, mỗi cửa hàng khoá, mở khoá theo mốc riêng */
export function mocKhoaSo(chon: string) {
  const cns = CUA_HANG.filter(c => !chon || chon === 'all' || c.id === chon)
  const ds = cns.map(c => ({ c, den: khoaSoDenCua(c.id) }))
  const cungMoc = ds.every(x => soKy(x.den) === soKy(ds[0].den))
  const daKhoa = ds.reduce((a, x) => (soKy(x.den) < soKy(a) ? x.den : a), ds[0].den)   // cửa hàng khoá chậm nhất
  const khoaTiep = ds.filter(x => sanSang(x.den)).map(x => x.c.id)
  // Các bước kiểm tra tính cho cửa hàng sắp khoá; không còn cửa hàng nào khoá được thì tính mọi cửa hàng đang chọn
  const cnKiem = khoaTiep.length ? cns.filter(c => khoaTiep.includes(c.id)) : cns
  return { cns, ds, cungMoc, daKhoa, canKhoa: kySau(daKhoa), khoaTiep, cnKiem, pham: cns.length > 1 ? 'Tất cả cửa hàng' : cns[0].ten }
}

/** Trạng thái một tháng của một cửa hàng: đã khoá, khoá được (tháng kế tiếp đã hết), chưa khoá (phải khoá tháng trước), đang mở, chưa tới */
export type TtKhoa = 'khoa' | 'duoc' | 'chua' | 'mo' | 'toi'
export function ttThang(den: KyKhoa, k: KyKhoa): TtKhoa {
  if (soKy(k) <= soKy(den)) return 'khoa'
  if (soKy(k) > soKy(KY_MO)) return 'toi'
  if (soKy(k) === soKy(KY_MO)) return 'mo'
  return soKy(k) === soKy(kySau(den)) ? 'duoc' : 'chua'
}
export const NHAN_TT: Record<TtKhoa, { t: string; cls: string }> = {
  khoa: { t: 'Đã khoá', cls: 'ok' }, duoc: { t: 'Chưa khoá', cls: 'warn' }, chua: { t: 'Chưa khoá', cls: '' }, mo: { t: 'Đang mở', cls: 'info' }, toi: { t: 'Chưa tới', cls: '' },
}
/** Các tháng của năm hiện trong bảng, mới nhất ở trên; năm đang mở chỉ tới tháng đang mở */
export const thangCuaNam = (nam: number): KyKhoa[] =>
  Array.from({ length: nam === KY_MO.nam ? KY_MO.thang : 12 }, (_, i) => ({ thang: i + 1, nam })).reverse()
/** Dòng lịch sử có áp cho cửa hàng không: ghi Tất cả, đúng tên, hoặc tên ngắn trong danh sách gộp */
const coCh = (x: LichSuKhoaSo, c: CuaHang) => !x.ch || x.ch === 'Tất cả cửa hàng' || x.ch === c.ten || x.ch.split(', ').includes(c.ngan)
/** Lần khoá gần nhất của tháng ở cửa hàng: người khoá, lúc khoá */
function lanKhoa(c: CuaHang, k: KyKhoa) {
  return LICH_SU_KHOA_SO.find(x => x.ky === nhanKy(k) && x.viec === 'Khoá sổ' && coCh(x, c))
}

type Hop = { loai: 'khoa' | 'mo'; id: string; ky: KyKhoa } | { loai: 'den' } | { loai: 'moDen' } | { loai: 'lichSu' }

export function KhoaSoStandard({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [, veLai] = useState(0)
  const [nam, setNam] = useState(KY_MO.nam)
  // Xem một cửa hàng: mặc định cửa hàng đang chọn trên thanh trên, đang xem Tất cả thì cửa hàng đầu
  const [ch, setCh] = useState(() => (CUA_HANG.find(c => c.id === s.cuaHang) ?? CUA_HANG[0]).id)
  const [loc, setLoc] = useState('all')
  const [hop, setHop] = useState<Hop | null>(null)
  useEffect(() => {
    const on = () => veLai(x => x + 1)
    window.addEventListener('iacc-khoa-so', on)
    return () => window.removeEventListener('iacc-khoa-so', on)
  }, [])

  const c = CUA_HANG.find(x => x.id === ch) ?? CUA_HANG[0]
  const den = khoaSoDenCua(c.id)
  const dong = thangCuaNam(nam).map(k => ({ k, tt: ttThang(den, k) }))
  const laChua = (tt: TtKhoa) => tt === 'duoc' || tt === 'chua'
  const chips: Chip[] = [
    { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: dong.length },
    { k: 'chua', ten: 'Chưa khoá sổ', mau: 'var(--amber)', so: dong.filter(d => laChua(d.tt)).length },
    { k: 'khoa', ten: 'Đã khoá sổ', mau: 'var(--green)', so: dong.filter(d => d.tt === 'khoa').length },
  ]
  const hien = dong.filter(d => loc === 'all' || (loc === 'chua' ? laChua(d.tt) : d.tt === 'khoa'))
  const coKhoaDuoc = CUA_HANG.some(x => sanSang(khoaSoDenCua(x.id)))
  const dongHop = () => setHop(null)

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn" data-hd="lichSu" onClick={() => setHop({ loai: 'lichSu' })}><Icon n="clock" kieu="net" className="ic sm" />Lịch sử khoá sổ</button>
        <button className="btn" onClick={() => setHop({ loai: 'moDen' })}><Icon n="lock" kieu="net" className="ic sm" />Mở khoá hàng loạt</button>
        {coKhoaDuoc && <button className="btn acc" onClick={() => setHop({ loai: 'den' })}><Icon n="lock" kieu="net" className="ic sm" />Khoá sổ hàng loạt</button>}
      </PageHead>
      <div className="stack">
        <Note kind="ok" icon="lock">Khoá sổ là chốt số liệu của tháng: phiếu trong tháng đã khoá chỉ xem được, không sửa, không xoá. Khoá một cửa hàng thì chọn cửa hàng đó; khoá, mở khoá nhiều cửa hàng cùng lúc thì dùng Khoá sổ hàng loạt, Mở khoá hàng loạt. Cần sửa thì bấm Mở khoá và ghi lý do.</Note>
        <Card pad={false}>
          <div className="ks-thanh-loc" data-hd="loc">
            <ChipTrangThai ds={chips} chon={loc} onChon={setLoc} />
            <span className="grow" />
            <Select aria-label="Năm" className="ks-nam" value={String(nam)} onChange={e => setNam(Number(e.target.value))} ds={[KY_MO.nam, KY_MO.nam - 1].map(n => ({ v: String(n), t: `Năm ${n}` }))} />
            <Select aria-label="Cửa hàng" className="ks-ch" value={c.id} onChange={e => setCh(e.target.value)} ds={CUA_HANG.map(x => ({ v: x.id, t: x.ten }))} />
          </div>
          <table className="tbl ks-bang" data-hd="bang">
            <thead>
              <tr><th className="ks-cot-stt">#</th><th>Tháng</th><th>Trạng thái</th><th>Người khoá</th><th>Lúc khoá</th><th className="ks-cot-hd">Hành động</th></tr>
            </thead>
            <tbody>
              {hien.map(({ k, tt }, i) => {
                const l = tt === 'khoa' ? lanKhoa(c, k) : undefined
                return (
                  <tr key={soKy(k)} className={tt === 'mo' ? 'ks-dong-mo' : undefined}>
                    <td className="ks-cot-stt dim">{i + 1}</td>
                    <td><b>Tháng {k.thang}</b></td>
                    <td><span className={`chip ${NHAN_TT[tt].cls}`}>{tt === 'khoa' && <Icon n="lock" kieu="net" className="ic sm" />}{NHAN_TT[tt].t}</span></td>
                    <td>{tt === 'khoa' ? l?.ai ?? '—' : ''}</td>
                    <td className="dim">{tt === 'khoa' ? l?.luc ?? '—' : ''}</td>
                    <td className="ks-cot-hd">
                      {laChua(tt) && <button className="btn sm acc" onClick={() => setHop({ loai: 'khoa', id: c.id, ky: k })}>Khoá sổ</button>}
                      {tt === 'khoa' && soKy(k) === soKy(den) && <button className="btn sm" onClick={() => setHop({ loai: 'mo', id: c.id, ky: k })}>Mở khoá</button>}
                      {tt === 'mo' && <small className="muted">Chưa hết tháng</small>}
                    </td>
                  </tr>
                )
              })}
              {!hien.length && <tr><td colSpan={6} className="dim ks-trong">Không có tháng nào</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
      {hop?.loai === 'khoa' && <HopKhoa id={hop.id} ky={hop.ky} onDong={dongHop} />}
      {hop?.loai === 'mo' && <HopMo ids={[hop.id]} ky={hop.ky} onDong={dongHop} />}
      {hop?.loai === 'den' && <HopKhoaDen onDong={dongHop} />}
      {hop?.loai === 'moDen' && <HopMoDen onDong={dongHop} />}
      {hop?.loai === 'lichSu' && <HopLichSu onDong={dongHop} />}
    </div>
  )
}

const tenCh = (ids: string[]) => ids.length === CUA_HANG.length ? 'tất cả cửa hàng' : CUA_HANG.filter(c => ids.includes(c.id)).map(c => c.ten).join(', ')

/** Khoá sổ một tháng của một cửa hàng: các bước kiểm tra của tháng đó, còn bước chưa xong vẫn khoá được.
 *  Tháng trước còn chưa khoá thì khoá luôn, vì phải khoá lần lượt */
function HopKhoa({ id, ky, onDong }: { id: string; ky: KyKhoa; onDong: () => void }) {
  const { s, toast } = useSession()
  const ids = [id]
  const cns = CUA_HANG.filter(c => c.id === id)
  const truoc: KyKhoa[] = []
  for (let k = kySau(khoaSoDenCua(id)); soKy(k) < soKy(ky); k = kySau(k)) truoc.push(k)
  const kk = soLieuKiemKe(ky.thang, new Set(cns.map(c => c.ten)))
  const tonQuy = tonQuyTheoSo(ky.thang, ids).reduce((a, r) => a + r.cuoi, 0)
  const cho = useChoGhiTang(soKy(ky))   // khoản chờ phân bổ chưa ghi tăng thẻ tới hết tháng cần khoá
  // Chi phí phân bổ trong tháng (khấu hao, CCDC, chi phí trả trước) như dòng Chi phí phân bổ hàng tháng ở trang chủ
  const pbThang = tinhToanTongQuan(ky.thang === KY_MO.thang ? 'thang-nay' : 'thang-truoc', ids, s.cheDo, ky.thang).cpPhanBo
  // Dữ liệu mẫu (T317): mặc định còn bước chưa xong để thấy cảnh báo, link đi xử lý; bỏ bước Đồng bộ đủ doanh thu FABi (PhuongXT chốt 17/10/2026)
  const phieuCho: number = 3               // phiếu thu, chi FABi chưa map phương thức thanh toán
  const buoc: { xong: boolean; ten: string; phu: string; to: string }[] = [
    { xong: kk.chuaKiem.length === 0, ten: 'Kiểm kê cuối tháng', phu: kk.chuaKiem.length ? `Chưa kiểm kê: ${kk.chuaKiem.join(', ')}` : cns.length > 1 ? `Đủ ${cns.length} cửa hàng, lệch ${kk.thieu + kk.thua} mặt hàng` : `Đã kiểm kê, lệch ${kk.thieu + kk.thua} mặt hàng`, to: '/app/kho/5-1-10' },
    { xong: true, ten: 'Phân bổ chi phí trong tháng', phu: `Đã phân bổ ${moneyD(pbThang)}`, to: '/app/ccdc/8-1-1' },
    { xong: cho.so === 0, ten: 'Chi phí chờ phân bổ chưa ghi tăng thẻ', phu: cho.so ? `Còn ${cho.so} khoản · ${moneyD(cho.tong)}` : 'Không còn khoản nào', to: '/app/ccdc/8-1-1' },
    { xong: true, ten: 'Đối chiếu tồn quỹ cuối tháng', phu: `Tồn quỹ ${moneyD(tonQuy)}`, to: `/app/trang-chu/lich-su-quy?quy=tat-ca&thang=${ky.thang}` },
    { xong: phieuCho === 0, ten: 'Phiếu thu, chi FABi chờ xử lý', phu: phieuCho ? `Còn ${phieuCho} phiếu chờ gán phương thức thanh toán` : 'Không còn phiếu chờ gán phương thức thanh toán', to: '/app/danh-muc/1-12?tich=1' },   // mở Quỹ tiền lọc quỹ chưa map PTTT
  ]
  const soXong = buoc.filter(b => b.xong).length
  const khoa = () => {
    while (soKy(khoaSoDenCua(id)) < soKy(ky)) khoaSoCuaHang(ids, false, 'Khoá sổ', s.ten)
    toast(`Đã khoá sổ ${truoc.length ? `đến hết tháng ${nhanKy(ky)}` : `tháng ${nhanKy(ky)}`}, ${tenCh(ids)}. Phiếu trong tháng chỉ xem, không sửa, không xoá được`)
    onDong()
  }
  return (
    <ThongBao loai="hoi" hinh="khoa" nhan="Khoá sổ" tieuDe={`Khoá sổ tháng ${nhanKy(ky)}${soXong < buoc.length ? `: còn ${buoc.length - soXong} bước chưa xong` : ''}`}
      moTa={`${cns[0].ten}. Khoá xong, chứng từ trong tháng chỉ xem. Cần sửa thì mở khoá, ghi lý do.`}
      nut={{ ten: `Khoá sổ tháng ${ky.thang}`, onClick: khoa }} onDong={onDong}>
      {truoc.length > 0 && <Note kind="warn" icon="alert">Tháng {truoc.map(nhanKy).join(', ')} chưa khoá sổ. Khoá tháng {nhanKy(ky)} thì khoá luôn các tháng này.</Note>}
      <ul className="ks-tb-buoc">
        {buoc.map(b => (
          <li key={b.ten} className={b.xong ? 'xong' : 'thieu'}>
            <span className="ks-tb-dau" aria-label={b.xong ? 'Đã xong' : 'Chưa xong'}><Icon n={b.xong ? 'check' : 'alert'} className="ic sm" /></span>
            <b>{b.ten}</b><small className="muted">{b.phu}</small>
            {!b.xong && <Link className="ks-tb-lam" to={b.to}>Làm ngay</Link>}
          </li>
        ))}
      </ul>
      {soXong < buoc.length && <p className="ks-tb-canh">Còn bước chưa xong thì số liệu tháng {nhanKy(ky)} có thể chưa đủ. Vẫn khoá được, hệ thống ghi người khoá và thời điểm.</p>}
    </ThongBao>
  )
}

/** Mở khoá tháng khoá gần nhất của cửa hàng, bắt buộc lý do */
function HopMo({ ids, ky, onDong }: { ids: string[]; ky: KyKhoa; onDong: () => void }) {
  const { s, toast } = useSession()
  const [lyDo, setLyDo] = useState('')
  const ch = CUA_HANG.find(c => c.id === ids[0])
  const l = ch && lanKhoa(ch, ky)
  const mo = () => {
    if (!lyDo.trim()) { toast('Nhập lý do mở khoá', { loai: 'loi' }); return }
    khoaSoCuaHang(ids, true, `Mở khoá, lý do: ${lyDo.trim()}`, s.ten)
    toast(`Đã mở khoá tháng ${nhanKy(ky)}, ${tenCh(ids)}`)
    onDong()
  }
  return (
    <ThongBao loai="hoi" hinh="moKhoa" nhan="Mở khoá sổ" tieuDe={`Mở khoá tháng ${nhanKy(ky)}?`}
      moTa={`Chứng từ tháng ${ky.thang} sửa, xoá được lại. Báo cáo đã nộp có thể khác số trên phần mềm.`}
      duKien={[{ nhan: 'Cửa hàng', gt: tenCh(ids) }, ...(l ? [{ nhan: 'Khoá lúc', gt: `${l.luc} · ${l.ai}` }] : [])]}
      nut={{ ten: `Mở khoá tháng ${ky.thang}`, onClick: mo }} onDong={onDong}>
      <label className="ks-tb-nhan" htmlFor="ks-ly-do-mo">Lý do mở khoá</label>
      <textarea id="ks-ly-do-mo" className="inp ks-ly-do" rows={3} placeholder={`Vd bổ sung hoá đơn điện tháng ${ky.thang}`} value={lyDo} onChange={e => setLyDo(e.target.value)} />
    </ThongBao>
  )
}

/** Khoá sổ hàng loạt: chọn tháng, tìm, lọc rồi tích nhiều cửa hàng; mỗi cửa hàng khoá lần lượt từng tháng còn thiếu tới hết tháng chọn */
function HopKhoaDen({ onDong }: { onDong: () => void }) {
  const { s, toast } = useSession()
  const den = (id: string) => khoaSoDenCua(id)
  const thapNhat = CUA_HANG.map(c => den(c.id)).reduce((a, b) => (soKy(b) < soKy(a) ? b : a))
  // Tháng chọn được: từ tháng kế của cửa hàng khoá chậm nhất tới tháng trước tháng đang mở
  const dsKy: KyKhoa[] = []
  for (let k = kySau(thapNhat); soKy(k) < soKy(KY_MO); k = kySau(k)) dsKy.unshift(k)
  const [dich, setDich] = useState(soKy(dsKy[0]))
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState('can')
  const kyDich = dsKy.find(k => soKy(k) === dich) ?? dsKy[0]
  const soThang = (id: string) => { let n = 0; for (let k = kySau(den(id)); soKy(k) <= dich; k = kySau(k)) n++; return n }
  const [chon, setChon] = useState<string[]>(() => CUA_HANG.filter(c => soThang(c.id) > 0).map(c => c.id))
  const can = CUA_HANG.filter(c => soThang(c.id) > 0)
  const chips: Chip[] = [
    { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: CUA_HANG.length },
    { k: 'can', ten: 'Cần khoá', mau: 'var(--amber)', so: can.length },
    { k: 'du', ten: 'Đã khoá đủ', mau: 'var(--green)', so: CUA_HANG.length - can.length },
  ]
  const boDau = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
  const hien = CUA_HANG.filter(c => (loc === 'all' || (loc === 'can') === soThang(c.id) > 0) && boDau(c.ten).includes(boDau(tim.trim())))
  const chonDuoc = hien.filter(c => soThang(c.id) > 0).map(c => c.id)
  const seKhoa = chon.filter(id => soThang(id) > 0)
  const tatCaHien = chonDuoc.length > 0 && chonDuoc.every(id => chon.includes(id))
  const chonHet = (on: boolean) => setChon(x => on ? [...new Set([...x, ...chonDuoc])] : x.filter(id => !chonDuoc.includes(id)))
  const khoa = () => {
    if (!seKhoa.length) { toast('Chọn cửa hàng cần khoá', { loai: 'loi' }); return }
    for (;;) {
      const con = seKhoa.filter(id => soKy(den(id)) < dich)
      if (!con.length) break
      khoaSoCuaHang(con, false, 'Khoá sổ', s.ten)
    }
    toast(`Đã khoá sổ đến hết tháng ${nhanKy(kyDich)}, ${tenCh(seKhoa)}`)
    onDong()
  }
  return (
    <ThongBao loai="hoi" hinh="khoa" nhan="Khoá sổ hàng loạt" tieuDe={`Khoá tháng ${nhanKy(kyDich)} cho ${seKhoa.length} cửa hàng`}
      nut={{ ten: `Khoá ${seKhoa.length} cửa hàng`, onClick: khoa }} onDong={onDong}>
      <div className="ks-tb-rong">
      <div className="ks-den-thang">
        <span>Khoá đến hết</span>
        <Select aria-label="Tháng khoá đến" value={String(dich)} onChange={e => setDich(Number(e.target.value))} ds={dsKy.map(k => ({ v: String(soKy(k)), t: `Tháng ${nhanKy(k)}` }))} />
      </div>
      <div className="ks-thanh-loc ks-loc-hop">
        <ChipTrangThai ds={chips} chon={loc} onChon={setLoc} />
        <span className="grow" />
        <input className="inp ks-tim" placeholder="Tìm cửa hàng" value={tim} onChange={e => setTim(e.target.value)} aria-label="Tìm cửa hàng" />
      </div>
      <label className="ks-chon-het">
        <input type="checkbox" disabled={!chonDuoc.length} checked={tatCaHien} onChange={e => chonHet(e.target.checked)} />
        <span className="grow">Chọn tất cả {chonDuoc.length} cửa hàng đang hiện cần khoá</span>
        <small className="muted">Đã chọn {seKhoa.length}</small>
      </label>
      <div className="ks-ds-ch">
        {hien.map(c => {
          const n = soThang(c.id)
          return (
            <label key={c.id} className={n ? undefined : 'muted'}>
              <input type="checkbox" disabled={!n} checked={!!n && chon.includes(c.id)} onChange={e => setChon(x => e.target.checked ? [...x, c.id] : x.filter(i => i !== c.id))} />
              <span className="grow">{c.ten}</span>
              <small>{n > 1 ? `khoá thêm ${n} tháng, ${nhanKy(kySau(den(c.id)))} đến ${nhanKy(kyDich)}` : n ? `khoá thêm tháng ${nhanKy(kyDich)}` : `đã khoá đến ${nhanKy(den(c.id))}`}</small>
            </label>
          )
        })}
        {!hien.length && <p className="muted">Không có cửa hàng nào</p>}
      </div>
      <p className="tb-mota">Cửa hàng còn bước chưa xong vẫn khoá được. Muốn xem từng bước thì khoá từng tháng trên màn Khoá sổ.</p>
      </div>
    </ThongBao>
  )
}

/** Mở khoá hàng loạt: chọn tháng mở từ, tìm, lọc rồi tích nhiều cửa hàng; mỗi cửa hàng mở lùi lần lượt từng tháng tới trước tháng chọn, bắt buộc lý do */
function HopMoDen({ onDong }: { onDong: () => void }) {
  const { s, toast } = useSession()
  const den = (id: string) => khoaSoDenCua(id)
  const caoNhat = CUA_HANG.map(c => den(c.id)).reduce((a, b) => (soKy(b) > soKy(a) ? b : a))
  // Tháng chọn được: từ tháng khoá muộn nhất lùi 12 tháng
  const dsKy: KyKhoa[] = []
  for (let k = caoNhat; dsKy.length < 12; k = kyTruoc(k)) dsKy.push(k)
  const [tu, setTu] = useState(soKy(dsKy[0]))
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState('mo')
  const [lyDo, setLyDo] = useState('')
  const kyTu = dsKy.find(k => soKy(k) === tu) ?? dsKy[0]
  const soThang = (id: string) => { let n = 0; for (let k = den(id); soKy(k) >= tu; k = kyTruoc(k)) n++; return n }
  const [chon, setChon] = useState<string[]>([])
  const coMo = CUA_HANG.filter(c => soThang(c.id) > 0)
  const chips: Chip[] = [
    { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: CUA_HANG.length },
    { k: 'mo', ten: 'Mở khoá được', mau: 'var(--amber)', so: coMo.length },
    { k: 'chua', ten: 'Chưa khoá tới tháng này', mau: 'var(--muted)', so: CUA_HANG.length - coMo.length },
  ]
  const boDau = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
  const hien = CUA_HANG.filter(c => (loc === 'all' || (loc === 'mo') === soThang(c.id) > 0) && boDau(c.ten).includes(boDau(tim.trim())))
  const chonDuoc = hien.filter(c => soThang(c.id) > 0).map(c => c.id)
  const seMo = chon.filter(id => soThang(id) > 0)
  const tatCaHien = chonDuoc.length > 0 && chonDuoc.every(id => chon.includes(id))
  const chonHet = (on: boolean) => setChon(x => on ? [...new Set([...x, ...chonDuoc])] : x.filter(id => !chonDuoc.includes(id)))
  const mo = () => {
    if (!seMo.length) { toast('Chọn cửa hàng cần mở khoá', { loai: 'loi' }); return }
    if (!lyDo.trim()) { toast('Nhập lý do mở khoá', { loai: 'loi' }); return }
    for (;;) {
      const con = seMo.filter(id => soKy(den(id)) >= tu)
      if (!con.length) break
      khoaSoCuaHang(con, true, `Mở khoá, lý do: ${lyDo.trim()}`, s.ten)
    }
    toast(`Đã mở khoá từ tháng ${nhanKy(kyTu)}, ${tenCh(seMo)}`)
    onDong()
  }
  return (
    <ThongBao loai="hoi" hinh="moKhoa" nhan="Mở khoá hàng loạt" tieuDe={`Mở khoá từ tháng ${nhanKy(kyTu)} cho ${seMo.length} cửa hàng`}
      moTa="Chứng từ từ tháng chọn trở về sau sửa, xoá được lại. Báo cáo đã nộp có thể khác số trên phần mềm."
      nut={{ ten: `Mở khoá ${seMo.length} cửa hàng`, onClick: mo }} onDong={onDong}>
      <div className="ks-tb-rong">
      <div className="ks-den-thang">
        <span>Mở khoá từ</span>
        <Select aria-label="Tháng mở khoá từ" value={String(tu)} onChange={e => setTu(Number(e.target.value))} ds={dsKy.map(k => ({ v: String(soKy(k)), t: `Tháng ${nhanKy(k)}` }))} />
        <small className="muted">các tháng từ tháng này trở về sau sẽ sửa, xoá phiếu được lại</small>
      </div>
      <div className="ks-thanh-loc ks-loc-hop">
        <ChipTrangThai ds={chips} chon={loc} onChon={setLoc} />
        <span className="grow" />
        <input className="inp ks-tim" placeholder="Tìm cửa hàng" value={tim} onChange={e => setTim(e.target.value)} aria-label="Tìm cửa hàng" />
      </div>
      <label className="ks-chon-het">
        <input type="checkbox" disabled={!chonDuoc.length} checked={tatCaHien} onChange={e => chonHet(e.target.checked)} />
        <span className="grow">Chọn tất cả {chonDuoc.length} cửa hàng đang hiện mở khoá được</span>
        <small className="muted">Đã chọn {seMo.length}</small>
      </label>
      <div className="ks-ds-ch">
        {hien.map(c => {
          const n = soThang(c.id)
          return (
            <label key={c.id} className={n ? undefined : 'muted'}>
              <input type="checkbox" disabled={!n} checked={!!n && chon.includes(c.id)} onChange={e => setChon(x => e.target.checked ? [...x, c.id] : x.filter(i => i !== c.id))} />
              <span className="grow">{c.ten}</span>
              <small>{n > 1 ? `mở khoá ${n} tháng, ${nhanKy(kyTu)} đến ${nhanKy(den(c.id))}` : n ? `mở khoá tháng ${nhanKy(kyTu)}` : `mới khoá đến ${nhanKy(den(c.id))}`}</small>
            </label>
          )
        })}
        {!hien.length && <p className="muted">Không có cửa hàng nào</p>}
      </div>
      <label className="ks-tb-nhan" htmlFor="ks-ly-do-den">Lý do mở khoá</label>
      <textarea id="ks-ly-do-den" className="inp ks-ly-do" rows={2} placeholder={`Vd bổ sung hoá đơn điện tháng ${kyTu.thang}`} value={lyDo} onChange={e => setLyDo(e.target.value)} />
      </div>
    </ThongBao>
  )
}

/** Lịch sử khoá sổ, lọc ở từng cột dưới tiêu đề như danh sách chứng từ (T19) */
function HopLichSu({ onDong }: { onDong: () => void }) {
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const tatCa = LICH_SU_KHOA_SO.map(x => ({ ...x, ch: x.ch ?? 'Tất cả cửa hàng' }))
  const kieuCot = (k: string): KieuLoc => (k === 'luc' ? 'ngay' : k === 'viec' ? 'chu' : 'chon')
  const rows = tatCa.filter(r => Object.entries(locCot).every(([k, g]) => {
    const v = String((r as Record<string, unknown>)[k] ?? '')
    return !dangLoc(g) || khopLoc(kieuCot(k), g, v, undefined, k === 'luc' ? docNgay(v.split(' ')[0]) : undefined)
  }))
  return (
    <ThongBao loai="thongTin" nhan="Lịch sử" tieuDe="Lịch sử khoá sổ" nut={{ ten: 'Đóng', onClick: onDong }} nutPhu={null} onDong={onDong}>
      <div className="ks-tb-rong">
      <Table cols={[{ k: 'ky', t: 'Tháng', w: 90 }, { k: 'ch', t: 'Cửa hàng', w: 170 }, { k: 'viec', t: 'Thao tác' }, { k: 'ai', t: 'Người làm', w: 130 }, { k: 'luc', t: 'Lúc', w: 170 }]}
        rows={rows} maxH={420}
        loc={{ gt: locCot, dat: (k, g) => setLocCot(x => ({ ...x, [k]: g })), kieu: c => kieuCot(c.k), layLuaChon: k => dsGiaTri(tatCa, r => String((r as Record<string, unknown>)[k] ?? '')) }} />
      <small className="muted ks-dem-ls">{rows.length}/{tatCa.length} dòng</small>
      </div>
    </ThongBao>
  )
}
