// Khoá sổ bản gói Free (T315): không ghi sổ, không kết chuyển, chỉ chốt số liệu theo tháng.
// Khoá xong thì phiếu trong tháng chỉ xem (không sửa, không xoá), ô Tháng ghi nhận chi phí không chọn được tháng đã khoá.
// Mở khoá bắt buộc ghi lý do. Tháng đã khoá, lịch sử lưu ở trình duyệt (khoaSoCuaHang, data/mock.ts).
// Khoá riêng từng cửa hàng (T19): bảng tháng × cửa hàng theo năm, mỗi cửa hàng khoá lần lượt từng tháng,
// nút Khoá chỉ ở tháng kế tiếp đã hết, nút Mở khoá chỉ ở tháng khoá gần nhất; Khoá sổ hàng loạt khoá nhiều cửa hàng, dồn nhiều tháng
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, KY_MO, LICH_SU_KHOA_SO, khoaSoCuaHang, khoaSoDenCua, kySau, type CuaHang, type KyKhoa, type LichSuKhoaSo } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { moneyD } from '../../ui/format'
import { soLieuKiemKe } from '../home/khoFree'
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

type Hop = { loai: 'khoa' | 'mo'; ids: string[]; ky: KyKhoa } | { loai: 'den' } | { loai: 'lichSu' }

