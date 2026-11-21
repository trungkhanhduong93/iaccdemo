// Tồn kho ban đầu mẫu C (T880, thay màn sửa tại chỗ T736): chọn đúng 1 kho, 3 chip Có tồn đầu, Không có tồn đầu, Cần xem lại; bảng chỉ xem,
// sửa qua modal Thiết lập hàng loạt; nút Thêm mới tách đôi: chữ mở Thiết lập với mặt hàng chưa có tồn đầu, mũi tên mở lệnh theo chip.
// Kho đã kiểm kê hoặc đã khoá sổ thì bấm lệnh nào cũng chỉ hiện thông báo khoá (Trum chốt 18/11/2026). Mẫu: backup/mau-T879/NhomLo.dc.html
import { useMemo, useState } from 'react'
import type { Col, ScreenProps } from '../types'
import { KHO } from '../../data/mock'
import { Dropdown, MenuItem, Select } from '../../ui/Dropdown'
import { NutTuyChinhCot, useCotDs } from '../../ui/LocNangCao'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { NutExcel } from '../../ui/CongCuDs'
import { PageHead } from '../../ui/Page'
import { Icon } from '../../ui/Icon'
import { useSession } from '../../app/session'
import { tenMan } from '../../app/registry'
import { fold, money, soQT } from '../../ui/format'
import { NGAY_SO_DU, dsTonDau, giaNhapGanNhat, khoaTonDau, locChip, luuTonDau, useTonDau, type DongTonDau, type LyDoKhoa, type TrangThaiTd } from './ton-dau'
import { HopChepTonDau, HopKhoaTonDau, HopThietLapTonDau, HopXoaTonDau } from './HopTonDau'
import { HopNhapExcel, type BoHamNhap } from '../../ui/generic/HopNhapExcel'
import { taiMauTonDau, taiDuLieuTonDau, kiemFileNhapTonDau, ghiTonDau, taiFileLoiTonDau, moTaKhoaTonDau } from './nhapTonDauExcel'

const COLS: Col[] = [
  { k: 'ma', t: 'Mã hàng' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'nhom', t: 'Nhóm hàng hoá' },
  { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true },
]
const COT_CO_DINH = new Set(['ma', 'ten'])
const CHIP: { k: TrangThaiTd; t: string }[] = [{ k: 'co', t: 'Có tồn đầu' }, { k: 'chua', t: 'Không có tồn đầu' }, { k: 'xem', t: 'Cần xem lại' }]
type Lenh = 'xoa' | 'thiet-lap' | 'chep' | 'gia'
const LENH: Record<TrangThaiTd, Lenh[]> = { co: ['xoa', 'thiet-lap', 'chep'], chua: ['thiet-lap', 'gia'], xem: ['gia', 'xoa'] }
const TEN_LENH: Record<Lenh, string> = { xoa: 'Xoá hàng loạt', 'thiet-lap': 'Thiết lập hàng loạt', chep: 'Chép sang kho khác', gia: 'Lấy giá nhập gần nhất' }
const DS_KHO = KHO.map(k => ({ v: k, t: k }))
const maTen = (ma: string, ten: string) => <><span className="td-ma">{ma ? `${ma} - ` : ''}</span><span className="td-ten">{ten}</span></>

/** Ô số chỉ xem: trống thì "-", dòng thiếu một nửa thì nhãn vàng */
function OSo({ v, thieu, nhan }: { v: number | null; thieu: boolean; nhan: string }) {
  if (v != null) return <>{soQT(v)}</>
  return thieu ? <span className="td-nhan-thieu">{nhan}</span> : <span className="td-trong">-</span>
}

