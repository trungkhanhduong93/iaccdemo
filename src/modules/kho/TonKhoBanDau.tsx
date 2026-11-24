// Tồn kho ban đầu mẫu C (T880, thay màn sửa tại chỗ T736): chọn đúng 1 kho, 2 chip Có tồn đầu, Không có tồn đầu;
// nút Thêm mới mở thẳng hộp tích chọn hàng hoá, hàng vừa tích hiện ngay ở bảng chính để gõ số lượng, đơn giá; mũi tên mở lệnh theo chip.
// Kho đã kiểm kê hoặc đã khoá sổ thì bấm lệnh nào cũng chỉ hiện thông báo khoá (Trum chốt 18/11/2026). Mẫu: backup/mau-T879/NhomLo.dc.html
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Col, ScreenProps } from '../types'
import { KHO } from '../../data/mock'
import { Dropdown, MenuItem, Select } from '../../ui/Dropdown'
import { BoLoc, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef } from '../../ui/LocNangCao'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { NutExcel } from '../../ui/CongCuDs'
import { PageHead } from '../../ui/Page'
import { Icon } from '../../ui/Icon'
import { cuaHangHienTai, useSession } from '../../app/session'
import { tenMan } from '../../app/registry'
import { fold, money, nhapSoQT, soQT } from '../../ui/format'
import { ThemHangLoat } from '../../ui/generic/ThemHangLoat'
import { dsTonDau, dvtCuaHang, giaNhapGanNhat, khoaTonDau, locChip, luuTonDau, useTonDau, type DongTonDau, type LyDoKhoa, type TrangThaiTd } from './ton-dau'
import { HopChepTonDau, HopKhoaTonDau, HopXoaTonDau } from './HopTonDau'
import { HopNhapExcel, type BoHamNhap } from '../../ui/generic/HopNhapExcel'
import { OLoc, dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type LocCot } from '../../ui/LocCot'
import { taiMauTonDau, taiDuLieuTonDau, kiemFileNhapTonDau, ghiTonDau, taiFileLoiTonDau, moTaKhoaTonDau } from './nhapTonDauExcel'

const COLS: Col[] = [
  { k: 'ma', t: 'Mã hàng' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'nhom', t: 'Nhóm hàng hoá' },
  { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true },
]
const COT_CO_DINH = new Set(['ma', 'ten'])
const CHIP: { k: TrangThaiTd; t: string }[] = [{ k: 'co', t: 'Có tồn đầu' }, { k: 'chua', t: 'Không có tồn đầu' }]
type Lenh = 'xoa' | 'chep' | 'gia'
const LENH: Record<TrangThaiTd, Lenh[]> = { co: ['xoa', 'chep'], chua: ['gia'] }
const CAN_TICH: Lenh[] = ['xoa', 'chep']   // chỉ hiện khi đã tích ít nhất 1 dòng
const TEN_LENH: Record<Lenh, string> = { xoa: 'Xoá hàng loạt', chep: 'Sao chép sang kho khác', gia: 'Lấy giá nhập gần nhất' }
/** Giá trị một cột để lọc ở hàng lọc dưới tiêu đề (T900): số để trống thì chuỗi rỗng */
const giaTriCot = (d: DongTonDau, k: string) => { const v = d[k as keyof DongTonDau]; return v == null ? '' : String(v) }

/** Ô số chỉ xem: chưa điền thì để trống */
function OSo({ v }: { v: number | null }) {
  return v != null ? <>{soQT(v)}</> : null
}