export function KhoaSoFree({ sc, mod }: ScreenProps) {
  const { s, set } = useSession()
  const [, veLai] = useState(0)
  const [nam, setNam] = useState(KY_MO.nam)
  const [hop, setHop] = useState<Hop | null>(null)
  useEffect(() => {
    const on = () => veLai(x => x + 1)
    window.addEventListener('iacc-khoa-so', on)
    return () => window.removeEventListener('iacc-khoa-so', on)
  }, [])

  const { cns, ds, pham } = mocKhoaSo(s.cuaHang)
  const thang = thangCuaNam(nam)
  const motCh = ds.length === 1
  const coKhoaDuoc = ds.some(x => sanSang(x.den))
  const dongHop = () => setHop(null)

  // Ô một cửa hàng một tháng: nhãn trạng thái, nút Khoá ở tháng khoá được, Mở khoá ở tháng khoá gần nhất
  const o = (c: CuaHang, den: KyKhoa, k: KyKhoa) => {
    const tt = ttThang(den, k)
    return (
      <div className="ks-o">
        {tt === 'toi' ? <span className="muted">—</span> : <span className={`chip ${NHAN_TT[tt].cls}`}>{tt === 'khoa' && <Icon n="lock" kieu="net" className="ic sm" />}{NHAN_TT[tt].t}</span>}
        {tt === 'duoc' && <button className="btn sm acc" onClick={() => setHop({ loai: 'khoa', ids: [c.id], ky: k })}>Khoá</button>}
        {tt === 'khoa' && soKy(k) === soKy(den) && <button className="btn sm" onClick={() => setHop({ loai: 'mo', ids: [c.id], ky: k })}>Mở khoá</button>}
      </div>
    )
  }

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn" onClick={() => setHop({ loai: 'lichSu' })}><Icon n="clock" kieu="net" className="ic sm" />Lịch sử khoá sổ</button>
        {coKhoaDuoc && <button className="btn acc" onClick={() => setHop({ loai: 'den' })}><Icon n="lock" kieu="net" className="ic sm" />Khoá sổ hàng loạt</button>}
      </PageHead>
      <div className="stack">
        <Note kind="ok" icon="lock">Khoá sổ là chốt số liệu của tháng: phiếu trong tháng đã khoá chỉ xem được, không sửa, không xoá. Khoá xong tháng trước mới khoá được tháng sau. Cần sửa thì bấm Mở khoá và ghi lý do.</Note>
        <Card
          title={motCh ? `Khoá sổ ${pham}` : 'Khoá sổ theo tháng, từng cửa hàng'}
          sub={motCh ? 'Chọn Tất cả cửa hàng ở thanh trên để xem mọi cửa hàng' : 'Bấm tên cửa hàng để xem riêng cửa hàng đó'}
          act={<Select aria-label="Năm" className="ks-nam" value={String(nam)} onChange={e => setNam(Number(e.target.value))} ds={[KY_MO.nam, KY_MO.nam - 1].map(n => ({ v: String(n), t: `Năm ${n}` }))} />}
          pad={false}>
          <div className="ks-bang-cuon">
            <table className="tbl ks-bang">
              <thead>
                <tr>
                  <th className="ks-cot-thang">Tháng</th>
                  {motCh
                    ? <><th>Trạng thái</th><th>Người khoá</th><th>Lúc khoá</th></>
                    : ds.map(({ c }) => <th key={c.id}><a className="ks-ten-ch" onClick={() => set({ cuaHang: c.id })}>{c.ten}</a></th>)}
                </tr>
              </thead>
              <tbody>
                {thang.map(k => {
                  const l = motCh ? lanKhoa(ds[0].c, k) : undefined
                  return (
                    <tr key={soKy(k)} className={soKy(k) === soKy(KY_MO) ? 'ks-dong-mo' : undefined}>
                      <td className="ks-cot-thang"><b>Tháng {k.thang}</b></td>
                      {motCh
                        ? <><td>{o(ds[0].c, ds[0].den, k)}</td>
                            <td>{ttThang(ds[0].den, k) === 'khoa' ? l?.ai ?? '—' : ''}</td>
                            <td className="dim">{ttThang(ds[0].den, k) === 'khoa' ? l?.luc ?? '—' : ''}</td></>
                        : ds.map(({ c, den }) => <td key={c.id}>{o(c, den, k)}</td>)}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {hop?.loai === 'khoa' && <HopKhoa ids={hop.ids} ky={hop.ky} onDong={dongHop} />}
      {hop?.loai === 'mo' && <HopMo ids={hop.ids} ky={hop.ky} onDong={dongHop} />}
      {hop?.loai === 'den' && <HopKhoaDen cns={cns} onDong={dongHop} />}
      {hop?.loai === 'lichSu' && <HopLichSu onDong={dongHop} />}
    </div>
  )
}

/** Khung hộp thoại giữa màn dùng chung cho Khoá, Mở khoá, Khoá sổ hàng loạt, Lịch sử */
function KhungHop({ tieuDe, rong, onDong, children }: { tieuDe: string; rong?: boolean | 'lich-su'; onDong: () => void; children: ReactNode }) {
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }} onKeyDown={e => { if (e.key === 'Escape') onDong() }}>
      <div className={`ds-hop${rong ? ' ks-hop-rong' : ''}${rong === 'lich-su' ? ' ks-hop-ls' : ''}`} role="dialog" aria-modal="true" aria-label={tieuDe}>
        <div className="ds-hop-dau">
          <Icon n="lock" kieu="net" className="ic sm" /><b>{tieuDe}</b>
          <span className="grow" />
          <button type="button" className="icon-btn sm" onClick={onDong} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="ds-hop-than">{children}</div>
      </div>
    </div>, document.body)
}

const tenCh = (ids: string[]) => ids.length === CUA_HANG.length ? 'tất cả cửa hàng' : CUA_HANG.filter(c => ids.includes(c.id)).map(c => c.ten).join(', ')