export function TonKhoBanDau({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const phienBan = useTonDau()
  const [kho, setKho] = useState(KHO[0])
  const [khoNhap, setKhoNhap] = useState(KHO[0])
  const [moNhapExcel, setMoNhapExcel] = useState(false)
  const [chip, setChip] = useState<TrangThaiTd>('co')
  const [q, setQ] = useState(''), [nhom, setNhom] = useState(''), [hang, setHang] = useState('')
  const [ap, setAp] = useState({ q: '', nhom: '', hang: '' })   // bộ lọc chỉ áp khi bấm Lọc
  const [tich, setTich] = useState<Set<string>>(new Set())
  const [hop, setHop] = useState<{ loai: 'thiet-lap' | 'chep' | 'xoa'; ma: string[]; tichSan: boolean } | null>(null)
  const [khoa, setKhoa] = useState<LyDoKhoa | null>(null)
  const cot = useCotDs('/kho/5-1-12', COLS, COT_CO_DINH)

  const ds = useMemo(() => dsTonDau(kho), [kho, phienBan])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsNhom = useMemo(() => [...new Map(ds.map(d => [d.nhom, d.nhomMa])).entries()].map(([t, m]) => ({ v: t, t: m ? `${m} - ${t}` : t })), [ds])
  const hien = useMemo(() => locChip(ds, chip).filter(d =>
    (!ap.nhom || d.nhom === ap.nhom) && (!ap.hang || d.ma === ap.hang) && (!ap.q.trim() || fold(`${d.ma} ${d.ten}`).includes(fold(ap.q.trim())))), [ds, chip, ap])
  const tichHet = hien.length > 0 && hien.every(d => tich.has(d.ma))
  const doiTich = (ma: string) => setTich(t => { const n = new Set(t); if (n.has(ma)) n.delete(ma); else n.add(ma); return n })
  const doiKho = (k: string) => { setKho(k); setTich(new Set()) }
  const doiChip = (c: TrangThaiTd) => { setChip(c); setTich(new Set()) }
  const dongHop = () => { setHop(null); setTich(new Set()) }

  // Mọi lệnh thay đổi tồn đầu đi qua đây: kho khoá thì chỉ báo lý do
  const khoKhoa = () => { const l = khoaTonDau(kho); if (l) setKhoa(l); return l !== null }
  const themMoi = () => { if (!khoKhoa()) setHop({ loai: 'thiet-lap', ma: locChip(ds, 'chua').map(d => d.ma), tichSan: false }) }
  const chay = (l: Lenh) => {
    if (khoKhoa()) return
    const ma = hien.filter(d => tich.has(d.ma)).map(d => d.ma)
    if (!ma.length) { toast('Tích chọn dòng trước'); return }
    if (l === 'gia') {
      const dong = ds.filter(d => ma.includes(d.ma))
      luuTonDau(kho, dong.map(d => ({ ma: d.ma, dvt: d.dvt, sl: d.sl, gia: giaNhapGanNhat(d.ma, kho) })))
      setTich(new Set())
      toast(`Đã lấy giá nhập gần nhất cho ${ma.length} mã hàng`)
      return
    }
    setHop({ loai: l, ma, tichSan: true })
  }

  const o = (d: DongTonDau, k: string) => {
    switch (k) {
      case 'ma': return <span className="td-mau-body">{d.ma}</span>
      case 'ten': return <span className="td-ten-hang">{d.ten}</span>
      case 'dvt': return maTen(d.dvtMa, d.dvt)
      case 'nhom': return maTen(d.nhomMa, d.nhom)
      case 'sl': return <OSo v={d.sl} thieu={d.xem} nhan="Thiếu số lượng" />
      case 'gia': return <OSo v={d.gia} thieu={d.xem} nhan="Thiếu đơn giá" />
      case 'tien': return d.tien == null ? '' : <b>{money(d.tien)}</b>
    }
  }
  const cols = cot.colsHien

  return (
    <div className="page page-voucher page-dm">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)} code={sc.code} meta={<span className="muted">Số dư tại ngày <b className="td-ngay">{NGAY_SO_DU}</b></span>} />
      <section className="card td-khung">
        <div className="td-loc">
          <label className="td-loc-o td-loc-tim"><IconFigmaSearch size={15} />
            <input value={q} placeholder="Nhập mã hoặc tên hàng hoá" aria-label="Tìm hàng hoá" onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setAp({ q, nhom, hang }) }} />
          </label>
          <label className="td-loc-o"><span>Kho hàng</span><Select className="td-loc-chon b" value={kho} onChange={e => doiKho(e.target.value)} aria-label="Kho hàng" ds={DS_KHO} /></label>
          <label className="td-loc-o td-loc-nhom"><span>Nhóm hàng hoá</span>
            <Select className="td-loc-chon" value={nhom} onChange={e => setNhom(e.target.value)} aria-label="Nhóm hàng hoá" ds={[{ v: '', t: 'Chọn nhóm hàng hoá' }, ...dsNhom]} />
          </label>
          <label className="td-loc-o"><span>Hàng hoá</span>
            <Select className="td-loc-chon" value={hang} onChange={e => setHang(e.target.value)} aria-label="Hàng hoá" ds={[{ v: '', t: 'Chọn hàng hoá' }, ...ds.map(d => ({ v: d.ma, t: d.ten }))]} />
          </label>
          <button type="button" className="btn pri td-nut-loc" onClick={() => setAp({ q, nhom, hang })}>Lọc</button>
          <span className="td-gian" />
          <div className="td-tach">
            <button type="button" className="btn pri td-tach-chu" onClick={themMoi}>Thêm mới</button>
            <Dropdown btnClass="btn pri td-tach-mui" align="end" width={220} title="Thêm thao tác" label={<Icon n="chevd" className="ic sm" />}>
              {dong => LENH[chip].map(l => <MenuItem key={l} danger={l === 'xoa'} onClick={() => { dong(); chay(l) }}>{TEN_LENH[l]}</MenuItem>)}
            </Dropdown>
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
                <th className="c td-cot-tich"><input type="checkbox" aria-label="Chọn tất cả dòng đang hiện" checked={tichHet} onChange={() => setTich(tichHet ? new Set() : new Set(hien.map(d => d.ma)))} /></th>
                <th className="c td-cot-stt">#</th>
                {cols.map(c => <th key={c.k} className={`td-cot-${c.k}${c.num ? ' num' : ''}`}>{c.t}</th>)}
              </tr>
            </thead>
            <tbody>
              {hien.map((d, i) => (
                <tr key={d.ma} className={tich.has(d.ma) ? 'dang-chon' : d.xem ? 'td-xem' : undefined}>
                  <td className="c"><input type="checkbox" aria-label={`Chọn ${d.ten}`} checked={tich.has(d.ma)} onChange={() => doiTich(d.ma)} /></td>
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

      {hop?.loai === 'thiet-lap' && <HopThietLapTonDau kho={kho} ma={hop.ma} tichSan={hop.tichSan} onDong={dongHop} />}
      {hop?.loai === 'chep' && <HopChepTonDau kho={kho} ma={hop.ma} onDong={dongHop} />}
      {hop?.loai === 'xoa' && <HopXoaTonDau kho={kho} ma={hop.ma} onDong={dongHop} />}
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