export function TonKhoBanDau({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const phienBan = useTonDau()
  // Kho theo cửa hàng đang đứng; chọn Tất cả cửa hàng thì thấy kho của mọi cửa hàng
  const cnChon = cuaHangHienTai(s)
  const dsKhoHien = cnChon?.kho.length ? cnChon.kho : KHO
  const DS_KHO = dsKhoHien.map(k => ({ v: k, t: k }))
  const [khoChon, setKho] = useState(KHO[0])
  const kho = dsKhoHien.includes(khoChon) ? khoChon : dsKhoHien[0]   // đổi cửa hàng mà kho đang xem không thuộc cửa hàng đó thì lấy kho đầu của cửa hàng
  const [khoNhap, setKhoNhap] = useState(kho)
  const [moNhapExcel, setMoNhapExcel] = useState(false)
  const [chip, setChip] = useState<TrangThaiTd>('co')
  const loc0 = useLocNhap(() => ({ tim: '', nhom: '', hang: '' }))   // giá trị lọc chỉ áp khi bấm Lọc, như danh sách chứng từ
  const { nhap: nhapLoc, dat, ap } = loc0
  const [tich, setTich] = useState<Set<string>>(new Set())
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  const [hop, setHop] = useState<{ loai: 'chep' | 'xoa'; ma: string[] } | null>(null)
  const [khoa, setKhoa] = useState<LyDoKhoa | null>(null)
  const [moChon, setMoChon] = useState(false)   // hộp tích chọn hàng từ danh mục (nút Thêm mới)
  const [dongMoi, setDongMoi] = useState<DongTonDau[]>([])   // dòng vừa thêm ở kho đang xem, chưa bấm Lưu, xếp cuối bảng
  const demMoi = useRef(0)
  const [dangSua, setDangSua] = useState(false)   // chế độ Sửa: mọi dòng gõ được số lượng, đơn giá
  const [nhap, setNhap] = useState<Record<string, { sl?: string; gia?: string; dvt?: string }>>({})   // số đang gõ, chưa lưu
  const cot = useCotDs('/kho/5-1-12', COLS, COT_CO_DINH)

  // Dòng vừa thêm nằm cuối danh sách, tính là có tồn đầu để hiện ở bảng chính dù chưa gõ số
  const ds = useMemo(() => [...dsTonDau(kho), ...dongMoi], [kho, phienBan, dongMoi])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsMatHang = useMemo(() => [...new Map(ds.map(d => [d.ma, d])).values()], [ds])   // mỗi mặt hàng một lần dù có nhiều dòng ĐVT
  const dsNhom = useMemo(() => [...new Map(ds.map(d => [d.nhom, d.nhomMa])).entries()].map(([t, m]) => ({ v: t, t: m ? `${m} - ${t}` : t })), [ds])
  // Hàng lọc cột như các màn danh sách khác (T900): cột số lọc theo điều kiện, cột chữ tích giá trị
  const laSo = (k: string) => COLS.some(c => c.k === k && c.num)
  const loc: LocCot = { gt: gtLoc, dat: (k, g) => { setGtLoc(t => ({ ...t, [k]: g })); setTich(new Set()) }, kieu: c => laSo(c.k) ? 'so' : 'chon',
    layLuaChon: k => dsGiaTri(ds, d => giaTriCot(d, k)) }
  const hien = useMemo(() => locChip(ds, chip).filter(d =>
    (!ap.nhom || d.nhom === ap.nhom) && (!ap.hang || d.ma === ap.hang) && (!ap.tim.trim() || fold(`${d.ma} ${d.ten}`).includes(fold(ap.tim.trim())))
    && Object.entries(gtLoc).every(([k, g]) => { const v = d[k as keyof DongTonDau]; return !dangLoc(g) || khopLoc(laSo(k) ? 'so' : 'chon', g, giaTriCot(d, k), typeof v === 'number' ? v : undefined) })), [ds, chip, ap, gtLoc])
  const tichHet = hien.length > 0 && hien.every(d => tich.has(d.id))
  const doiTich = (ma: string) => setTich(t => { const n = new Set(t); if (n.has(ma)) n.delete(ma); else n.add(ma); return n })
  const doiKho = (k: string) => { setKho(k); setTich(new Set()) }
  useEffect(() => { setTich(new Set()); huyNhap() }, [kho])   // eslint-disable-line react-hooks/exhaustive-deps
  const doiChip = (c: TrangThaiTd) => { setChip(c); setTich(new Set()) }
  const dongHop = () => {
    if (hop?.loai === 'xoa') {
      setDongMoi(t => t.filter(d => !hop.ma.includes(d.id)))
      setNhap(n => Object.fromEntries(Object.entries(n).filter(([m]) => !hop.ma.includes(m))))
    }
    setHop(null); setTich(new Set())
  }

  // Mọi lệnh thay đổi tồn đầu đi qua đây: kho khoá thì chỉ báo lý do
  const khoKhoa = () => { const l = khoaTonDau(kho); if (l) setKhoa(l); return l !== null }
  const themMoi = () => { if (!khoKhoa()) setMoChon(true) }
  // Bấm Sửa thì mọi dòng gõ được số lượng, đơn giá; hàng vừa thêm gõ được luôn. Số gõ giữ ở bản nháp tới khi bấm Lưu
  const laMoi = (d: DongTonDau) => d.id.startsWith('moi:')
  const goDuoc = (d: DongTonDau) => dangSua || laMoi(d)
  const soNhap = (d: DongTonDau, f: 'sl' | 'gia') => { const t = nhap[d.id]?.[f]; return t === undefined ? d[f] : t === '' ? null : Number(t) }
  const coThayDoi = dangSua || dongMoi.length > 0 || Object.keys(nhap).length > 0
  const huyNhap = () => { setNhap({}); setDongMoi([]); setDangSua(false) }
  const batSua = () => { if (!khoKhoa()) setDangSua(true) }
  const luuNhap = () => {
    if (khoKhoa()) return
    const id = new Set([...dongMoi.map(d => d.id), ...Object.keys(nhap)])
    const dong = ds.filter(d => id.has(d.id)).map(d => ({ ma: d.ma, dvt: nhap[d.id]?.dvt ?? d.dvt, dvtCu: laMoi(d) ? undefined : d.dvt, sl: soNhap(d, 'sl'), gia: soNhap(d, 'gia') }))
    luuTonDau(kho, dong)
    toast(`Đã lưu tồn đầu ${dong.filter(d => d.sl != null || d.gia != null).length} mặt hàng`)
    huyNhap()
  }
  const chay = (l: Lenh) => {
    if (khoKhoa()) return
    const ma = hien.filter(d => tich.has(d.id)).map(d => d.id)
    if (!ma.length) { toast('Tích chọn dòng trước'); return }
    if (l === 'gia') {
      const dong = ds.filter(d => ma.includes(d.id))
      luuTonDau(kho, dong.map(d => ({ ma: d.ma, dvt: d.dvt, sl: d.sl, gia: giaNhapGanNhat(d.ma, kho) })))
      setTich(new Set())
      toast(`Đã lấy giá nhập gần nhất cho ${ma.length} mã hàng`)
      return
    }
    setHop({ loai: l, ma })
  }

  const o = (d: DongTonDau, k: string) => {
    switch (k) {
      case 'ma': return <span className="td-mau-body">{d.ma}</span>
      case 'ten': return <span className="td-ten-hang">{d.ten}</span>
      case 'dvt': {
        // Bấm Sửa thì chọn lại ĐVT trong ĐVT chính và các ĐVT quy đổi của hàng, trừ ĐVT các dòng khác của hàng đó dùng; kho quy đổi về ĐVT chính
        if (!goDuoc(d)) return <span className="td-ten">{d.dvt}</span>
        const ds2 = dvtCuaHang(d.ma), dung = dvtDaDung(d)
        return <span title={`ĐVT chính: ${ds2[0]?.ten ?? d.dvt}, kho quy đổi về ĐVT chính`}><Select className="ds-o-sel td-o-an" value={nhap[d.id]?.dvt ?? d.dvt} aria-label="Đơn vị tính"
          onChange={e => setNhap(n => ({ ...n, [d.id]: { ...n[d.id], dvt: e.target.value } }))} ds={ds2.filter(x => !dung.has(x.ten)).map(x => ({ v: x.ten, t: x.ten }))} /></span>
      }
      case 'nhom': return <span className="td-ten">{d.nhom}</span>
      case 'sl': case 'gia': {
        const f: 'sl' | 'gia' = k
        if (!goDuoc(d)) return <OSo v={d[f]} />
        const t = nhap[d.id]?.[f] ?? (d[f] == null ? '' : String(d[f]))
        return <input className="inp sm td-o-so td-o-an" inputMode="decimal" aria-label={f === 'sl' ? 'Số lượng' : 'Đơn giá'}
          value={t === '' ? '' : soQT(t)} onChange={e => setNhap(n => ({ ...n, [d.id]: { ...n[d.id], [f]: nhapSoQT(e.target.value) } }))} />
      }
      case 'tien': {
        if (!goDuoc(d)) return d.tien == null ? '' : <b>{money(d.tien)}</b>
        const sl = soNhap(d, 'sl'), gia = soNhap(d, 'gia')
        return sl != null && gia != null ? <b>{money(sl * gia)}</b> : ''
      }
    }
  }
  const cols = cot.colsHien
  // ĐVT mà các dòng khác của cùng mặt hàng đang dùng (dòng chưa có tồn không tính)
  const dvtDaDung = (d: DongTonDau) => new Set(ds.filter(x => x.ma === d.ma && x.id !== d.id && (x.co || laMoi(x))).map(x => nhap[x.id]?.dvt ?? x.dvt))
  const apLoc = () => { loc0.loc(); setTich(new Set()) }
  // Tìm kiếm và Kho hàng hiện ngoài thanh, Nhóm hàng hoá và Hàng hoá nằm trong Bộ lọc nâng cao (phễu)
  const oLoc: OLocDef[] = [
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhapLoc.tim.trim()), o: <input className="ds-o-inp" value={nhapLoc.tim} placeholder="Nhập mã hoặc tên hàng hoá" aria-label="Tìm hàng hoá"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    { k: 'kho', ten: 'Kho hàng', o: <Select className="ds-o-sel" value={kho} aria-label="Kho hàng" onChange={e => doiKho(e.target.value)} ds={DS_KHO} /> },
    { k: 'nhom', ten: 'Nhóm hàng hoá', coGiaTri: Boolean(nhapLoc.nhom), o: <Select className="ds-o-sel" value={nhapLoc.nhom} aria-label="Nhóm hàng hoá" onChange={e => dat('nhom', e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...dsNhom]} /> },
    { k: 'hang', ten: 'Hàng hoá', coGiaTri: Boolean(nhapLoc.hang), o: <Select className="ds-o-sel" value={nhapLoc.hang} aria-label="Hàng hoá" onChange={e => dat('hang', e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...dsMatHang.map(d => ({ v: d.ma, t: d.ten }))]} /> },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc('/kho/5-1-12', oLoc.map(x => x.k), ['tim', 'kho'])
  const lenhHien = LENH[chip].filter(l => tich.size > 0 || !CAN_TICH.includes(l))   // Xoá, Sao chép chỉ hiện khi đã tích dòng

  return (
    <div className="page page-voucher page-dm">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)} code={sc.code} />
      <section className="card td-khung">
        <div className="ds-toolbar-figma">
          <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
            onLoc={apLoc} onXoaHet={loc0.xoaNhap} chiNutPheu
            ngoaiRieng={{
              tim: (
                <div key="tim" className="ds-tim-figma">
                  <IconFigmaSearch size={16} />
                  <input value={nhapLoc.tim} placeholder="Nhập mã hoặc tên hàng hoá" aria-label="Tìm hàng hoá"
                    onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />
                </div>
              ),
            }} />
          <div className="ds-toolbar-phai">
          {coThayDoi ? <>
            <button type="button" className="btn" onClick={huyNhap}>Huỷ</button>
            <button type="button" className="btn pri" onClick={luuNhap}>Lưu</button>
          </> : <button type="button" className="btn" onClick={batSua}>Sửa</button>}
          <div className="td-tach">
            <button type="button" className="btn pri td-tach-chu" onClick={themMoi}>Thêm mới</button>
            {lenhHien.length > 0 && (
              <Dropdown btnClass="btn pri td-tach-mui" align="end" width={220} title="Thêm thao tác" label={<Icon n="chevd" className="ic sm" />}>
                {dong => lenhHien.map(l => <MenuItem key={l} danger={l === 'xoa'} onClick={() => { dong(); chay(l) }}>{TEN_LENH[l]}</MenuItem>)}
              </Dropdown>
            )}
          </div>
          </div>
        </div>

        <div className="td-chip-hang">
          <div className="td-chips">
            {CHIP.map(c => (
              <button key={c.k} type="button" className={`td-chip${chip === c.k ? ' on' : ''}`} aria-pressed={chip === c.k} onClick={() => doiChip(c.k)}>
                <span className={`td-cham ${c.k}`} />{c.t}<span className="td-dem">{locChip(ds, c.k).length}</span>
              </button>
            ))}
          </div>
          <div className="td-cong-cu">
            <NutExcel
              onNhap={() => { setKhoNhap(kho); setMoNhapExcel(true) }}
              onXuat={async () => {
                const dongCo = ds.filter(d => d.co)
                await taiDuLieuTonDau(s, kho)
                toast(`Đã xuất ${dongCo.length} dòng ra Excel`)
              }}
            />
            <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang} onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
          </div>
        </div>

        {tich.size > 0 && (
          <div className="td-da-chon"><b>Đã chọn {tich.size} dòng</b><button type="button" className="td-bo-chon" onClick={() => setTich(new Set())}>Bỏ chọn</button></div>
        )}

        <div className="tbl-wrap td-bang-cuon">
          <table className="tbl td-bang">
            <thead>
              <tr>
                <th className="c td-cot-tich"><input type="checkbox" aria-label="Chọn tất cả dòng đang hiện" checked={tichHet} onChange={() => setTich(tichHet ? new Set() : new Set(hien.map(d => d.id)))} /></th>
                <th className="c td-cot-stt">#</th>
                {cols.map(c => <th key={c.k} className={`td-cot-${c.k}${c.num ? ' num' : ''}`}>{c.t}</th>)}
              </tr>
              <tr className="loc-hang">
                <th /><th />
                {cols.map(c => <th key={c.k}><OLoc c={c} loc={loc} /></th>)}
              </tr>
            </thead>
            <tbody>
              {hien.map((d, i) => (
                <tr key={d.id} className={tich.has(d.id) ? 'dang-chon' : undefined}>
                  <td className="c"><input type="checkbox" aria-label={`Chọn ${d.ten}`} checked={tich.has(d.id)} onChange={() => doiTich(d.id)} /></td>
                  <td className="c muted">{i + 1}</td>
                  {cols.map(c => <td key={c.k} className={c.num ? 'num' : c.k === 'dvt' || c.k === 'nhom' ? 'td-mot-dong' : undefined}>{o(d, c.k)}</td>)}
                </tr>
              ))}
              {!hien.length && <tr><td colSpan={cols.length + 2} className="c muted td-rong">Không có mặt hàng nào ở {kho} khớp chip và bộ lọc.</td></tr>}
            </tbody>
            <tfoot>
              <tr className="sum">
                <td /><td />
                {cols.map((c, i) => <td key={c.k} className={c.num ? 'num' : undefined}>
                  {c.k === 'sl' ? soQT(hien.reduce((a, d) => a + (d.sl ?? 0), 0)) : c.k === 'tien' ? money(hien.reduce((a, d) => a + (d.tien ?? 0), 0)) : i === 0 ? 'Tổng cộng' : ''}
                </td>)}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {hop?.loai === 'chep' && <HopChepTonDau kho={kho} dsKho={dsKhoHien} ma={hop.ma} onDong={dongHop} />}
      {hop?.loai === 'xoa' && <HopXoaTonDau kho={kho} ma={hop.ma} onDong={dongHop} />}
      {moChon && (
        <ThemHangLoat
          ds={dsMatHang.map(d => ({ ma: d.ma, ten: d.ten, dvt: d.dvt, nhom: d.nhom, loai: d.ma.startsWith('NVL') ? 'Nguyên vật liệu' : 'Hàng hoá' }))}
          daCo={ds.filter(d => d.co).map(d => d.ma)} nhanDaCo={`Đã có tồn đầu ở ${kho}`} tieuDe="Thêm mới" chonLaiDaCo
          onDong={() => setMoChon(false)}
          onXacNhan={chon => {
            if (!chon.length) return
            const moi: DongTonDau[] = [], day: string[] = []
            for (const h of chon) {
              // Hàng đã có dòng thì thêm dòng mới với ĐVT chưa dùng
              const dung = new Set([...ds, ...moi].filter(d => d.ma === h.ma && (d.co || laMoi(d))).map(d => nhap[d.id]?.dvt ?? d.dvt))
              const dvt = dvtCuaHang(h.ma).find(x => !dung.has(x.ten))
              const goc = ds.find(d => d.ma === h.ma)
              if (!dvt || !goc) { day.push(h.ten); continue }
              moi.push({ id: `moi:${++demMoi.current}`, ma: h.ma, ten: goc.ten, nhom: goc.nhom, nhomMa: goc.nhomMa, dvt: dvt.ten, dvtMa: dvt.ma, sl: null, gia: null, tien: null, xem: false, co: true })
            }
            if (moi.length) { setDongMoi(t => [...t, ...moi]); setChip('co') }
            toast(day.length ? `${day.join(', ')}: đã dùng hết đơn vị tính, không thêm được dòng` : `Đã thêm ${moi.length} dòng, nhập số lượng và đơn giá ngay trên bảng`)
          }}
        />
      )}
      {khoa && <HopKhoaTonDau lyDo={khoa} onDong={() => setKhoa(null)} />}
      {moNhapExcel && (
        <HopNhapExcel
          onDong={() => setMoNhapExcel(false)}
          boHam={{
            tieuDe: 'Nhập tồn kho ban đầu từ Excel',
            tenNgan: 'Tồn kho ban đầu',
            tenThuong: 'tồn kho ban đầu',
            taiMau: () => taiMauTonDau(s, khoNhap),
            taiDuLieu: () => taiDuLieuTonDau(s, khoNhap),
            kiemFile: (f: File) => kiemFileNhapTonDau(f, khoNhap),
            ghi: (k, bao) => ghiTonDau(khoNhap, k, bao),
            taiLoi: k => taiFileLoiTonDau(s, k),
            khoKey: khoNhap,
            lyDoChan: moTaKhoaTonDau(khoaTonDau(khoNhap)),
            thongBaoXong: k => `Đã nhập ${k.moi.length + k.sua.length} dòng tồn kho ban đầu`,
            noiDungThemB1: (
              <div className="nxh-chon-kho">
                <label className="nxh-chon-kho-nhan">
                  <span>Chọn kho cần nhập</span>
                  <Select
                    className="inp"
                    value={khoNhap}
                    onChange={e => setKhoNhap(e.target.value)}
                    aria-label="Chọn kho cần nhập"
                    ds={DS_KHO}
                  />
                </label>
              </div>
            ),
          }}
        />
      )}
    </div>
  )
}