/** Khoá một tháng cho một hoặc vài cửa hàng: các bước kiểm tra của tháng đó, còn bước chưa xong vẫn khoá được */
function HopKhoa({ ids, ky, onDong }: { ids: string[]; ky: KyKhoa; onDong: () => void }) {
  const { s, toast } = useSession()
  const cns = CUA_HANG.filter(c => ids.includes(c.id))
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
    khoaSoCuaHang(ids, false, 'Khoá sổ', s.ten)
    toast(`Đã khoá sổ tháng ${nhanKy(ky)}, ${tenCh(ids)}. Phiếu trong tháng chỉ xem, không sửa, không xoá được`)
    onDong()
  }
  return (
    <KhungHop tieuDe={`Khoá sổ tháng ${nhanKy(ky)}`} rong onDong={onDong}>
      <p className="ks-pham">{cns.length > 1 ? `${cns.length} cửa hàng: ${tenCh(ids)}` : cns[0].ten} · {soXong}/{buoc.length} bước đã xong</p>
      {buoc.map(b => (
        <div className={`check ${b.xong ? 'done' : 'now'}`} key={b.ten}>
          <span className="box">{b.xong && <Icon n="check" className="ic sm" />}</span>
          <b>{b.ten}</b><small className="muted">{b.phu}</small>
          <Link className="btn sm ks-xem" to={b.to}>Xem</Link>
        </div>
      ))}
      {soXong < buoc.length && <Note kind="warn" icon="alert">Còn bước chưa xong, khoá lúc này thì số liệu tháng {nhanKy(ky)} có thể chưa đủ. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.</Note>}
      <div className="ks-nut">
        <button className="btn" onClick={onDong}>Huỷ</button>
        <button className="btn acc" onClick={khoa}><Icon n="lock" kieu="net" className="ic sm" />Khoá sổ tháng {nhanKy(ky)}</button>
      </div>
    </KhungHop>
  )
}

/** Mở khoá tháng khoá gần nhất của cửa hàng, bắt buộc lý do */
function HopMo({ ids, ky, onDong }: { ids: string[]; ky: KyKhoa; onDong: () => void }) {
  const { s, toast } = useSession()
  const [lyDo, setLyDo] = useState('')
  const mo = () => {
    if (!lyDo.trim()) { toast('Nhập lý do mở khoá'); return }
    khoaSoCuaHang(ids, true, `Mở khoá, lý do: ${lyDo.trim()}`, s.ten)
    toast(`Đã mở khoá tháng ${nhanKy(ky)}, ${tenCh(ids)}`)
    onDong()
  }
  return (
    <KhungHop tieuDe={`Mở khoá tháng ${nhanKy(ky)}`} onDong={onDong}>
      <p className="ks-pham">{tenCh(ids)}. Mở khoá thì phiếu trong tháng sửa, xoá được lại.</p>
      <textarea className="inp ks-ly-do" rows={3} autoFocus placeholder={`Lý do mở khoá, vd bổ sung hoá đơn điện tháng ${ky.thang}`} value={lyDo} onChange={e => setLyDo(e.target.value)} />
      <div className="ks-nut">
        <button className="btn" onClick={onDong}>Huỷ</button>
        <button className="btn pri" onClick={mo}>Mở khoá</button>
      </div>
    </KhungHop>
  )
}

/** Khoá sổ hàng loạt: chọn nhiều cửa hàng, khoá tới hết một tháng, mỗi cửa hàng khoá lần lượt từng tháng còn thiếu */
function HopKhoaDen({ cns, onDong }: { cns: CuaHang[]; onDong: () => void }) {
  const { s, toast } = useSession()
  const den = (id: string) => khoaSoDenCua(id)
  const thapNhat = cns.map(c => den(c.id)).reduce((a, b) => (soKy(b) < soKy(a) ? b : a))
  // Tháng chọn được: từ tháng kế của cửa hàng khoá chậm nhất tới tháng trước tháng đang mở
  const dsKy: KyKhoa[] = []
  for (let k = kySau(thapNhat); soKy(k) < soKy(KY_MO); k = kySau(k)) dsKy.unshift(k)
  const [dich, setDich] = useState(soKy(dsKy[0]))
  const [chon, setChon] = useState<string[]>(cns.map(c => c.id))
  const kyDich = dsKy.find(k => soKy(k) === dich) ?? dsKy[0]
  const soThang = (id: string) => { let n = 0; for (let k = kySau(den(id)); soKy(k) <= dich; k = kySau(k)) n++; return n }
  const seKhoa = chon.filter(id => soThang(id) > 0)
  const khoa = () => {
    for (;;) {
      const con = seKhoa.filter(id => soKy(den(id)) < dich)
      if (!con.length) break
      khoaSoCuaHang(con, false, 'Khoá sổ', s.ten)
    }
    toast(`Đã khoá sổ đến hết tháng ${nhanKy(kyDich)}, ${tenCh(seKhoa)}`)
    onDong()
  }
  return (
    <KhungHop tieuDe="Khoá sổ hàng loạt" onDong={onDong}>
      <div className="ks-den-thang">
        <span>Khoá đến hết</span>
        <Select aria-label="Tháng khoá đến" value={String(dich)} onChange={e => setDich(Number(e.target.value))} ds={dsKy.map(k => ({ v: String(soKy(k)), t: `Tháng ${nhanKy(k)}` }))} />
      </div>
      <div className="ks-ds-ch">
        {cns.map(c => {
          const n = soThang(c.id)
          return (
            <label key={c.id} className={n ? undefined : 'muted'}>
              <input type="checkbox" disabled={!n} checked={!!n && chon.includes(c.id)} onChange={e => setChon(x => e.target.checked ? [...x, c.id] : x.filter(i => i !== c.id))} />
              <span className="grow">{c.ten}</span>
              <small>{n > 1 ? `khoá thêm ${n} tháng, ${nhanKy(kySau(den(c.id)))} đến ${nhanKy(kyDich)}` : n ? `khoá thêm tháng ${nhanKy(kyDich)}` : `đã khoá đến ${nhanKy(den(c.id))}`}</small>
            </label>
          )
        })}
      </div>
      <Note kind="warn" icon="alert">Khoá hàng loạt không hiện bước kiểm tra từng tháng. Muốn xem bước kiểm tra thì bấm Khoá ở từng tháng trong bảng.</Note>
      <div className="ks-nut">
        <button className="btn" onClick={onDong}>Huỷ</button>
        <button className="btn acc" disabled={!seKhoa.length} onClick={khoa}><Icon n="lock" kieu="net" className="ic sm" />Khoá {seKhoa.length} cửa hàng</button>
      </div>
    </KhungHop>
  )
}

/** Lịch sử khoá sổ có bộ lọc cửa hàng, thao tác, tháng (T19) */
function HopLichSu({ onDong }: { onDong: () => void }) {
  const [ch, setCh] = useState('')
  const [viec, setViec] = useState('')
  const [ky, setKy] = useState('')
  const dsKy = [...new Set(LICH_SU_KHOA_SO.map(x => x.ky))]
  const cuaHang = CUA_HANG.find(c => c.id === ch)
  const rows = LICH_SU_KHOA_SO
    .filter(x => (!cuaHang || coCh(x, cuaHang)) && (!viec || (viec === 'khoa' ? x.viec === 'Khoá sổ' : x.viec.startsWith('Mở'))) && (!ky || x.ky === ky))
    .map(x => ({ ...x, ch: x.ch ?? 'Tất cả cửa hàng' }))
  return (
    <KhungHop tieuDe="Lịch sử khoá sổ" rong="lich-su" onDong={onDong}>
      <div className="ks-loc-ls">
        <Select aria-label="Cửa hàng" value={ch} onChange={e => setCh(e.target.value)} ds={[{ v: '', t: 'Tất cả cửa hàng' }, ...CUA_HANG.map(c => ({ v: c.id, t: c.ten }))]} />
        <Select aria-label="Thao tác" value={viec} onChange={e => setViec(e.target.value)} ds={[{ v: '', t: 'Mọi thao tác' }, { v: 'khoa', t: 'Khoá sổ' }, { v: 'mo', t: 'Mở khoá' }]} />
        <Select aria-label="Tháng" value={ky} onChange={e => setKy(e.target.value)} ds={[{ v: '', t: 'Mọi tháng' }, ...dsKy.map(k => ({ v: k, t: `Tháng ${k}` }))]} />
        <span className="grow" />
        <small className="muted">{rows.length}/{LICH_SU_KHOA_SO.length} dòng</small>
      </div>
      <Table cols={[{ k: 'ky', t: 'Tháng', w: 80 }, { k: 'ch', t: 'Cửa hàng', w: 160 }, { k: 'viec', t: 'Thao tác' }, { k: 'ai', t: 'Người làm', w: 120 }, { k: 'luc', t: 'Lúc', w: 150 }]}
        rows={rows} maxH={420} />
    </KhungHop>
  )
}
